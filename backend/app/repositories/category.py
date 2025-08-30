from typing import List, Optional, Sequence, Tuple

from sqlalchemy import and_, delete, func, insert, select
from sqlalchemy.orm import Session

from ..models.feed import Category  # adapte si Category est ailleurs
from ..models.feed import Feed, FeedCategory
from .base import SQLRepository


class CategoryRepository(SQLRepository[Category]):
    model = Category

    def ids_by_names(self, names: List[str]) -> List[int]:
        if not names:
            return []
        stmt = select(Category.id).where(
            Category.name.in_([n.strip() for n in names if n.strip()])
        )
        return [row[0] for row in self.session.execute(stmt).all()]

    def get_by_id(self, category_id: int) -> Optional[Category]:
        stmt = select(Category).where(Category.id == category_id)
        return self.session.scalars(stmt).first()

    def get_by_name(self, name: str) -> Optional[Category]:
        stmt = select(Category).where(Category.name == name)
        return self.session.scalars(stmt).first()

    def list_paginated(
        self, *, search: Optional[str], page: int, size: int
    ) -> Tuple[Sequence[Category], int]:
        stmt = select(Category)
        if search:
            like = f"%{search.strip()}%"
            stmt = stmt.where(Category.name.ilike(like))
        total = self.session.scalar(select(func.count()).select_from(stmt.subquery()))
        stmt = stmt.order_by(Category.name.asc()).offset((page - 1) * size).limit(size)
        items = self.session.scalars(stmt).all()
        return items, int(total or 0)

    def list_with_counts(self, *, search: Optional[str], page: int, size: int):
        """
        Retourne une liste de dicts: {category: Category, feeds_count: int} + total
        (On laisse le service mapper vers le schema Pydantic)
        """
        page = max(1, page)
        size = max(1, min(size, 100))

        cat = Category
        fc = FeedCategory

        base = (
            select(cat, func.count(fc.id).label("feeds_count"))
            .select_from(cat)
            .join(fc, fc.category_id == cat.id, isouter=True)
        )
        if search:
            base = base.where(cat.name.ilike(f"%{search}%"))

        total = (
            self.session.scalar(
                select(func.count()).select_from(
                    select(cat.id).where(cat.name.ilike(f"%{search}%"))
                    if search
                    else select(cat.id)
                )
            )
            or 0
        )

        rows = self.session.execute(
            base.group_by(cat.id)
            .order_by(cat.name.asc())
            .offset((page - 1) * size)
            .limit(size)
        ).all()

        # rows est une liste de tuples (Category, feeds_count)
        return rows, total

    def attach_feed(self, *, category_id: int, feed_id: int) -> None:
        # vérifie existence
        if not self.session.get(Category, category_id):
            raise ValueError("Category not found")
        if not self.session.get(Feed, feed_id):
            raise ValueError("Feed not found")

        # évite le doublon
        exists_stmt = select(FeedCategory.id).where(
            and_(
                FeedCategory.category_id == category_id, FeedCategory.feed_id == feed_id
            )
        )
        if self.session.scalar(exists_stmt):
            return  # idempotent

        self.session.add(FeedCategory(category_id=category_id, feed_id=feed_id))
        # commit géré au service

    def detach_feed(self, *, category_id: int, feed_id: int) -> int:
        q = (
            delete(FeedCategory)
            .where(
                and_(
                    FeedCategory.category_id == category_id,
                    FeedCategory.feed_id == feed_id,
                )
            )
            .execution_options(synchronize_session="fetch")
        )
        res = self.session.execute(q)
        # res.rowcount dispo via res.rowcount (SQLAlchemy 2 : use res.rowcount)
        return res.rowcount or 0
