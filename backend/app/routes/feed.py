from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..api.deps import get_current_user
from ..core.database import get_db
from ..repositories.feed import FeedRepository
from ..schemas.feed import FeedAttachCategories, FeedCreate, FeedOut, FeedUpdate
from ..services.feed_service import FeedService

router = APIRouter(prefix="/api", tags=["Feeds"])


# create in a collection
@router.post(
    "/collections/{collection_id}/feeds", response_model=FeedOut, status_code=201
)
def create_feed(
    collection_id: int,
    data: FeedCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    # on ignore data.collection_id si le path param prime (sécurité)
    return FeedService(db).create(
        title=data.title,
        url=data.url,
        collection_id=collection_id,
        created_by=user.id,
        language=data.language,
        update_frequency=data.update_frequency,
        priority=data.priority,
    )


# list feeds in a collection (filters)
@router.get("/collections/{collection_id}/feeds", response_model=list[FeedOut])
def list_feeds(
    collection_id: int,
    status_filter: str | None = Query(None, alias="status"),
    q: str | None = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    items, _total = FeedRepository(db).list_by_collection(
        collection_id=collection_id, status=status_filter, q=q, page=page, size=size
    )
    return items


@router.get("/feeds/{feed_id}", response_model=FeedOut)
def get_feed(feed_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    feed = FeedRepository(db).get_by_id(feed_id)
    if not feed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Feed not found"
        )
    return feed


@router.patch("/feeds/{feed_id}", response_model=FeedOut)
def update_feed(
    feed_id: int,
    data: FeedUpdate,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return FeedService(db).update(
        feed_id,
        **data.model_dump(exclude_unset=True),
    )


@router.delete("/feeds/{feed_id}", status_code=204)
def delete_feed(
    feed_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)
):
    FeedService(db).delete(feed_id)
    return


@router.post("/feeds/{feed_id}/categories", status_code=204)
def attach_categories(
    feed_id: int,
    data: FeedAttachCategories,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    FeedService(db).attach_categories(feed_id=feed_id, category_ids=data.category_ids)
    return


@router.delete("/feeds/{feed_id}/categories/{category_id}", status_code=204)
def detach_category(
    feed_id: int,
    category_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    FeedService(db).detach_category(feed_id=feed_id, category_id=category_id)
    return
