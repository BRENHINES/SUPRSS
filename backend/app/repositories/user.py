from typing import Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from .base import SQLRepository
from ..models.user import User


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
            email=email,
            username=username,
            hashed_password=hashed_password,
            **extra,
        )
