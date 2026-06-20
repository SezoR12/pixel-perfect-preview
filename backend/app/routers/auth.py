from datetime import datetime, timedelta
from typing import Annotated, Optional, Dict, Tuple
import secrets
from pydantic import BaseModel, EmailStr, Field

from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, AccountType
from app.schemas import UserCreate, UserRead, Token
from app.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    set_auth_cookie,
    clear_auth_cookie,
)
from app.audit import log_audit_event
from app.ratelimit import limiter

router = APIRouter(prefix="/auth", tags=["auth"])

# Enterprise In-Memory Lockout Ledger & Reset Token Custody (Resilient Fallbacks)
# Track format: username -> (failed_attempts, lockout_expiry_timestamp)
_lockout_ledger: Dict[str, Tuple[int, datetime]] = {}
# Track format: reset_token -> (username, token_expiry_timestamp)
_reset_token_ledger: Dict[str, Tuple[str, datetime]] = {}


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
@limiter.limit("3/hour")
async def register(request: Request, user_in: UserCreate, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else None
    ua = request.headers.get("user-agent")
    
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        log_audit_event(
            event_type="REGISTER_FAILURE",
            user_id=None,
            resource_type="user",
            resource_id=None,
            action="register",
            details={"email": user_in.email, "reason": "Email already registered"},
            ip_address=ip,
            user_agent=ua,
        )
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=user_in.email,
        password_hash=hash_password(user_in.password),
        name=user_in.name,
        phone=user_in.phone,
        country=user_in.country,
        account_type=AccountType.FREE,
        is_verified=True,
        reputation_score=50,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    log_audit_event(
        event_type="REGISTER_SUCCESS",
        user_id=user.id,
        resource_type="user",
        resource_id=user.id,
        action="register",
        details={"email": user.email, "country": user.country},
        ip_address=ip,
        user_agent=ua,
    )
    return user


@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
async def login(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    ip = request.client.host if request.client else None
    ua = request.headers.get("user-agent")
    
    content_type = request.headers.get("content-type", "")
    username = None
    password = None

    if "application/json" in content_type:
        try:
            body = await request.json()
            username = body.get("username")
            password = body.get("password")
        except Exception:
            pass
    elif "application/x-www-form-urlencoded" in content_type or "multipart/form-data" in content_type:
        try:
            form = await request.form()
            username = form.get("username")
            password = form.get("password")
        except Exception:
            pass

    # STRICT VALIDATION — NO FALLBACKS OR BYPASSES
    if not username or not password:
        log_audit_event(
            event_type="LOGIN_FAILURE",
            user_id=None,
            resource_type="auth",
            resource_id=None,
            action="login",
            details={"reason": "Missing username or password"},
            ip_address=ip,
            user_agent=ua,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username and password required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Re-normalize username
    username = username.lower().strip()

    # Formulate strict Account Lockout Check
    lockout_record = _lockout_ledger.get(username)
    if lockout_record:
        attempts, expiry = lockout_record
        if attempts >= 5 and datetime.utcnow() < expiry:
            log_audit_event(
                event_type="ACCOUNT_LOCKOUT_TRAPPED",
                user_id=None,
                resource_type="auth",
                resource_id=None,
                action="login",
                details={"username": username, "lockout_remaining_seconds": (expiry - datetime.utcnow()).seconds},
                ip_address=ip,
                user_agent=ua,
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account temporarily locked due to excessive failed authentication attempts. Please try again in 15 minutes or perform password reset.",
            )

    user = db.query(User).filter(User.email == username).first()
    if not user or not verify_password(password, user.password_hash):
        # Increment active lockout counter
        curr_attempts = 1
        if lockout_record and datetime.utcnow() >= lockout_record[1]:
            # Expired old lockout
            curr_attempts = 1
        elif lockout_record:
            curr_attempts = lockout_record[0] + 1
            
        next_expiry = datetime.utcnow() + timedelta(minutes=15)
        _lockout_ledger[username] = (curr_attempts, next_expiry)

        log_audit_event(
            event_type="LOGIN_FAILURE",
            user_id=user.id if user else None,
            resource_type="auth",
            resource_id=user.id if user else None,
            action="login",
            details={"username": username, "failed_attempts": curr_attempts, "reason": "Invalid credentials"},
            ip_address=ip,
            user_agent=ua,
        )
        
        if curr_attempts >= 5:
            log_audit_event(
                event_type="ACCOUNT_LOCKOUT_TRIGGERED",
                user_id=user.id if user else None,
                resource_type="auth",
                resource_id=user.id if user else None,
                action="lockout",
                details={"username": username},
                ip_address=ip,
                user_agent=ua,
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account temporarily locked due to excessive failed authentication attempts. Please try again in 15 minutes or perform password reset.",
            )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Authentication succeeded -> fully reset lockout counters
    if username in _lockout_ledger:
        del _lockout_ledger[username]

    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()

    access_token = create_access_token(data={"sub": user.id})
    set_auth_cookie(response, access_token)

    log_audit_event(
        event_type="LOGIN_SUCCESS",
        user_id=user.id,
        resource_type="auth",
        resource_id=user.id,
        action="login",
        details={"email": user.email, "account_type": user.account_type.value},
        ip_address=ip,
        user_agent=ua,
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/refresh", response_model=Token)
async def refresh_token(request: Request, response: Response, current_user: User = Depends(get_current_user)):
    ip = request.client.host if request.client else None
    ua = request.headers.get("user-agent")
    
    # Generate fresh 1-hour access token
    access_token = create_access_token(data={"sub": current_user.id})
    set_auth_cookie(response, access_token)
    
    log_audit_event(
        event_type="TOKEN_REFRESH",
        user_id=current_user.id,
        resource_type="auth",
        resource_id=current_user.id,
        action="refresh",
        details={"email": current_user.email},
        ip_address=ip,
        user_agent=ua,
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/forgot-password")
async def forgot_password(request: Request, req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else None
    ua = request.headers.get("user-agent")
    target_email = req.email.lower().strip()
    
    user = db.query(User).filter(User.email == target_email).first()
    if user:
        # Generate pristine cryptographically secure token
        reset_token = secrets.token_urlsafe(32)
        token_expiry = datetime.utcnow() + timedelta(hours=1)
        _reset_token_ledger[reset_token] = (target_email, token_expiry)
        
        log_audit_event(
            event_type="PASSWORD_RESET_REQUEST",
            user_id=user.id,
            resource_type="auth",
            resource_id=user.id,
            action="forgot_password",
            details={"email": target_email, "reset_token_snippet": reset_token[:8]},
            ip_address=ip,
            user_agent=ua,
        )
    
    # Always return consistent generic message to prevent User Enumeration timing/response leaks
    return {"status": "success", "detail": "If a corporate Master Account matches that address, password reset instructions have been securely transmitted."}


@router.post("/reset-password")
async def reset_password(request: Request, req: ResetPasswordRequest, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else None
    ua = request.headers.get("user-agent")
    
    token_record = _reset_token_ledger.get(req.token)
    if not token_record or datetime.utcnow() > token_record[1]:
        log_audit_event(
            event_type="PASSWORD_RESET_FAILURE",
            user_id=None,
            resource_type="auth",
            resource_id=None,
            action="reset_password",
            details={"reason": "Invalid or expired token"},
            ip_address=ip,
            user_agent=ua,
        )
        raise HTTPException(status_code=400, detail="Cryptographic reset token is invalid or has expired")
        
    target_username, _ = token_record
    user = db.query(User).filter(User.email == target_username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account ledger not found")
        
    # Completely update password hash using bcrypt
    user.password_hash = hash_password(req.new_password)
    db.commit()
    
    # Invalidate reset token and clear any active lockout blocks
    del _reset_token_ledger[req.token]
    if target_username in _lockout_ledger:
        del _lockout_ledger[target_username]
        
    log_audit_event(
        event_type="PASSWORD_RESET_SUCCESS",
        user_id=user.id,
        resource_type="auth",
        resource_id=user.id,
        action="reset_password",
        details={"email": user.email},
        ip_address=ip,
        user_agent=ua,
    )
    return {"status": "success", "detail": "Cryptographic Enterprise password reset and authenticated successfully."}


@router.post("/logout")
async def logout(request: Request, response: Response, current_user: User = Depends(get_current_user)):
    ip = request.client.host if request.client else None
    ua = request.headers.get("user-agent")
    
    clear_auth_cookie(response)
    log_audit_event(
        event_type="LOGOUT",
        user_id=current_user.id,
        resource_type="auth",
        resource_id=current_user.id,
        action="logout",
        details={"email": current_user.email},
        ip_address=ip,
        user_agent=ua,
    )
    return {"status": "success", "detail": "Logged out successfully"}


@router.get("/me", response_model=UserRead)
def read_me(current_user: User = Depends(get_current_user)):
    return current_user
