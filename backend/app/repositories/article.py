from datetime import datetime
from typing import Optional, Sequence, Tuple

from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session

from ..models.article import Article, UserArticle
from ..models.feed import Feed
from .base import SQLRepository


class ArticleRepository(SQLRepository[Article]):
    model = Article

    def get_by_id(self, article_id: int) -> Optional[Article]:
        return self.session.get(Article, article_id)

    def list_by_feed(
        self,
        *,
        feed_id: int,
        q: Optional[str],
        from_date: Optional[datetime],
        page: int,
        size: int,
        order_desc: bool = True,
    ) -> Tuple[Sequence[Article], int]:
        stmt = select(Article).where(Article.feed_id == feed_id)
        if q:
            like = f"%{q.strip()}%"
            stmt = stmt.where(
                or_(
                    Article.title.ilike(like),
                    Article.summary.ilike(like),
                    Article.author.ilike(like),
                )
            )
        if from_date:
            stmt = stmt.where(Article.published_at >= from_date)
        total = self.session.scalar(select(func.count()).select_from(stmt.subquery()))
        stmt = (
            stmt.order_by(
                Article.published_at.desc()
                if order_desc
                else Article.published_at.asc()
            )
            .offset((page - 1) * size)
            .limit(size)
        )
        return self.session.scalars(stmt).all(), int(total or 0)

    def list_for_user_by_collection(
        self,
        *,
        user_id: int,
        collection_id: int,
        only_unread: bool = False,
        only_favorites: bool = False,
        page: int,
        size: int,
    ) -> Tuple[Sequence[Article], int]:
        # articles d’une collection via join Feed ; filtre via UserArticle
        a = Article
        ua = UserArticle
        f = Feed
        stmt = (
            select(a).join(f, a.feed_id == f.id).where(f.collection_id == collection_id)
        )
        if only_unread:
            # sans ligne UA is_read=True ; soit pas de UA, soit UA.is_read=False
            stmt = stmt.outerjoin(
                ua, and_(ua.article_id == a.id, ua.user_id == user_id)
            ).where(
                or_(ua.id.is_(None), ua.is_read == False)  # noqa: E712
            )
        if only_favorites:
            stmt = stmt.join(
                ua,
                and_(
                    ua.article_id == a.id, ua.user_id == user_id, ua.is_favorite == True
                ),
            )  # noqa: E712

        total = self.session.scalar(select(func.count()).select_from(stmt.subquery()))
        stmt = (
            stmt.order_by(a.published_at.desc()).offset((page - 1) * size).limit(size)
        )
        return self.session.scalars(stmt).all(), int(total or 0)
