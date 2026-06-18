from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import UserRead, DashboardStats
from app.security import get_current_user

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me", response_model=UserRead)
def read_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/dashboard", response_model=DashboardStats)
def dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.models import Product, Demand, PreDeal, DealStatus

    total_products = db.query(Product).filter(Product.user_id == current_user.id).count()
    total_demands = db.query(Demand).filter(Demand.user_id == current_user.id).count()
    active_pre_deals = (
        db.query(PreDeal)
        .filter(
            ((PreDeal.seller_id == current_user.id) | (PreDeal.buyer_id == current_user.id)),
            PreDeal.status == DealStatus.PENDING,
        )
        .count()
    )
    accepted_deals = (
        db.query(PreDeal)
        .filter(
            ((PreDeal.seller_id == current_user.id) | (PreDeal.buyer_id == current_user.id)),
            PreDeal.status == DealStatus.ACCEPTED,
        )
        .count()
    )
    from app.models import Order, OrderStatus

    active_orders = (
        db.query(Order)
        .filter(
            ((Order.seller_id == current_user.id) | (Order.buyer_id == current_user.id)),
            Order.status.in_(["pending", "confirmed", "payment_pending", "paid", "in_transit"]),
        )
        .count()
    )
    return DashboardStats(
        total_products=total_products,
        total_demands=total_demands,
        active_pre_deals=active_pre_deals,
        accepted_deals=accepted_deals,
        active_orders=active_orders,
    )
