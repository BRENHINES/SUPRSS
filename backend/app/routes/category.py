from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..api.deps import get_current_user, require_admin
from ..core.database import get_db
from ..models.feed import Feed, FeedCategory
from ..repositories.category import CategoryRepository
from ..schemas.category import (
    CategoryCreate,
    CategoryOut,
    CategoryUpdate,
    CategoryWithCountOut,
)
from ..schemas.common import PageMeta
from ..schemas.feed import FeedOut
from ..services.category_service import CategoryService

router = APIRouter(prefix="/api/categories", tags=["Categories"])


@router.post(
    "",
    response_model=CategoryOut,
    status_code=201,
    dependencies=[Depends(get_current_user)],
)
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
    items, total = CategoryRepository(db).list_paginated(
        search=search, page=page, size=size
    )
    # si tu veux, ajoute X-Total-Count dans la réponse via Response comme pour users
    return items


@router.get(
    "/summary",
    response_model=list[CategoryWithCountOut],
    operation_id="categories_list_with_counts",
)
def list_categories_with_counts(
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    response: Response = ...,
    db: Session = Depends(get_db),
):
    items, total = CategoryService(db).list_with_counts(
        search=search, page=page, size=size
    )
    response.headers["X-Total-Count"] = str(total)
    return items


@router.get(
    "/by-name/{name}", response_model=CategoryOut, operation_id="categories_get_by_name"
)
def get_category_by_name(name: str, db: Session = Depends(get_db)):
    return CategoryService(db).get_by_name(name)


@router.get("/{category_id:int}", response_model=CategoryOut)
def get_category(category_id: int, db: Session = Depends(get_db)):
    cat = CategoryRepository(db).get_by_id(category_id)
    if not cat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Category not found"
        )
    return cat


@router.patch(
    "/{category_id:int}",
    response_model=CategoryOut,
    dependencies=[Depends(require_admin)],
)
def update_category(
    category_id: int, data: CategoryUpdate, db: Session = Depends(get_db)
):
    return CategoryService(db).update(
        category_id,
        name=data.name,
        color=data.color,
        icon=data.icon,
        description=data.description,
    )


@router.delete(
    "/{category_id:int}", status_code=204, dependencies=[Depends(require_admin)]
)
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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Category not found"
        )

    base = (
        select(Feed)
        .join(FeedCategory, FeedCategory.feed_id == Feed.id)
        .where(FeedCategory.category_id == category_id)
    )

    total = db.scalar(select(func.count()).select_from(base.subquery()))
    items = db.scalars(
        base.order_by(Feed.created_at.desc()).offset((page - 1) * size).limit(size)
    ).all()

    if response is not None:
        response.headers["X-Total-Count"] = str(total or 0)
    return items


@router.post(
    "/{category_id}/feeds/{feed_id}",
    status_code=204,
    dependencies=[Depends(get_current_user)],
    operation_id="categories_attach_feed",
)
def attach_feed_to_category(
    category_id: int, feed_id: int, db: Session = Depends(get_db)
):
    CategoryService(db).add_feed(category_id=category_id, feed_id=feed_id)
    return Response(status_code=204)


@router.delete(
    "/{category_id}/feeds/{feed_id}",
    status_code=204,
    dependencies=[Depends(get_current_user)],
    operation_id="categories_detach_feed",
)
def detach_feed_from_category(
    category_id: int, feed_id: int, db: Session = Depends(get_db)
):
    CategoryService(db).remove_feed(category_id=category_id, feed_id=feed_id)
    return Response(status_code=204)
