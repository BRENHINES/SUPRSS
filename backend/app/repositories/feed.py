from typing import Optional, Tuple
from collections.abc import Iterable, Sequence

from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session, joinedload, selectinload

from ..models.feed import FeedStatus  # ton Enum python
from ..models.feed import Category, Feed, FeedCategory  # adapte si besoin
from .base import SQLRepository


class FeedRepository(SQLRepository[Feed]):
    model = Feed

    def get_by_id(self, feed_id: int) -> Feed | None:
        stmt = (
            select(Feed)
            .options(joinedload(Feed.categories).joinedload(FeedCategory.category))
            .where(Feed.id == feed_id)
        )
        return self.session.scalars(stmt).first()

    def get_by_url_in_collection(
        self, *, collection_id: int, url: str
    ) -> Feed | None:
        stmt = select(Feed).where(
            and_(Feed.collection_id == collection_id, Feed.url == url)
        )
        return self.session.scalars(stmt).first()

    def list_by_collection(
        self,
        *,
        collection_id: int,
        status: str | None,
        q: str | None,
        page: int,
        size: int,
    ) -> tuple[Sequence[Feed], int]:
        stmt = (
            select(Feed)
            .where(Feed.collection_id == collection_id)
            .options(selectinload(Feed.categories).selectinload(FeedCategory.category))
        )

        if status:
            # accepte "active/inactive/error/deleted" (respecte ton enum FeedStatus)
            try:
                st = FeedStatus(status)
                stmt = stmt.where(Feed.status == st.value)
            except Exception:
                # si statut invalide, on retourne vide proprement
                return [], 0

        if q:
            like = f"%{q.strip()}%"
            stmt = stmt.where(or_(Feed.title.ilike(like), Feed.url.ilike(like)))

        total = self.session.scalar(select(func.count()).select_from(stmt.subquery()))
        stmt = (
            stmt.order_by(Feed.created_at.desc()).offset((page - 1) * size).limit(size)
        )
        items = self.session.scalars(stmt).all()
        return items, int(total or 0)

    # Attacher/détacher catégories
    def attach_categories(self, *, feed_id: int, category_ids: Iterable[int]) -> int:
        count = 0
        for cid in set(category_ids):
            exists_stmt = select(FeedCategory).where(
                and_(FeedCategory.feed_id == feed_id, FeedCategory.category_id == cid)
            )
            if not self.session.scalars(exists_stmt).first():
                self.session.add(FeedCategory(feed_id=feed_id, category_id=cid))
                count += 1
        self.session.flush()
        return count

    def detach_category(self, *, feed_id: int, category_id: int) -> int:
        stmt = select(FeedCategory).where(
            and_(
                FeedCategory.feed_id == feed_id, FeedCategory.category_id == category_id
            )
        )
        fc = self.session.scalars(stmt).first()
        if fc:
            self.session.delete(fc)
            self.session.flush()
            return 1
        return 0
