from datetime import datetime
from decimal import Decimal
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Order, OrderItem, PreDeal, DealStatus, Payment, PaymentStatus, PaymentMethod, User
from app.schemas import OrderCreate, OrderRead, PaymentCreate, PaymentRead, PaymentAction
from app.security import get_current_user

router = APIRouter(prefix="/api/orders", tags=["orders"])


def _generate_order_number(db: Session) -> str:
    count = db.query(Order).count()
    return f"TUR-2026-{count + 1:06d}"


@router.post("/", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
def create_order(
    order_in: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    pre_deal = db.query(PreDeal).filter(PreDeal.id == order_in.pre_deal_id).first()
    if not pre_deal:
        raise HTTPException(status_code=404, detail="Pre-deal not found")
    if pre_deal.seller_id != current_user.id and pre_deal.buyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if pre_deal.status != DealStatus.ACCEPTED:
        raise HTTPException(status_code=400, detail="Pre-deal must be accepted by both parties")

    # Commission based on seller tier
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
    total = pre_deal.suggested_price * pre_deal.quantity
    platform_fee = total * rate

    order = Order(
        order_number=_generate_order_number(db),
        pre_deal_id=pre_deal.id,
        buyer_id=pre_deal.buyer_id,
        seller_id=pre_deal.seller_id,
        status="pending",
        payment_status="pending",
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
    db.refresh(order)
    return order


@router.get("/", response_model=List[OrderRead])
def list_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    orders = (
        db.query(Order)
        .filter((Order.buyer_id == current_user.id) | (Order.seller_id == current_user.id))
        .order_by(Order.created_at.desc())
        .all()
    )
    return orders


@router.get("/{order_id}", response_model=OrderRead)
def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.buyer_id != current_user.id and order.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return order


@router.post("/{order_id}/payments", response_model=PaymentRead)
def create_payment(
    order_id: int,
    payment_in: PaymentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.buyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only buyer can initiate payment")

    payment = Payment(
        order_id=order.id,
        payer_id=order.buyer_id,
        payee_id=order.seller_id,
        method=payment_in.method,
        amount=payment_in.amount,
        currency=payment_in.currency,
        status=PaymentStatus.HELD if payment_in.method == "Escrow" else PaymentStatus.PENDING,
        processor="platform_escrow" if payment_in.method == "Escrow" else "stripe",
        escrow_release_condition="delivery_confirmed" if payment_in.method == "Escrow" else None,
    )
    db.add(payment)
    order.payment_status = PaymentStatus.HELD if payment_in.method == "Escrow" else PaymentStatus.PENDING
    order.status = "confirmed" if payment_in.method == "Escrow" else "payment_pending"
    db.commit()
    db.refresh(payment)
    return payment


@router.post("/{order_id}/payments/{payment_id}/action")
def act_on_payment(
    order_id: int,
    payment_id: int,
    action: PaymentAction,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    payment = db.query(Payment).filter(Payment.id == payment_id, Payment.order_id == order_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    if action.action == "pay":
        if order.buyer_id != current_user.id:
            raise HTTPException(status_code=403, detail="Only buyer can pay")
        payment.status = PaymentStatus.HELD
        order.payment_status = PaymentStatus.HELD
        order.status = "confirmed"
    elif action.action == "release":
        # In real app, would require delivery confirmation or admin
        payment.status = PaymentStatus.RELEASED
        payment.escrow_released_at = datetime.utcnow()
        order.payment_status = PaymentStatus.RELEASED
        order.status = "completed"
        order.completed_at = datetime.utcnow()
    elif action.action == "refund":
        payment.status = PaymentStatus.REFUNDED
        order.payment_status = PaymentStatus.REFUNDED
        order.status = "cancelled"

    db.commit()
    db.refresh(payment)
    return {"status": payment.status.value, "payment_id": payment.id}
