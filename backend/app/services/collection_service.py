from typing import Optional, Tuple

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..models.collection import Collection
from ..repositories.collection import CollectionRepository
from ..repositories.collection_member import CollectionMemberRepository


class CollectionService:
    def __init__(self, db: Session):
        self.db = db
        self.collections = CollectionRepository(db)
        self.members = CollectionMemberRepository(db)

    # ---------- helpers permissions ----------
    def _assert_owner_or_admin(self, *, collection: Collection, user_id: int) -> None:
        if collection.owner_id == user_id:
            return
        m = self.members.get_membership(collection_id=collection.id, user_id=user_id)
        if not m or not m.is_active or not m.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed"
            )

    # ---------- CRUD collections ----------
    def create(
        self,
        *,
        owner_id: int,
        name: str,
        description: str | None,
        slug: str | None,
        is_public: bool,
        is_personal: bool,
        allow_comments: bool,
        allow_chat: bool,
        auto_fetch_feeds: bool
    ) -> Collection:
        c = Collection(
            owner_id=owner_id,
            name=name.strip(),
            description=description,
            slug=slug.strip() if slug else None,
            is_public=is_public,
            is_personal=is_personal,
            allow_comments=allow_comments,
            allow_chat=allow_chat,
            auto_fetch_feeds=auto_fetch_feeds,
        )
        self.db.add(c)
        self.db.flush()  # pour c.id

        # Le propriétaire devient membre admin
        self.members.add_member(
            collection_id=c.id,
            user_id=owner_id,
            is_admin=True,
            is_active=True,
            can_read=True,
            can_add_feeds=True,
            can_edit_feeds=True,
            can_delete_feeds=True,
            can_comment=True,
            can_chat=True,
            can_invite=True,
            invited_by=owner_id,
        )

        # stats init
        c.total_members = 1
        self.db.commit()
        self.db.refresh(c)
        return c

    def update(self, *, collection_id: int, actor_id: int, **data) -> Collection:
        c = self.collections.get_by_id(collection_id)
        if not c:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found"
            )

        self._assert_owner_or_admin(collection=c, user_id=actor_id)

        for k, v in data.items():
            if v is not None and hasattr(c, k):
                setattr(c, k, v if not isinstance(v, str) else v.strip())

        self.db.add(c)
        self.db.commit()
        self.db.refresh(c)
        return c

    def delete(self, *, collection_id: int, actor_id: int) -> None:
        c = self.collections.get_by_id(collection_id)
        if not c:
            return
        # on impose owner-only pour delete
        if c.owner_id != actor_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only owner can delete the collection",
            )
        self.db.delete(c)
        self.db.commit()

    # ---------- members ----------
    def add_member(self, *, collection_id: int, actor_id: int, user_id: int, **perms):
        c = self.collections.get_by_id(collection_id)
        if not c:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found"
            )
        self._assert_owner_or_admin(collection=c, user_id=actor_id)

        existing = self.members.get_membership(
            collection_id=collection_id, user_id=user_id
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="User already a member"
            )

        try:
            m = self.members.add_member(
                collection_id=collection_id,
                user_id=user_id,
                invited_by=actor_id,
                **perms
            )
            c.total_members += 1
            self.db.commit()
            self.db.refresh(m)
            return m
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="Membership conflict"
            )

    def update_member(
        self, *, collection_id: int, member_id: int, actor_id: int, **perms
    ):
        c = self.collections.get_by_id(collection_id)
        if not c:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found"
            )
        self._assert_owner_or_admin(collection=c, user_id=actor_id)

        m = self.members.get_by_id(member_id)
        if not m or m.collection_id != collection_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Member not found"
            )

        # on évite de rétrograder le owner
        if m.user_id == c.owner_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Owner cannot be edited as member",
            )

        for k, v in perms.items():
            if v is not None and hasattr(m, k):
                setattr(m, k, v)

        self.db.add(m)
        self.db.commit()
        self.db.refresh(m)
        return m

    def remove_member(
        self, *, collection_id: int, member_id: int, actor_id: int
    ) -> None:
        c = self.collections.get_by_id(collection_id)
        if not c:
            return
        self._assert_owner_or_admin(collection=c, user_id=actor_id)

        m = self.members.get_by_id(member_id)
        if not m or m.collection_id != collection_id:
            return
        if m.user_id == c.owner_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot remove the owner",
            )

        self.members.remove_member(m)
        c.total_members = max(0, c.total_members - 1)
        self.db.commit()
