from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Shipment, ShipmentEvent, ShipmentStatus, Order, User
from app.schemas import ShipmentCreate, ShipmentRead, ShipmentEventCreate
from app.security import get_current_user

router = APIRouter(prefix="/api/logistics/shipments", tags=["shipments"])


@router.post("/", response_model=ShipmentRead, status_code=status.HTTP_201_CREATED)
def create_shipment(
    ship_in: ShipmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == ship_in.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    count = db.query(Shipment).count()
    tracking_number = f"TRK-{ship_in.carrier.upper()}-2026-{count + 1:06d}"

    ship = Shipment(
        order_id=order.id,
        tracking_number=tracking_number,
        carrier=ship_in.carrier,
        origin_corridor=ship_in.origin_corridor,
        destination_corridor=ship_in.destination_corridor,
        status=ShipmentStatus.LABEL_CREATED,
        estimated_delivery=datetime.utcnow() + timedelta(days=14),
    )
    db.add(ship)
    db.commit()
    db.refresh(ship)

    # Initial event
    evt = ShipmentEvent(
        shipment_id=ship.id,
        location=f"Logistics Node — {ship_in.origin_corridor}",
        description="Electronic shipping manifest transmitted to carrier. Container booking locked.",
    )
    db.add(evt)
    db.commit()
    db.refresh(ship)
    return ship


@router.get("/", response_model=List[ShipmentRead])
def list_shipments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Join with Order to return user shipments
    return (
        db.query(Shipment)
        .join(Order, Order.id == Shipment.order_id)
        .filter((Order.buyer_id == current_user.id) | (Order.seller_id == current_user.id))
        .order_by(Shipment.created_at.desc())
        .all()
    )


@router.get("/{shipment_id}", response_model=ShipmentRead)
def get_shipment(
    shipment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ship = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not ship:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return ship


@router.post("/{shipment_id}/events", response_model=ShipmentRead)
def add_tracking_event(
    shipment_id: int,
    evt_in: ShipmentEventCreate,
    next_status: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ship = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not ship:
        raise HTTPException(status_code=404, detail="Shipment not found")

    status_enum = ShipmentStatus(next_status) if next_status in [s.value for s in ShipmentStatus] else ship.status

    evt = ShipmentEvent(
        shipment_id=ship.id,
        location=evt_in.location,
        description=evt_in.description,
    )
    db.add(evt)
    ship.status = status_enum
    db.commit()
    db.refresh(ship)
    return ship
