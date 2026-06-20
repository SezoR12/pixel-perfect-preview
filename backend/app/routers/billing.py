from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Subscription, SubscriptionStatus, User, AccountType
from app.schemas import SubscriptionRead, SubscriptionCreate
from app.security import get_current_user
from app.audit import log_audit_event
from app.ratelimit import limiter

router = APIRouter(prefix="/billing", tags=["billing"])


@router.get("/my-subscription", response_model=Optional[SubscriptionRead])
async def my_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sub = db.query(Subscription).filter(Subscription.user_id == current_user.id).first()
    return sub


@router.post("/create-checkout-session", response_model=SubscriptionRead)
@limiter.limit("3/minute")
async def create_checkout_session(
    request: Request,
    sub_in: SubscriptionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ip = request.client.host if request.client else None
    ua = request.headers.get("user-agent")
    
    try:
        tier_enum = AccountType(sub_in.tier)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid tier level")

    sub = db.query(Subscription).filter(Subscription.user_id == current_user.id).first()
    if not sub:
        sub = Subscription(
            user_id=current_user.id,
            stripe_customer_id=f"cus_mock_2026_{current_user.id}",
            stripe_subscription_id=f"sub_{tier_enum.value}_tier_{datetime.utcnow().timestamp()}",
            tier=tier_enum,
            status=SubscriptionStatus.ACTIVE,
            current_period_end=datetime.utcnow() + timedelta(days=30),
        )
        db.add(sub)
    else:
        sub.tier = tier_enum
        sub.status = SubscriptionStatus.ACTIVE
        sub.current_period_end = datetime.utcnow() + timedelta(days=30)

    current_user.account_type = tier_enum
    db.commit()
    db.refresh(sub)
    
    log_audit_event(
        event_type="SUBSCRIPTION_CHECKOUT",
        user_id=current_user.id,
        resource_type="subscription",
        resource_id=sub.id,
        action="upgrade",
        details={"new_tier": sub.tier.value},
        ip_address=ip,
        user_agent=ua,
    )
    return sub


@router.post("/cancel-subscription")
@limiter.limit("3/minute")
async def cancel_subscription(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ip = request.client.host if request.client else None
    ua = request.headers.get("user-agent")
    
    sub = db.query(Subscription).filter(Subscription.user_id == current_user.id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="No active subscription found")

    old_tier = sub.tier.value
    sub.status = SubscriptionStatus.CANCELED
    current_user.account_type = AccountType.FREE
    db.commit()
    
    log_audit_event(
        event_type="SUBSCRIPTION_CANCEL",
        user_id=current_user.id,
        resource_type="subscription",
        resource_id=sub.id,
        action="cancel",
        details={"reverted_from_tier": old_tier},
        ip_address=ip,
        user_agent=ua,
    )
    return {"status": "canceled", "tier_reverted": "free"}
