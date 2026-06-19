from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import LetterOfCredit, DocumentaryCollection, LCStatus, DPStatus, Order, User
from app.schemas import LCCreate, LCRead, LCAction, DPCreate, DPRead, DPAction
from app.security import get_current_user

router = APIRouter(prefix="/api/trade-finance", tags=["trade_finance"])


# 1. Letter of Credit Endpoints
@router.post("/lc", response_model=LCRead, status_code=status.HTTP_201_CREATED)
def create_lc(
    lc_in: LCCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == lc_in.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Associated order not found")

    count = db.query(LetterOfCredit).count()
    lc = LetterOfCredit(
        lc_number=f"LC-SWIFT-2026-{count + 1:05d}",
        order_id=order.id,
        applicant_id=order.buyer_id,
        beneficiary_id=order.seller_id,
        issuing_bank=lc_in.issuing_bank,
        advising_bank=lc_in.advising_bank,
        amount=lc_in.amount,
        currency=lc_in.currency,
        expiry_date=datetime.utcnow() + timedelta(days=lc_in.expiry_days),
        status=LCStatus.ISSUED,
    )
    db.add(lc)
    db.commit()
    db.refresh(lc)
    return lc


@router.get("/lc", response_model=List[LCRead])
def list_lcs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(LetterOfCredit)
        .filter((LetterOfCredit.applicant_id == current_user.id) | (LetterOfCredit.beneficiary_id == current_user.id))
        .order_by(LetterOfCredit.created_at.desc())
        .all()
    )


@router.post("/lc/{lc_id}/action", response_model=LCRead)
def act_on_lc(
    lc_id: int,
    action: LCAction,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    lc = db.query(LetterOfCredit).filter(LetterOfCredit.id == lc_id).first()
    if not lc:
        raise HTTPException(status_code=404, detail="Letter of credit record not found")

    if action.action == "advise":
        lc.status = LCStatus.ADVISED
    elif action.action == "present":
        lc.status = LCStatus.DOCUMENTS_PRESENTED
        lc.documents_presented_at = datetime.utcnow()
    elif action.action == "discrepancy":
        lc.status = LCStatus.DISCREPANCIES
        lc.discrepancy_notes = action.notes or "Standard discrepancy identified in SWIFT MT734."
    elif action.action == "clean":
        lc.status = LCStatus.CLEAN_PRESENTATION
        lc.discrepancy_notes = None
    elif action.action == "settle":
        lc.status = LCStatus.SETTLED
        lc.settled_at = datetime.utcnow()
    elif action.action == "cancel":
        lc.status = LCStatus.CANCELLED

    db.commit()
    db.refresh(lc)
    return lc


# 2. Documentary Collection (D/P) Endpoints
@router.post("/dp", response_model=DPRead, status_code=status.HTTP_201_CREATED)
def create_dp(
    dp_in: DPCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == dp_in.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Associated order not found")

    count = db.query(DocumentaryCollection).count()
    dp = DocumentaryCollection(
        dp_number=f"DP-COLLECT-2026-{count + 1:05d}",
        order_id=order.id,
        exporter_id=order.seller_id,
        importer_id=order.buyer_id,
        remitting_bank=dp_in.remitting_bank,
        collecting_bank=dp_in.collecting_bank,
        amount=dp_in.amount,
        currency=dp_in.currency,
        status=DPStatus.SENT_TO_COLLECTING_BANK,
    )
    db.add(dp)
    db.commit()
    db.refresh(dp)
    return dp


@router.get("/dp", response_model=List[DPRead])
def list_dps(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(DocumentaryCollection)
        .filter((DocumentaryCollection.exporter_id == current_user.id) | (DocumentaryCollection.importer_id == current_user.id))
        .order_by(DocumentaryCollection.created_at.desc())
        .all()
    )


@router.post("/dp/{dp_id}/action", response_model=DPRead)
def act_on_dp(
    dp_id: int,
    action: DPAction,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    dp = db.query(DocumentaryCollection).filter(DocumentaryCollection.id == dp_id).first()
    if not dp:
        raise HTTPException(status_code=404, detail="Documentary Collection record not found")

    if action.action == "present":
        dp.status = DPStatus.PRESENTED_TO_IMPORTER
    elif action.action == "pay":
        dp.status = DPStatus.PAID
    elif action.action == "send":
        dp.status = DPStatus.DOCUMENTS_RELEASED
        dp.documents_released_at = datetime.utcnow()
    elif action.action == "reject":
        dp.status = DPStatus.REJECTED

    db.commit()
    db.refresh(dp)
    return dp
