from typing import Iterable, Optional, Tuple
from urllib.parse import urlparse, urlunparse

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from ..models.feed import Feed, FeedStatus
from ..repositories.category import CategoryRepository
from ..repositories.collection import CollectionRepository
from ..repositories.collection_member import CollectionMemberRepository
from ..repositories.feed import FeedRepository


def _normalize_url(raw) -> str:
    s = str(raw).strip()
    u = urlparse(s)
    if not u.scheme:
        s = "http://" + s
        u = urlparse(s)
    u = u._replace(netloc=u.netloc.lower())
    normalized = urlunparse(u)
    if normalized.endswith("/") and u.path == "/":
        normalized = normalized[:-1]
    return normalized


def _clamp(val: int, lo: int, hi: int) -> int:
    return max(lo, min(hi, val))


class FeedService:
    def __init__(self, db: Session):
        self.db = db
        self.collections = CollectionRepository(db)
        self.feeds = FeedRepository(db)
        self.categories = CategoryRepository(db)
        self.members = CollectionMemberRepository(db)

    def create(
        self,
        *,
        title: str,
        url: str,
        collection_id: int,
        created_by: int,
        language: Optional[str],
        update_frequency: Optional[int],
        priority: Optional[int],
        category_names=None,
    ) -> Feed:

        # 1) existence de la collection
        c = self.collections.get_by_id(collection_id)
        if not c:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found"
            )

        # 2) droits: owner ou membre avec can_add_feeds (ou admin)
        if c.owner_id != created_by:
            m = self.members.get_membership(
                collection_id=collection_id, user_id=created_by
            )
            allowed = bool(m and m.is_active and (m.is_admin or m.can_add_feeds))
            if not allowed:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not allowed to add feeds in this collection",
                )

        url_n = _normalize_url(str(url))
        if self.feeds.get_by_url_in_collection(collection_id=collection_id, url=url_n):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Feed URL already exists in this collection",
            )
        if not self.collections.get_by_id(collection_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found"
            )

        uf = _clamp(update_frequency if update_frequency is not None else 60, 5, 1440)
        pr = _clamp(priority if priority is not None else 5, 1, 10)

        feed = Feed(
            title=title.strip(),
            url=url_n,
            collection_id=collection_id,
            created_by=created_by,
            language=language,
            update_frequency=uf,
            priority=pr,
            status=FeedStatus.ACTIVE.value,
            total_articles=0,
            successful_fetches=0,
            failed_fetches=0,
            consecutive_failures=0,
        )

        self.db.add(feed)
        self.db.commit()
        self.db.refresh(feed)

        names = category_names or []
        if names:
            ids = self.categories.ids_by_names(
                names
            )  # à implémenter dans CategoryRepository
            if ids:
                self.attach_categories(feed_id=feed.id, category_ids=ids)
        return feed

    def update(self, feed_id: int, **data) -> Feed:
        feed = self.feeds.get_by_id(feed_id)
        if not feed:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Feed not found"
            )

        title = data.get("title")
        url = data.get("url")
        language = data.get("language")
        update_frequency = data.get("update_frequency")
        priority = data.get("priority")
        status_str = data.get("status")

        if title is not None:
            feed.title = title.strip()

        if url is not None:
            url_n = _normalize_url(url)
            # vérifier l’unicité dans la même collection
            dup = self.feeds.get_by_url_in_collection(
                collection_id=feed.collection_id, url=url_n
            )
            if dup and dup.id != feed.id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Feed URL already exists in this collection",
                )
            feed.url = url_n

        if language is not None:
            feed.language = language

        if update_frequency is not None:
            feed.update_frequency = _clamp(update_frequency, 5, 1440)

        if priority is not None:
            feed.priority = _clamp(priority, 1, 10)

        if status_str is not None:
            try:
                st = FeedStatus(status_str)
                feed.status = st.value
            except Exception:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Invalid status",
                )

        self.db.add(feed)
        self.db.commit()
        self.db.refresh(feed)
        return feed

    def delete(self, feed_id: int) -> None:
        feed = self.feeds.get_by_id(feed_id)
        if not feed:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Feed not found"
            )
        self.db.delete(feed)
        self.db.commit()

    def attach_categories(self, *, feed_id: int, category_ids: Iterable[int]) -> int:
        # vérifie existence catégories
        for cid in set(category_ids):
            if not self.categories.get_by_id(cid):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Category {cid} not found",
                )
        count = self.feeds.attach_categories(feed_id=feed_id, category_ids=category_ids)
        self.db.commit()
        return count

    def detach_category(self, *, feed_id: int, category_id: int) -> int:
        removed = self.feeds.detach_category(feed_id=feed_id, category_id=category_id)
        if removed:
            self.db.commit()
        return removed
