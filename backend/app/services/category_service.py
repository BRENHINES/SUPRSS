from typing import Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..repositories.category import CategoryRepository
from ..models.feed import Category, Feed
from ..repositories.feed import FeedRepository


def _norm_name(name: str) -> str:
    return " ".join(name.split()).strip()


class CategoryService:
    def __init__(self, db: Session):
        self.db = db
        self.categories = CategoryRepository(db)
        self.feeds = FeedRepository(db)

    def create(self, *, name: str, color: Optional[str], icon: Optional[str], description: Optional[str]) -> Category:
        name_n = _norm_name(name)
        if self.categories.get_by_name(name_n):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Category name already exists")
        cat = Category(name=name_n, color=color, icon=icon, description=description)
        self.db.add(cat)
        self.db.commit()
        self.db.refresh(cat)
        return cat

    def update(self, category_id: int, *, name: Optional[str], color: Optional[str], icon: Optional[str], description: Optional[str]) -> Category:
        cat = self.categories.get_by_id(category_id)
        if not cat:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

        if name is not None:
            name_n = _norm_name(name)
            other = self.categories.get_by_name(name_n)
            if other and other.id != cat.id:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Category name already exists")
            cat.name = name_n
        if color is not None:
            cat.color = color
        if icon is not None:
            cat.icon = icon
        if description is not None:
            cat.description = description

        self.db.add(cat)
        self.db.commit()
        self.db.refresh(cat)
        return cat

    def delete(self, category_id: int) -> None:
        cat = self.categories.get_by_id(category_id)
        if not cat:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
        self.db.delete(cat)
        self.db.commit()

    def add_feed(self, *, category_id: int, feed_id: int) -> None:
        try:
            self.categories.attach_feed(category_id=category_id, feed_id=feed_id)
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
        self.db.commit()

    def remove_feed(self, *, category_id: int, feed_id: int) -> int:
        affected = self.categories.detach_feed(category_id=category_id, feed_id=feed_id)
        self.db.commit()
        return affected

    def list_with_counts(self, *, search: Optional[str], page: int, size: int):
        rows, total = self.categories.list_with_counts(search=search, page=page, size=size)
        # map -> list[dict] pour CategoryWithCountOut
        items = [
            {
                "id": cat.id,
                "name": cat.name,
                "color": cat.color,
                "icon": cat.icon,
                "description": cat.description,
                "feeds_count": int(feeds_count or 0),
            }
            for (cat, feeds_count) in rows
        ]
        return items, total

    def get_by_name(self, name: str) -> Category:
        cat = self.categories.get_by_name(name)
        if not cat:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
        return cat
