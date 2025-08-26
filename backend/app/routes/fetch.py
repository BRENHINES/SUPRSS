from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, status
from sqlalchemy.orm import Session

from ..core.database import get_db, SessionLocal
from ..api.deps import get_current_user
from ..repositories.feed import FeedRepository
from ..services.fetch_service import FetchService

router = APIRouter(prefix="/api", tags=["Feeds/Ingestion"])

@router.post("/feeds/{feed_id}/fetch")
def fetch_one_feed(
    feed_id: int,
    db: Session = Depends(get_db),
    _user = Depends(get_current_user),  # si besoin, vérifie droits sur la collection du feed
):
    res = FetchService(db).fetch_one(feed_id)
    if not res.get("ok"):
        raise HTTPException(status_code=502, detail=res.get("error"))
    return res

@router.post("/collections/{collection_id}/feeds/fetch", summary="Fetch tous les feeds d'une collection (séquentiel simple)")
def fetch_collection(
    collection_id: int,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
    _user = Depends(get_current_user),
):
    feeds = FeedRepository(db).list_by_collection(collection_id=collection_id, filters=None, pagination=None)

    def _worker(ids: list[int]):
        db2 = SessionLocal()
        try:
            svc = FetchService(db2)
            for fid in ids:
                try:
                    svc.fetch_one(fid)
                except Exception:
                    pass
        finally:
            db2.close()

    background.add_task(_worker, [f.id for f in feeds])
    return {"scheduled": len(feeds)}
