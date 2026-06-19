from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import KYCVerification, KYCStatus, User
from app.schemas import KYCSubmission, KYCRead, KYCReview
from app.security import get_current_user, get_current_active_user, require_ownership
from app.audit import log_audit_event

router = APIRouter(prefix="/api/kyc", tags=["kyc"])


@router.post("/submit", response_model=KYCRead, status_code=status.HTTP_201_CREATED)
async def submit_kyc(
    request: Request,
    kyc_in: KYCSubmission,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = (
        db.query(KYCVerification)
        .filter(
            KYCVerification.user_id == current_user.id,
            KYCVerification.status.in_([KYCStatus.SUBMITTED, KYCStatus.IN_REVIEW, KYCStatus.APPROVED]),
        )
        .first()
    )
    if existing and existing.status == KYCStatus.APPROVED:
        raise HTTPException(status_code=400, detail="KYC already approved")

    kyc = KYCVerification(
        user_id=current_user.id,
        status=KYCStatus.SUBMITTED,
        document_type=kyc_in.document_type,
        document_url=kyc_in.document_url,
        document_hash=kyc_in.document_hash,
        next_review_date=datetime.utcnow() + timedelta(days=365),
    )
    db.add(kyc)
    db.commit()
    db.refresh(kyc)
    
    log_audit_event(
        event_type="KYC_SUBMIT",
        user_id=current_user.id,
        resource_type="kyc",
        resource_id=kyc.id,
        action="submit",
        details={"document_type": kyc.document_type, "document_hash": kyc.document_hash},
        ip_address=request.client.host if request.client else None,
    )
    return kyc


@router.get("/status", response_model=KYCRead)
async def get_kyc_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    kyc = (
        db.query(KYCVerification)
        .filter(KYCVerification.user_id == current_user.id)
        .order_by(KYCVerification.submitted_at.desc())
        .first()
    )
    if not kyc:
        raise HTTPException(status_code=404, detail="No active corporate KYC submission found")
    return kyc


@router.get("/pending", response_model=List[KYCRead])
async def list_pending_kyc(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if "admin" not in current_user.email and current_user.account_type.value != "black":
        raise HTTPException(status_code=403, detail="Accredited Compliance Officer admin role required")
    return db.query(KYCVerification).filter(KYCVerification.status == KYCStatus.SUBMITTED).all()


@router.post("/{kyc_id}/review", response_model=KYCRead)
async def review_kyc(
    request: Request,
    kyc_id: int,
    review: KYCReview,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if "admin" not in current_user.email and current_user.account_type.value != "black":
        raise HTTPException(status_code=403, detail="Accredited Compliance Officer admin role required")
        
    kyc = db.query(KYCVerification).filter(KYCVerification.id == kyc_id).first()
    if not kyc:
        raise HTTPException(status_code=404, detail="KYC not found")

    kyc.status = KYCStatus.APPROVED if review.status == "approved" else KYCStatus.REJECTED
    kyc.rejection_reason = review.rejection_reason if review.status == "rejected" else None
    kyc.reviewed_by = current_user.id
    kyc.reviewed_at = datetime.utcnow()

    user = db.query(User).filter(User.id == kyc.user_id).first()
    if kyc.status == KYCStatus.APPROVED:
        user.kyc_status = KYCStatus.APPROVED
        user.is_verified = True
    else:
        user.kyc_status = KYCStatus.REJECTED

    db.commit()
    db.refresh(kyc)
    
    log_audit_event(
        event_type="KYC_REVIEW",
        user_id=current_user.id,
        resource_type="kyc",
        resource_id=kyc.id,
        action=review.status,
        details={"applicant_id": user.id, "rejection_reason": kyc.rejection_reason},
        ip_address=request.client.host if request.client else None,
    )
    return kyc
