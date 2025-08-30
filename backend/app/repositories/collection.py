from typing import Optional, Sequence, Tuple

from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session

from ..models.collection import (Collection,  # adapte si besoin
                                 CollectionMember)
from .base import SQLRepository


class CollectionRepository(SQLRepository[Collection]):
    model = Collection

    def get_by_id(self, collection_id: int) -> Optional[Collection]:
        stmt = select(Collection).where(Collection.id == collection_id)
        return self.session.scalars(stmt).first()

    def list_for_user(
        self,
        *,
        user_id: int,
        q: Optional[str],
        page: int,
        size: int,
    ) -> Tuple[Sequence[Collection], int]:
        # (owner) OR (member active)
        base = (
            select(Collection)
            .outerjoin(
                CollectionMember,
                and_(
                    CollectionMember.collection_id == Collection.id,
                    CollectionMember.user_id == user_id,
                    CollectionMember.is_active == True,
                ),  # noqa: E712
            )
            .where(or_(Collection.owner_id == user_id, CollectionMember.id.isnot(None)))
        )
        if q:
            like = f"%{q.strip()}%"
            base = base.where(
                or_(Collection.name.ilike(like), Collection.slug.ilike(like))
            )

        total = self.session.scalar(select(func.count()).select_from(base.subquery()))
        stmt = (
            base.order_by(Collection.last_activity.desc())
            .offset((page - 1) * size)
            .limit(size)
        )
        items = self.session.scalars(stmt).all()
        return items, int(total or 0)

    def list_all(
        self, *, q: Optional[str], page: int, size: int
    ) -> Tuple[Sequence[Collection], int]:
        stmt = select(Collection)
        if q:
            like = f"%{q.strip()}%"
            stmt = stmt.where(
                or_(Collection.name.ilike(like), Collection.slug.ilike(like))
            )
        total = self.session.scalar(select(func.count()).select_from(stmt.subquery()))
        stmt = (
            stmt.order_by(Collection.last_activity.desc())
            .offset((page - 1) * size)
            .limit(size)
        )
        items = self.session.scalars(stmt).all()
        return items, int(total or 0)
