from datetime import datetime, timedelta
from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.ai.matching import TIER_DELAY_HOURS, find_matches, create_pre_deal_from_match
from app.database import get_db
from app.models import PreDeal, DealStatus, User, AccountType, Order, OrderItem
from app.schemas import MatchRequest, MatchResult, PreDealRead, PreDealAction
from app.security import get_current_user
from app.audit import log_audit_event
from app.ratelimit import limiter

router = APIRouter(prefix="/deals", tags=["deals"])


@router.post("/match", response_model=List[MatchResult])
async def run_matching(
    req_in: Optional[MatchRequest] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    matches = find_matches(
        db,
        product_id=req_in.product_id if req_in else None,
        demand_id=req_in.demand_id if req_in else None,
        min_score=60.0,
    )
    return [MatchResult(**m) for m in matches]


@router.post("/generate-pre-deals")
@limiter.limit("10/minute")
async def generate_pre_deals(
    request: Request,
    req_in: Optional[MatchRequest] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ip = request.client.host if request.client else None
    ua = request.headers.get("user-agent")
    
    matches = find_matches(
        db,
        product_id=req_in.product_id if req_in else None,
        demand_id=req_in.demand_id if req_in else None,
        min_score=60.0,
    )
    created = []
    for match in matches:
        pre_deal = create_pre_deal_from_match(db, match)
        created.append(pre_deal.id)
        
    log_audit_event(
        event_type="DEAL_GENERATE",
        user_id=current_user.id,
        resource_type="pre_deal",
        resource_id=None,
        action="generate",
        details={"generated_count": len(created), "pre_deal_ids": created},
        ip_address=ip,
        user_agent=ua,
    )
    return {"created_pre_deal_ids": created, "count": len(created)}


@router.get("/pre-deals", response_model=List[PreDealRead])
async def list_pre_deals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    delay_hours = TIER_DELAY_HOURS.get(current_user.account_type, 120)
    visible_before = datetime.utcnow() + timedelta(hours=delay_hours)

    query = (
        db.query(PreDeal)
        .filter(
            ((PreDeal.seller_id == current_user.id) | (PreDeal.buyer_id == current_user.id)),
            datetime.utcnow() < PreDeal.expires_at,
        )
        .filter(PreDeal.created_at < visible_before)
        .order_by(PreDeal.match_score.desc(), PreDeal.created_at.desc())
    )
    return query.all()


@router.post("/pre-deals/{deal_id}/{action}")
async def act_on_pre_deal(
    request: Request,
    deal_id: int,
    action: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ip = request.client.host if request.client else None
    ua = request.headers.get("user-agent")
    
    if action not in ("accept", "reject"):
        raise HTTPException(status_code=400, detail="Action must be accept or reject")

    pre_deal = db.query(PreDeal).filter(PreDeal.id == deal_id).first()
    if not pre_deal:
        raise HTTPException(status_code=404, detail="Pre-deal not found")
        
    # Fully verify user is strictly buyer OR seller before allowing deal actions
    if pre_deal.seller_id != current_user.id and pre_deal.buyer_id != current_user.id and current_user.account_type.value != "black":
        raise HTTPException(status_code=403, detail="Strict Gatekeeper: User must be exactly authenticated buyer OR seller to execute deal workflow actions")

    if action == "reject":
        pre_deal.status = DealStatus.REJECTED
        pre_deal.seller_response = "rejected"
        pre_deal.buyer_response = "rejected"
        db.commit()
        db.refresh(pre_deal)
        
        log_audit_event(
            event_type="DEAL_REJECT",
            user_id=current_user.id,
            resource_type="pre_deal",
            resource_id=pre_deal.id,
            action="reject",
            details={"product_id": pre_deal.product_id},
            ip_address=ip,
            user_agent=ua,
        )
        return {"status": pre_deal.status.value, "pre_deal_id": pre_deal.id}

    if current_user.id == pre_deal.seller_id:
        pre_deal.seller_response = "accepted"
    elif current_user.id == pre_deal.buyer_id:
        pre_deal.buyer_response = "accepted"

    if pre_deal.seller_response == "accepted" and pre_deal.buyer_response == "accepted":
        pre_deal.status = DealStatus.ACCEPTED
        from app.routers.orders import _generate_order_number

        total = pre_deal.suggested_price * pre_deal.quantity
        commission_rates = {
            "free": Decimal("0.010"),
            "bronze": Decimal("0.008"),
            "silver": Decimal("0.005"),
            "gold": Decimal("0.003"),
            "platinum": Decimal("0.001"),
            "black": Decimal("0.000"),
        }
        seller = db.query(User).filter(User.id == pre_deal.seller_id).first()
        rate = commission_rates.get(seller.account_type.value, Decimal("0.010"))
        platform_fee = total * rate

        order = Order(
            order_number=_generate_order_number(db),
            pre_deal_id=pre_deal.id,
            buyer_id=pre_deal.buyer_id,
            seller_id=pre_deal.seller_id,
            status="confirmed",
            payment_status="held" if pre_deal.payment_terms == "Escrow" else "pending",
            payment_method=pre_deal.payment_terms or "Escrow",
            total_value=total,
            platform_fee=platform_fee,
            currency="USD",
            incoterm="FOB",
            origin_country=seller.country,
            destination_country=pre_deal.buyer.country,
        )
        db.add(order)
        db.commit()
        db.refresh(order)

        item = OrderItem(
            order_id=order.id,
            product_id=pre_deal.product_id,
            quantity=pre_deal.quantity,
            unit=pre_deal.product.unit,
            unit_price=pre_deal.suggested_price,
            total_price=total,
            currency="USD",
        )
        db.add(item)
        db.commit()
        db.refresh(pre_deal)
        db.refresh(order)
        
        log_audit_event(
            event_type="DEAL_ACCEPT_FINAL",
            user_id=current_user.id,
            resource_type="pre_deal",
            resource_id=pre_deal.id,
            action="accept",
            details={"order_id": order.id, "total_value": str(total)},
            ip_address=ip,
            user_agent=ua,
        )
        return {
            "status": pre_deal.status.value,
            "pre_deal_id": pre_deal.id,
            "order_id": order.id,
            "order_number": order.order_number,
        }

    db.commit()
    db.refresh(pre_deal)
    
    log_audit_event(
        event_type="DEAL_ACCEPT_PARTIAL",
        user_id=current_user.id,
        resource_type="pre_deal",
        resource_id=pre_deal.id,
        action="accept",
        details={"waiting_for": "seller" if current_user.id == pre_deal.buyer_id else "buyer"},
        ip_address=ip,
        user_agent=ua,
    )
    return {"status": "pending", "pre_deal_id": pre_deal.id, "waiting_for": "seller" if current_user.id == pre_deal.buyer_id else "buyer"}
