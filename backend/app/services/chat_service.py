from datetime import datetime
from typing import Optional, Tuple
from collections.abc import Sequence

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models.collection import Collection, CollectionMember
from ..models.message import ChatMessage
from ..repositories.chat import ChatReactionRepository, ChatRepository
from ..repositories.collection import CollectionRepository
from ..repositories.collection_member import CollectionMemberRepository


class ChatService:
    def __init__(self, db: Session):
        self.db = db
        self.chat = ChatRepository(db)
        self.members = CollectionMemberRepository(db)
        self.collections = CollectionRepository(db)
        self.messages = ChatRepository(db)
        self.reactions = ChatReactionRepository(db)

    def _assert_member(self, *, collection_id: int, user_id: int) -> None:
        c = self.collections.get_by_id(collection_id)
        if not c:
            raise HTTPException(status_code=404, detail="Collection not found")
        if c.owner_id == user_id:
            return
        if not self.members.get_membership(
            collection_id=collection_id, user_id=user_id
        ):
            raise HTTPException(status_code=403, detail="Not allowed")

    def post(
        self,
        *,
        collection_id: int,
        author_id: int,
        content: str,
        reply_to_id: int | None
    ) -> ChatMessage:
        self._assert_member(collection_id=collection_id, user_id=author_id)
        m = self.chat.create(
            collection_id=collection_id,
            author_id=author_id,
            content=content,
            reply_to_id=reply_to_id,
        )
        self.db.commit()
        self.db.refresh(m)
        return m

    def list_for_collection(
        self, *, collection_id: int, page: int, size: int, user_id: int
    ):
        self._assert_member(collection_id=collection_id, user_id=user_id)
        return self.chat.list_for_collection(
            collection_id=collection_id, page=page, size=size
        )

    # ---- access control: membre de la collection ? ----
    def _ensure_member(self, collection_id: int, user_id: int) -> None:
        # owner OU membre actif
        q_owner = select(Collection).where(
            Collection.id == collection_id, Collection.owner_id == user_id
        )
        if self.db.execute(q_owner).scalar_one_or_none():
            return
        q_member = select(CollectionMember).where(
            CollectionMember.collection_id == collection_id,
            CollectionMember.user_id == user_id,
            CollectionMember.is_active == True,
        )
        if not self.db.execute(q_member).scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Not a collection member"
            )

    def _ensure_same_collection(self, msg: ChatMessage, collection_id: int) -> None:
        if msg.collection_id != collection_id:
            raise HTTPException(status_code=404, detail="Message not found")

    # ---- list / thread ----
    def list_messages(
        self,
        *,
        collection_id: int,
        user_id: int,
        limit: int = 50,
        before: datetime | None = None,
        after: datetime | None = None,
        top_level_only: bool = True
    ):
        self._ensure_member(collection_id, user_id)
        items = self.messages.list_in_collection(
            collection_id,
            limit=limit,
            before=before,
            after=after,
            top_level_only=top_level_only,
        )
        counts = self.messages.reaction_counts_for([m.id for m in items])
        return items, counts

    def list_thread(
        self,
        *,
        collection_id: int,
        root_id: int,
        user_id: int,
        limit: int = 100,
        after: datetime | None = None
    ):
        self._ensure_member(collection_id, user_id)
        items = self.messages.list_thread(
            collection_id, root_id, limit=limit, after=after
        )
        counts = self.messages.reaction_counts_for([m.id for m in items])
        return items, counts

    # ---- create / reply ----
    def create(
        self,
        *,
        collection_id: int,
        author_id: int,
        content: str,
        message_type: str,
        reply_to_id: int | None,
        metadata_json: str | None
    ) -> ChatMessage:
        self._ensure_member(collection_id, author_id)
        content = content.strip()
        if not content:
            raise HTTPException(status_code=400, detail="Empty content")
        if reply_to_id:
            parent = self.messages.get_by_id(reply_to_id)
            if not parent or parent.collection_id != collection_id:
                raise HTTPException(status_code=400, detail="Invalid reply_to_id")
        m = self.messages.create(
            collection_id=collection_id,
            author_id=author_id,
            content=content,
            message_type=message_type,
            reply_to_id=reply_to_id,
            metadata_json=metadata_json,
        )
        self.db.commit()
        self.db.refresh(m)
        return m

    def update(
        self,
        *,
        message_id: int,
        collection_id: int,
        author_id: int,
        content: str,
        is_admin: bool
    ) -> ChatMessage:
        m = self.messages.get_by_id(message_id)
        if not m:
            raise HTTPException(status_code=404, detail="Message not found")
        self._ensure_same_collection(m, collection_id)
        if not is_admin and m.author_id != author_id:
            raise HTTPException(status_code=403, detail="Not allowed")
        self.messages.update_content(m, content=content.strip())
        self.db.commit()
        self.db.refresh(m)
        return m

    def delete(
        self, *, message_id: int, collection_id: int, author_id: int, is_admin: bool
    ) -> None:
        m = self.messages.get_by_id(message_id)
        if not m:
            return
        self._ensure_same_collection(m, collection_id)
        if not is_admin and m.author_id != author_id:
            raise HTTPException(status_code=403, detail="Not allowed")
        self.messages.soft_delete(m)
        self.db.commit()

    # ---- reactions ----
    def react(
        self, *, message_id: int, collection_id: int, user_id: int, emoji: str
    ) -> dict[str, int]:
        m = self.messages.get_by_id(message_id)
        if not m:
            raise HTTPException(status_code=404, detail="Message not found")
        self._ensure_same_collection(m, collection_id)
        self._ensure_member(collection_id, user_id)

        added = self.reactions.toggle(
            message_id=message_id, user_id=user_id, emoji=emoji
        )
        self.db.commit()
        counts = self.messages.reaction_counts_for([message_id]).get(message_id, {})
        return counts
