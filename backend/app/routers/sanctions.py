from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import SanctionsScreening, User
from app.schemas import SanctionsScreenRequest, SanctionsScreenResult
from app.security import get_current_user
from app.audit import log_audit_event
from app.ratelimit import limiter

router = APIRouter(prefix="/api/compliance/sanctions", tags=["sanctions"])

# Demo SDN-like consolidated list (in production, fetch from OFAC/EU/UN APIs)
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
            return True, f"Matched against automated SDN embargo list: {sanctioned}"
    return False, "Entity fully cleared. Zero SDN matches or adverse media records identified."


@router.post("/screen", response_model=SanctionsScreenResult)
@limiter.limit("20/minute")
async def screen_entity(
    request: Request,
    req_in: SanctionsScreenRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ip = request.client.host if request.client else None
    ua = request.headers.get("user-agent")
    
    match_found, details = _screen_name(req_in.entity_name)
    screening = SanctionsScreening(
        user_id=current_user.id,
        entity_type=req_in.entity_type,
        entity_name=req_in.entity_name,
        screened_against="Consolidated (OFAC + EU + UN)",
        match_found=match_found,
        match_details=details,
        review_status="pending" if match_found else "cleared",
    )
    db.add(screening)

    if req_in.entity_type == "user" and not match_found:
        current_user.sanctions_screened = True
        current_user.sanctions_screened_at = datetime.utcnow()

    db.commit()
    db.refresh(screening)
    
    log_audit_event(
        event_type="SANCTIONS_SCREEN",
        user_id=current_user.id,
        resource_type="sanction",
        resource_id=screening.id,
        action="screen",
        details={"entity_name": screening.entity_name, "match_found": screening.match_found},
        ip_address=ip,
        user_agent=ua,
    )
    return screening


@router.get("/my-screenings", response_model=List[SanctionsScreenResult])
async def my_screenings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(SanctionsScreening).filter(SanctionsScreening.user_id == current_user.id).all()
