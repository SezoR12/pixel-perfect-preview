from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Shipment, ShipmentEvent, ShipmentStatus, Order, User
from app.schemas import ShipmentCreate, ShipmentRead, ShipmentEventCreate
from app.security import get_current_user, require_ownership
from app.audit import log_audit_event
from app.pagination import PaginatedResponse, paginate

router = APIRouter(prefix="/api/logistics/shipments", tags=["shipments"])


@router.post("/", response_model=ShipmentRead, status_code=status.HTTP_201_CREATED)
async def create_shipment(
    request: Request,
    ship_in: ShipmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == ship_in.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    require_ownership(order.seller_id, current_user)

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
    
    log_audit_event(
        event_type="SHIPMENT_CREATE",
        user_id=current_user.id,
        resource_type="shipment",
        resource_id=ship.id,
        action="create",
        details={"tracking_number": ship.tracking_number, "carrier": ship.carrier},
        ip_address=request.client.host if request.client else None,
    )
    return ship


@router.get("/", response_model=PaginatedResponse[ShipmentRead])
async def list_shipments(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Shipment)
        .join(Order, Order.id == Shipment.order_id)
        .filter((Order.buyer_id == current_user.id) | (Order.seller_id == current_user.id))
        .order_by(Shipment.created_at.desc())
    )
    items, total = paginate(query, page, page_size)
    
    return PaginatedResponse[ShipmentRead](
        items=[ShipmentRead.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
        has_next=page * page_size < total,
        has_prev=page > 1,
    )


@router.get("/{shipment_id}", response_model=ShipmentRead)
async def get_shipment(
    shipment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ship = (
        db.query(Shipment)
        .join(Order, Order.id == Shipment.order_id)
        .filter(Shipment.id == shipment_id)
        .first()
    )
    if not ship:
        raise HTTPException(status_code=404, detail="Shipment not found")
        
    order = db.query(Order).filter(Order.id == ship.order_id).first()
    if order.buyer_id != current_user.id and order.seller_id != current_user.id and current_user.account_type.value != "black":
        raise HTTPException(status_code=403, detail="Not authorized to inspect tracking telemetry")
    return ship


@router.post("/{shipment_id}/events", response_model=ShipmentRead)
async def add_tracking_event(
    request: Request,
    shipment_id: int,
    evt_in: ShipmentEventCreate,
    next_status: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ship = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not ship:
        raise HTTPException(status_code=404, detail="Shipment not found")
        
    order = db.query(Order).filter(Order.id == ship.order_id).first()
    if order.seller_id != current_user.id and current_user.account_type.value != "black":
        raise HTTPException(status_code=403, detail="Only authorized counterparty entities or carriers can transmit tracking telemetry")

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
    
    log_audit_event(
        event_type="SHIPMENT_EVENT",
        user_id=current_user.id,
        resource_type="shipment",
        resource_id=ship.id,
        action="add_event",
        details={"location": evt.location, "new_status": ship.status.value},
        ip_address=request.client.host if request.client else None,
    )
    return ship
