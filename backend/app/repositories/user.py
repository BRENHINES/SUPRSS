from typing import Optional, Sequence, Tuple

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..models.user import User
from .base import SQLRepository


class UserRepository(SQLRepository[User]):
    model = User

    def get_by_id(self, user_id: int) -> Optional[User]:
        stmt = select(User).where(User.id == user_id)
        return self.session.scalars(stmt).first()

    def get_by_email(self, email: str) -> Optional[User]:
        stmt = select(User).where(User.email == email)
        return self.session.scalars(stmt).first()

    def get_by_username(self, username: str) -> Optional[User]:
        stmt = select(User).where(User.username == username)
        return self.session.scalars(stmt).first()

    def list(self, *, page: int = 1, size: int = 20) -> Sequence[User]:
        stmt = (
            select(User).order_by(User.id.desc()).offset((page - 1) * size).limit(size)
        )
        return self.session.scalars(stmt).all()

    def create_user(
        self,
        *,
        email: str,
        username: str,
        hashed_password: str | None = None,
        **extra,
    ) -> User:
        # Ici on ne hash pas : ça sera le rôle du service.
        return self.create(
            email=email, username=username, hashed_password=hashed_password, **extra
        )

    def list_paginated(
        self, *, page: int = 1, size: int = 20
    ) -> Tuple[Sequence[User], int]:
        page = max(1, page)
        size = max(1, min(size, 100))
        stmt = select(User).order_by(User.id).limit(size).offset((page - 1) * size)
        items = self.session.scalars(stmt).all()
        total = self.session.scalar(select(func.count()).select_from(User)) or 0
        return items, total
