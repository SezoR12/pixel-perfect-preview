from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import WaitlistEntry
from app.schemas import WaitlistEntryCreate, WaitlistEntryRead

router = APIRouter(prefix="/waitlist", tags=["waitlist"])


@router.post("/", response_model=WaitlistEntryRead, status_code=status.HTTP_201_CREATED)
def join_waitlist(entry_in: WaitlistEntryCreate, db: Session = Depends(get_db)):
    existing = db.query(WaitlistEntry).filter(WaitlistEntry.email == entry_in.email).first()
    if existing:
        return existing

    entry = WaitlistEntry(email=entry_in.email, source="landing_page")
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/", response_model=list[WaitlistEntryRead])
def list_waitlist(db: Session = Depends(get_db)):
    return db.query(WaitlistEntry).order_by(WaitlistEntry.created_at.desc()).all()
