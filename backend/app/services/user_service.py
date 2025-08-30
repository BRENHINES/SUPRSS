from typing import Optional

from fastapi import HTTPException, status
from psycopg2 import extras
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..core.security import hash_password, verify_password
from ..models.user import User
from ..repositories.user import UserRepository
from ..services.blob_storage_service import AzureBlobStorage, delete_avatar_blob_by_url


class UserService:
    def __init__(self, db: Session):
        self.db = db
        self.users = UserRepository(db)

    def _ensure_unique(
        self,
        *,
        email: Optional[str],
        username: Optional[str],
        exclude_id: Optional[int] = None
    ) -> None:
        if email:
            existing = self.users.get_by_email(email)
            if existing and existing.id != exclude_id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT, detail="Email already in use"
                )
        if username:
            existing = self.users.get_by_username(username)
            if existing and existing.id != exclude_id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Username already in use",
                )

    def create_user(
        self, *, email: str, username: str, password: Optional[str], **extras
    ) -> User:
        # Pré-check applicatif (meilleurs messages + UX)
        self._ensure_unique(email=email, username=username)

        # On passe par le repo comme dans ta version
        user = self.users.create(
            email=email,
            username=username,
            hashed_password=hash_password(password) if password else None,
            **extras
        )

        try:
            self.db.commit()
        except IntegrityError as e:
            self.db.rollback()
            # Si jamais une course survient, on convertit en 409 propre
            pgcode = getattr(getattr(e, "orig", None), "pgcode", None)
            cname = getattr(
                getattr(getattr(e, "orig", None), "diag", None), "constraint_name", None
            )
            if pgcode == "23505":  # unique_violation (Postgres)
                if cname in {"uq_users_email"}:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Email already in use",
                    )
                if cname in {"uq_users_username"}:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Username already in use",
                    )
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT, detail="Duplicate key"
                )
            raise

        self.db.refresh(user)
        return user

    def update_user(
        self,
        user_id: int,
        *,
        email: Optional[str] = None,
        username: Optional[str] = None,
        password: Optional[str] = None,
        **extra
    ) -> User:
        user = self.users.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        # Unicity checks (si email/username changent)
        self._ensure_unique(
            email=email if email is not None else user.email,
            username=username if username is not None else user.username,
            exclude_id=user.id,
        )

        payload: dict = {}
        if email is not None:
            payload["email"] = email
        if username is not None:
            payload["username"] = username
        if password:
            payload["hashed_password"] = hash_password(password)

        # autres champs optionnels (on ne prend que ceux non None et existants sur le modèle)
        for k, v in extras.items():
            if v is not None and hasattr(user, k):
                payload[k] = v

        updated = self.users.update(user, payload)  # <-- IMPORTANT: passer le dict

        self.db.commit()
        self.db.refresh(updated)
        return updated

    def set_avatar_url(self, *, user: User, url: str) -> User:
        user.avatar_url = url
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def change_password(
        self, *, user: User, old_password: str, new_password: str
    ) -> User:
        if not user.hashed_password or not verify_password(
            old_password, user.hashed_password
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Old password is invalid",
            )
        if verify_password(new_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be different",
            )

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

    def delete_user(
        self, *, target_id: int, actor_id: int, hard_delete: bool = True
    ) -> None:
        target = self.users.get_by_id(target_id)
        if not target:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        actor = self.users.get_by_id(actor_id)
        if not actor:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized"
            )

        # Autorisation : admin ou self
        if not (actor.is_superuser or actor.id == target.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden"
            )

        # Optionnel: retirer l'avatar du blob storage
        try:
            if target.avatar_url:
                try:
                    AzureBlobStorage().delete_by_url(target.avatar_url)
                except Exception:
                    pass
        finally:
            # Hard delete
            self.users.delete(target)  # flush
            self.db.commit()
