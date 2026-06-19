from fastapi import Query
from sqlalchemy.orm import Query as SAQuery
from pydantic import BaseModel
from typing import TypeVar, Generic, List, Tuple, Any

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_prev: bool


def paginate(
    db_query: Any,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
) -> Tuple[List[Any], int]:
    total = db_query.count()
    items = db_query.offset((page - 1) * page_size).limit(page_size).all()
    return items, total
