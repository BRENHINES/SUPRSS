from typing import Optional, Sequence, Tuple

from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session

from ..models.article import UserArticle


class UserArticleRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, *, user_id: int, article_id: int) -> Optional[UserArticle]:
        stmt = select(UserArticle).where(
            and_(UserArticle.user_id == user_id, UserArticle.article_id == article_id)
        )
        return self.db.scalars(stmt).first()

    def get_or_create(self, *, user_id: int, article_id: int) -> UserArticle:
        ua = self.get(user_id=user_id, article_id=article_id)
        if ua:
            return ua
        ua = UserArticle(user_id=user_id, article_id=article_id)
        self.db.add(ua)
        self.db.flush()
        return ua

    def save(self, ua: UserArticle) -> UserArticle:
        self.db.add(ua)
        self.db.flush()
        return ua

    def list_for_user(
        self,
        *,
        user_id: int,
        is_read: Optional[bool] = None,
        is_favorite: Optional[bool] = None,
        is_archived: Optional[bool] = None,
        page: int,
        size: int,
    ) -> Tuple[Sequence[UserArticle], int]:
        stmt = select(UserArticle).where(UserArticle.user_id == user_id)
        if is_read is not None:
            stmt = stmt.where(UserArticle.is_read == is_read)
        if is_favorite is not None:
            stmt = stmt.where(UserArticle.is_favorite == is_favorite)
        if is_archived is not None:
            stmt = stmt.where(UserArticle.is_archived == is_archived)
        total = self.db.scalar(select(func.count()).select_from(stmt.subquery()))
        stmt = (
            stmt.order_by(UserArticle.created_at.desc())
            .offset((page - 1) * size)
            .limit(size)
        )
        return self.db.scalars(stmt).all(), int(total or 0)
