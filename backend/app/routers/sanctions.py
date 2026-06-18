from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import SanctionsScreening, User
from app.schemas import SanctionsScreenRequest, SanctionsScreenResult
from app.security import get_current_user

router = APIRouter(prefix="/api/compliance/sanctions", tags=["sanctions"])


# Demo SDN-like list (in production, fetch from OFAC/EU/UN APIs)
SANCTIONS_LIST = [
    "IRAN OIL COMPANY",
    "BANK OF IRAN",
    "IRANIAN MINISTRY OF DEFENSE",
    "KHATAM-AL ANBIYA",
    "BONYAD MOSTAZAFAN",
]


def _screen_name(name: str) -> tuple[bool, str]:
    upper = name.upper()
    for sanctioned in SANCTIONS_LIST:
        if sanctioned in upper or upper in sanctioned:
            return True, f"Matched against demo sanctions list: {sanctioned}"
    return False, "No match found"


@router.post("/screen", response_model=SanctionsScreenResult)
def screen_entity(
    request: SanctionsScreenRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    match_found, details = _screen_name(request.entity_name)
    screening = SanctionsScreening(
        user_id=current_user.id,
        entity_type=request.entity_type,
        entity_name=request.entity_name,
        screened_against="demo_sanctions_list",
        match_found=match_found,
        match_details=details,
        review_status="pending" if match_found else "cleared",
    )
    db.add(screening)

    if request.entity_type == "user" and not match_found:
        current_user.sanctions_screened = True
        current_user.sanctions_screened_at = datetime.utcnow()

    db.commit()
    db.refresh(screening)
    return screening


@router.get("/my-screenings", response_model=List[SanctionsScreenResult])
def my_screenings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(SanctionsScreening).filter(SanctionsScreening.user_id == current_user.id).all()
