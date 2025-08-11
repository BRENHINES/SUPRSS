from typing import Optional, Sequence, Tuple
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from .base import SQLRepository
from ..models.feed import Category  # adapte si Category est ailleurs


class CategoryRepository(SQLRepository[Category]):
    model = Category

    def get_by_id(self, category_id: int) -> Optional[Category]:
        stmt = select(Category).where(Category.id == category_id)
        return self.session.scalars(stmt).first()

    def get_by_name(self, name: str) -> Optional[Category]:
        stmt = select(Category).where(Category.name == name)
        return self.session.scalars(stmt).first()

    def list_paginated(self, *, search: Optional[str], page: int, size: int) -> Tuple[Sequence[Category], int]:
        stmt = select(Category)
        if search:
            like = f"%{search.strip()}%"
            stmt = stmt.where(Category.name.ilike(like))
        total = self.session.scalar(select(func.count()).select_from(stmt.subquery()))
        stmt = stmt.order_by(Category.name.asc()).offset((page - 1) * size).limit(size)
        items = self.session.scalars(stmt).all()
        return items, int(total or 0)
