from datetime import datetime
from typing import Annotated, Optional
from pydantic import BaseModel

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

router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginJson(BaseModel):
    username: str
    password: str


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
@limiter.limit("3/hour")
async def register(request: Request, user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        log_audit_event(
            event_type="REGISTER_FAILURE",
            user_id=None,
            resource_type="user",
            resource_id=None,
            action="register",
            details={"email": user_in.email, "reason": "Email already registered"},
            ip_address=request.client.host if request.client else None,
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
        ip_address=request.client.host if request.client else None,
    )
    return user


@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
async def login(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
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
            ip_address=request.client.host if request.client else None,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username and password required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.email == username).first()
    if not user or not verify_password(password, user.password_hash):
        log_audit_event(
            event_type="LOGIN_FAILURE",
            user_id=user.id if user else None,
            resource_type="auth",
            resource_id=user.id if user else None,
            action="login",
            details={"username": username, "reason": "Invalid credentials"},
            ip_address=request.client.host if request.client else None,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

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
        ip_address=request.client.host if request.client else None,
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/logout")
async def logout(request: Request, response: Response, current_user: User = Depends(get_current_user)):
    clear_auth_cookie(response)
    log_audit_event(
        event_type="LOGOUT",
        user_id=current_user.id,
        resource_type="auth",
        resource_id=current_user.id,
        action="logout",
        details={"email": current_user.email},
        ip_address=request.client.host if request.client else None,
    )
    return {"status": "success", "detail": "Logged out successfully"}


@router.get("/me", response_model=UserRead)
def read_me(current_user: User = Depends(get_current_user)):
    return current_user
