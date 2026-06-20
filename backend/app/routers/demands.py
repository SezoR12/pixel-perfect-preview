from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Demand, User
from app.schemas import DemandCreate, DemandRead
from app.security import get_current_user, require_ownership
from app.audit import log_audit_event
from app.pagination import PaginatedResponse, paginate

router = APIRouter(prefix="/demands", tags=["demands"])


@router.post("/", response_model=DemandRead, status_code=status.HTTP_201_CREATED)
async def create_demand(
    request: Request,
    demand_in: DemandCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    demand = Demand(**demand_in.model_dump(), user_id=current_user.id)
    db.add(demand)
    db.commit()
    db.refresh(demand)
    
    log_audit_event(
        event_type="DEMAND_CREATE",
        user_id=current_user.id,
        resource_type="demand",
        resource_id=demand.id,
        action="create",
        details={"product_name": demand.product_name, "budget": str(demand.budget)},
        ip_address=request.client.host if request.client else None,
    )
    return demand


@router.get("/", response_model=PaginatedResponse[DemandRead])
async def list_demands(
    category: Optional[str] = None,
    country: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Demand).filter(Demand.is_active == True)
    if category:
        query = query.filter(Demand.category.ilike(f"%{category}%"))
    if country:
        query = query.filter(Demand.location.ilike(f"%{country}%"))
        
    query = query.order_by(Demand.created_at.desc())
    items, total = paginate(query, page, page_size)
    
    return PaginatedResponse[DemandRead](
        items=[DemandRead.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
        has_next=page * page_size < total,
        has_prev=page > 1,
    )


@router.get("/{demand_id}", response_model=DemandRead)
async def get_demand(demand_id: int, db: Session = Depends(get_db)):
    demand = db.query(Demand).filter(Demand.id == demand_id).first()
    if not demand:
        raise HTTPException(status_code=404, detail="Active Buyer purchasing inquiry Demand not found")
    return demand


@router.put("/{demand_id}", response_model=DemandRead)
async def update_demand(
    request: Request,
    demand_id: int,
    demand_in: DemandCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    demand = db.query(Demand).filter(Demand.id == demand_id).first()
    if not demand:
        raise HTTPException(status_code=404, detail="Demand not found")
        
    require_ownership(demand.user_id, current_user)
    
    for key, value in demand_in.model_dump().items():
        setattr(demand, key, value)
    db.commit()
    db.refresh(demand)
    
    log_audit_event(
        event_type="DEMAND_UPDATE",
        user_id=current_user.id,
        resource_type="demand",
        resource_id=demand.id,
        action="update",
        details={"new_budget": str(demand.budget)},
        ip_address=request.client.host if request.client else None,
    )
    return demand


@router.delete("/{demand_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_demand(
    request: Request,
    demand_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    demand = db.query(Demand).filter(Demand.id == demand_id).first()
    if not demand:
        raise HTTPException(status_code=404, detail="Demand not found")
        
    require_ownership(demand.user_id, current_user)
    
    demand.is_active = False
    db.commit()
    
    log_audit_event(
        event_type="DEMAND_DELETE",
        user_id=current_user.id,
        resource_type="demand",
        resource_id=demand.id,
        action="delete",
        details={"product_name": demand.product_name},
        ip_address=request.client.host if request.client else None,
    )
    return None
