from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError

from ..repositories.user import UserRepository
from ..core.security import hash_password, verify_password
from ..models.user import User
from ..services.blob_storage_service import AzureBlobStorage
from ..services.blob_storage_service import delete_avatar_blob_by_url


class UserService:
    def __init__(self, db: Session):
        self.db = db
        self.users = UserRepository(db)

    def _ensure_unique(self, *, email: Optional[str], username: Optional[str], exclude_id: Optional[int] = None) -> None:
        if email:
            existing = self.users.get_by_email(email)
            if existing and existing.id != exclude_id:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already in use")
        if username:
            existing = self.users.get_by_username(username)
            if existing and existing.id != exclude_id:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already in use")

    def create_user(self, *, email: str, username: str, password: Optional[str], **extras) -> User:
        # Pré-check applicatif (meilleurs messages + UX)
        self._ensure_unique(email=email, username=username)

        user = User(
            email=email,
            username=username,
            hashed_password=hash_password(password) if password else None,
            **extras
        )

        # On passe par le repo comme dans ta version
        user = self.users.create(user)

        try:
            self.db.commit()
        except IntegrityError as e:
            self.db.rollback()
            # Si jamais une course survient, on convertit en 409 propre
            pgcode = getattr(getattr(e, "orig", None), "pgcode", None)
            cname = getattr(getattr(getattr(e, "orig", None), "diag", None), "constraint_name", None)
            if pgcode == "23505":  # unique_violation (Postgres)
                if cname in {"uq_users_email"}:
                    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already in use")
                if cname in {"uq_users_username"}:
                    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already in use")
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Duplicate key")
            raise

        self.db.refresh(user)
        return user

    def update_user(self, user_id: int, *, email: Optional[str] = None, username: Optional[str] = None,
                    password: Optional[str] = None, **extras) -> User:
        user = self.users.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        self._ensure_unique(email=email or user.email, username=username or user.username, exclude_id=user.id)

        if email is not None:
            user.email = email
        if username is not None:
            user.username = username
        if password:
            user.hashed_password = hash_password(password)

        # autres champs optionnels (full_name, avatar_url, prefs, etc.)
        for k, v in extras.items():
            if v is not None and hasattr(user, k):
                setattr(user, k, v)

        self.users.update(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def set_avatar_url(self, *, user: User, url: str) -> User:
        user.avatar_url = url
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def change_password(self, *, user: User, old_password: str, new_password: str) -> User:
        if not user.hashed_password or not verify_password(old_password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Old password is invalid")
        if verify_password(new_password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New password must be different")

        user.hashed_password = hash_password(new_password)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def delete_avatar(self, *, user: User) -> User:
        if user.avatar_url:
            try:
                AzureBlobStorage().delete_by_url(user.avatar_url)
            except Exception:
                # on ne bloque pas l'utilisateur si la suppression blob échoue
                pass
        user.avatar_url = None
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def replace_avatar_url(self, *, user: User, new_url: str) -> User:
        # si un avatar existait, on peut le supprimer pour éviter les orphelins
        old = user.avatar_url
        user.avatar_url = new_url
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        if old and old != new_url:
            delete_avatar_blob_by_url(old)

        return user

    def remove_avatar(self, *, user: User) -> User:
        old = user.avatar_url
        user.avatar_url = None
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        if old:
            delete_avatar_blob_by_url(old)
        return user
