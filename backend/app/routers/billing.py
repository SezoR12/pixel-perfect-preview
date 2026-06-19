from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Subscription, SubscriptionStatus, User, AccountType
from app.schemas import SubscriptionRead, SubscriptionCreate
from app.security import get_current_user

router = APIRouter(prefix="/api/billing", tags=["billing"])


@router.get("/my-subscription", response_model=Optional[SubscriptionRead])
def my_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sub = db.query(Subscription).filter(Subscription.user_id == current_user.id).first()
    return sub


@router.post("/create-checkout-session", response_model=SubscriptionRead)
def create_checkout_session(
    sub_in: SubscriptionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        tier_enum = AccountType(sub_in.tier)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid tier level")

    # In production, this creates a Stripe Checkout Session via stripe.checkout.Session.create()
    # For our interactive preview, we immediately authenticate the upgrade
    sub = db.query(Subscription).filter(Subscription.user_id == current_user.id).first()
    if not sub:
        sub = Subscription(
            user_id=current_user.id,
            stripe_customer_id=f"cus_mock_2026_{current_user.id}",
            stripe_subscription_id=f"sub_mock_2026_{datetime.utcnow().timestamp()}",
            tier=tier_enum,
            status=SubscriptionStatus.ACTIVE,
            current_period_end=datetime.utcnow() + timedelta(days=30),
        )
        db.add(sub)
    else:
        sub.tier = tier_enum
        sub.status = SubscriptionStatus.ACTIVE
        sub.current_period_end = datetime.utcnow() + timedelta(days=30)

    # Update current user tier
    current_user.account_type = tier_enum
    db.commit()
    db.refresh(sub)
    return sub


@router.post("/cancel-subscription")
def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sub = db.query(Subscription).filter(Subscription.user_id == current_user.id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="No active subscription found")

    sub.status = SubscriptionStatus.CANCELED
    current_user.account_type = AccountType.FREE
    db.commit()
    return {"status": "canceled", "tier_reverted": "free"}
