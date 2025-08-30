from typing import Optional, Sequence, Tuple

from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session

from ..models.collection import CollectionMember


class CollectionMemberRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, member_id: int) -> Optional[CollectionMember]:
        stmt = select(CollectionMember).where(CollectionMember.id == member_id)
        return self.db.scalars(stmt).first()

    def get_membership(
        self, *, collection_id: int, user_id: int
    ) -> Optional[CollectionMember]:
        stmt = select(CollectionMember).where(
            and_(
                CollectionMember.collection_id == collection_id,
                CollectionMember.user_id == user_id,
            )
        )
        return self.db.scalars(stmt).first()

    def list_for_collection(
        self, *, collection_id: int, page: int, size: int
    ) -> Tuple[Sequence[CollectionMember], int]:
        stmt = select(CollectionMember).where(
            CollectionMember.collection_id == collection_id
        )
        total = self.db.scalar(select(func.count()).select_from(stmt.subquery()))
        stmt = (
            stmt.order_by(CollectionMember.joined_at.asc())
            .offset((page - 1) * size)
            .limit(size)
        )
        return self.db.scalars(stmt).all(), int(total or 0)

    def add_member(
        self,
        *,
        collection_id: int,
        user_id: int,
        is_admin: bool = False,
        is_active: bool = True,
        can_read: bool = True,
        can_add_feeds: bool = False,
        can_edit_feeds: bool = False,
        can_delete_feeds: bool = False,
        can_comment: bool = True,
        can_chat: bool = True,
        can_invite: bool = False,
        invited_by: Optional[int] = None,
    ) -> CollectionMember:
        m = CollectionMember(
            collection_id=collection_id,
            user_id=user_id,
            is_admin=is_admin,
            is_active=is_active,
            can_read=can_read,
            can_add_feeds=can_add_feeds,
            can_edit_feeds=can_edit_feeds,
            can_delete_feeds=can_delete_feeds,
            can_comment=can_comment,
            can_chat=can_chat,
            can_invite=can_invite,
            invited_by=invited_by,
        )
        self.db.add(m)
        self.db.flush()  # pour avoir m.id
        return m

    def remove_member(self, member: CollectionMember) -> None:
        self.db.delete(member)
        self.db.flush()
