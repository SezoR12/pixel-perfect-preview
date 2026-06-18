from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import KYCVerification, KYCStatus, User
from app.schemas import KYCSubmission, KYCRead, KYCReview
from app.security import get_current_user, get_current_active_user

router = APIRouter(prefix="/api/kyc", tags=["kyc"])


@router.post("/submit", response_model=KYCRead, status_code=status.HTTP_201_CREATED)
def submit_kyc(
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
    return kyc


@router.get("/status", response_model=KYCRead)
def get_kyc_status(
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
        raise HTTPException(status_code=404, detail="No KYC submission found")
    return kyc


@router.get("/pending", response_model=List[KYCRead])
def list_pending_kyc(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Simple admin check: only users with "admin" in email for demo
    if "admin" not in current_user.email:
        raise HTTPException(status_code=403, detail="Admin access required")
    return db.query(KYCVerification).filter(KYCVerification.status == KYCStatus.SUBMITTED).all()


@router.post("/{kyc_id}/review", response_model=KYCRead)
def review_kyc(
    kyc_id: int,
    review: KYCReview,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if "admin" not in current_user.email:
        raise HTTPException(status_code=403, detail="Admin access required")
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
    return kyc
