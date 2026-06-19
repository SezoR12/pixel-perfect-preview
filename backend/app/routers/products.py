from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Product, User
from app.schemas import ProductCreate, ProductRead
from app.security import get_current_user, require_ownership
from app.audit import log_audit_event
from app.pagination import PaginatedResponse, paginate
from app.validators import sanitize_string

router = APIRouter(prefix="/api/products", tags=["products"])


@router.post("/", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
async def create_product(
    request: Request,
    product_in: ProductCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = Product(**product_in.model_dump(), user_id=current_user.id)
    db.add(product)
    db.commit()
    db.refresh(product)
    
    log_audit_event(
        event_type="PRODUCT_CREATE",
        user_id=current_user.id,
        resource_type="product",
        resource_id=product.id,
        action="create",
        details={"name": product.name, "price": str(product.price)},
        ip_address=request.client.host if request.client else None,
    )
    return product


@router.get("/", response_model=PaginatedResponse[ProductRead])
async def list_products(
    search: Optional[str] = None,
    category: Optional[str] = None,
    country: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    try:
        if search:
            sanitize_string(search)
    except ValueError:
        raise HTTPException(status_code=400, detail="Malicious SQL / XSS input identified in search query")

    query = db.query(Product).filter(Product.is_available == True)
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))
    if category:
        query = query.filter(Product.category.ilike(f"%{category}%"))
    if country:
        query = query.filter(Product.origin.ilike(f"%{country}%"))
        
    query = query.order_by(Product.created_at.desc())
    items, total = paginate(query, page, page_size)
    
    return PaginatedResponse[ProductRead](
        items=[ProductRead.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
        has_next=page * page_size < total,
        has_prev=page > 1,
    )


@router.get("/{product_id}", response_model=ProductRead)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Commodity Product specification not found")
    return product


@router.put("/{product_id}", response_model=ProductRead)
async def update_product(
    request: Request,
    product_id: int,
    product_in: ProductCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    require_ownership(product.user_id, current_user)
    
    for key, value in product_in.model_dump().items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    
    log_audit_event(
        event_type="PRODUCT_UPDATE",
        user_id=current_user.id,
        resource_type="product",
        resource_id=product.id,
        action="update",
        details={"new_price": str(product.price)},
        ip_address=request.client.host if request.client else None,
    )
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    request: Request,
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    require_ownership(product.user_id, current_user)
    
    product.is_available = False
    db.commit()
    
    log_audit_event(
        event_type="PRODUCT_DELETE",
        user_id=current_user.id,
        resource_type="product",
        resource_id=product.id,
        action="delete",
        details={"product_name": product.name},
        ip_address=request.client.host if request.client else None,
    )
    return None
