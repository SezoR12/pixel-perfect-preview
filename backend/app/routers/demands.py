from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Demand, User
from app.schemas import DemandCreate, DemandRead
from app.security import get_current_user

router = APIRouter(prefix="/api/demands", tags=["demands"])


@router.post("/", response_model=DemandRead, status_code=status.HTTP_201_CREATED)
def create_demand(
    demand_in: DemandCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    demand = Demand(**demand_in.model_dump(), user_id=current_user.id)
    db.add(demand)
    db.commit()
    db.refresh(demand)
    return demand


@router.get("/", response_model=list[DemandRead])
def list_demands(
    category: str | None = None,
    country: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Demand).filter(Demand.is_active == True)
    if category:
        query = query.filter(Demand.category.ilike(f"%{category}%"))
    if country:
        query = query.filter(Demand.location.ilike(f"%{country}%"))
    return query.order_by(Demand.created_at.desc()).all()


@router.get("/{demand_id}", response_model=DemandRead)
def get_demand(demand_id: int, db: Session = Depends(get_db)):
    demand = db.query(Demand).filter(Demand.id == demand_id).first()
    if not demand:
        raise HTTPException(status_code=404, detail="Demand not found")
    return demand


@router.put("/{demand_id}", response_model=DemandRead)
def update_demand(
    demand_id: int,
    demand_in: DemandCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    demand = db.query(Demand).filter(Demand.id == demand_id, Demand.user_id == current_user.id).first()
    if not demand:
        raise HTTPException(status_code=404, detail="Demand not found")
    for key, value in demand_in.model_dump().items():
        setattr(demand, key, value)
    db.commit()
    db.refresh(demand)
    return demand


@router.delete("/{demand_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_demand(
    demand_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    demand = db.query(Demand).filter(Demand.id == demand_id, Demand.user_id == current_user.id).first()
    if not demand:
        raise HTTPException(status_code=404, detail="Demand not found")
    demand.is_active = False
    db.commit()
    return None
