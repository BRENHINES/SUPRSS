from fastapi import APIRouter, Depends, Query, HTTPException, status, Response
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..schemas.category import CategoryCreate, CategoryUpdate, CategoryOut
from ..services.category_service import CategoryService
from ..repositories.category import CategoryRepository
from ..api.deps import require_admin
from ..schemas.common import PageMeta


from sqlalchemy import select, func
from ..api.deps import get_current_user
from ..models.feed import Feed
from ..models.feed import FeedCategory
from ..schemas.feed import FeedOut

router = APIRouter(prefix="/api/categories", tags=["Categories"])

@router.post("", response_model=CategoryOut, status_code=201, dependencies=[Depends(require_admin)])
def create_category(data: CategoryCreate, db: Session = Depends(get_db)):
    return CategoryService(db).create(
        name=data.name, color=data.color, icon=data.icon, description=data.description
    )

@router.get("", response_model=list[CategoryOut])
def list_categories(
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    items, total = CategoryRepository(db).list_paginated(search=search, page=page, size=size)
    # si tu veux, ajoute X-Total-Count dans la réponse via Response comme pour users
    return items

@router.get("/{category_id}", response_model=CategoryOut)
def get_category(category_id: int, db: Session = Depends(get_db)):
    cat = CategoryRepository(db).get_by_id(category_id)
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return cat

@router.patch("/{category_id}", response_model=CategoryOut, dependencies=[Depends(require_admin)])
def update_category(category_id: int, data: CategoryUpdate, db: Session = Depends(get_db)):
    return CategoryService(db).update(
        category_id,
        name=data.name,
        color=data.color,
        icon=data.icon,
        description=data.description,
    )

@router.delete("/{category_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_category(category_id: int, db: Session = Depends(get_db)):
    CategoryService(db).delete(category_id)
    return

@router.get("/{category_id}/feeds", response_model=list[FeedOut])
def list_feeds_for_category(
    category_id: int,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    response: Response = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    cat = CategoryRepository(db).get_by_id(category_id)
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    base = select(Feed).join(FeedCategory, FeedCategory.feed_id == Feed.id)\
                       .where(FeedCategory.category_id == category_id)

    total = db.scalar(select(func.count()).select_from(base.subquery()))
    items = db.scalars(
        base.order_by(Feed.created_at.desc())
            .offset((page - 1) * size)
            .limit(size)
    ).all()

    if response is not None:
        response.headers["X-Total-Count"] = str(total or 0)
    return items
