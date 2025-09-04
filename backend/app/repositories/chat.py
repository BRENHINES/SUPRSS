from datetime import datetime
from typing import Optional, Tuple
from collections.abc import Iterable, Sequence

from sqlalchemy import asc, desc, func, select
from sqlalchemy.orm import Session

from ..models.message import ChatMessage, ChatReaction, MessageType


class ChatRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        *,
        collection_id: int,
        author_id: int,
        content: str,
        message_type: MessageType = MessageType.TEXT,
        reply_to_id: int | None = None,
        metadata_json: str | None = None,
    ) -> ChatMessage:
        m = ChatMessage(
            collection_id=collection_id,
            author_id=author_id,
            content=content.strip(),
            message_type=message_type,
            reply_to_id=reply_to_id,
            metadata_json=metadata_json,
        )
        self.db.add(m)
        self.db.flush()
        return m

    def get_by_id(self, mid: int) -> ChatMessage | None:
        return self.db.get(ChatMessage, mid)

    def list_for_collection(
        self, *, collection_id: int, page: int, size: int
    ) -> tuple[Sequence[ChatMessage], int]:
        stmt = select(ChatMessage).where(
            ChatMessage.collection_id == collection_id, ChatMessage.is_deleted == False
        )  # noqa: E712
        total = self.db.scalar(select(func.count()).select_from(stmt.subquery()))
        stmt = (
            stmt.order_by(ChatMessage.created_at.desc())
            .offset((page - 1) * size)
            .limit(size)
        )
        return self.db.scalars(stmt).all(), int(total or 0)

    def list_in_collection(
        self,
        collection_id: int,
        *,
        limit: int = 50,
        before: datetime | None = None,
        after: datetime | None = None,
        top_level_only: bool = True,
    ) -> Sequence[ChatMessage]:
        stmt = select(ChatMessage).where(ChatMessage.collection_id == collection_id)
        if top_level_only:
            stmt = stmt.where(ChatMessage.reply_to_id.is_(None))
        if before:
            stmt = stmt.where(ChatMessage.created_at < before)
        if after:
            stmt = stmt.where(ChatMessage.created_at > after)
        stmt = stmt.order_by(desc(ChatMessage.created_at)).limit(limit)
        return self.db.execute(stmt).scalars().all()

    def list_thread(
        self,
        collection_id: int,
        root_id: int,
        *,
        limit: int = 100,
        after: datetime | None = None,
    ) -> Sequence[ChatMessage]:
        stmt = select(ChatMessage).where(
            ChatMessage.collection_id == collection_id,
            ChatMessage.reply_to_id == root_id,
        )
        if after:
            stmt = stmt.where(ChatMessage.created_at > after)
        stmt = stmt.order_by(asc(ChatMessage.created_at)).limit(limit)
        return self.db.execute(stmt).scalars().all()

    def save(self, m: ChatMessage) -> ChatMessage:
        self.db.add(m)
        self.db.flush()
        return m

    def update_content(self, m: ChatMessage, *, content: str) -> ChatMessage:
        m.content = content
        m.is_edited = True
        self.db.add(m)
        return m

    def soft_delete(self, m: ChatMessage) -> None:
        m.is_deleted = True
        # Option : masquer le contenu
        # m.content = None
        self.db.add(m)

    # ---- reactions helpers ----
    def reaction_counts_for(
        self, message_ids: Iterable[int]
    ) -> dict[int, dict[str, int]]:
        if not message_ids:
            return {}
        stmt = (
            select(
                ChatReaction.message_id, ChatReaction.emoji, func.count(ChatReaction.id)
            )
            .where(ChatReaction.message_id.in_(list(message_ids)))
            .group_by(ChatReaction.message_id, ChatReaction.emoji)
        )
        rows = self.db.execute(stmt).all()
        out: dict[int, dict[str, int]] = {}
        for mid, emoji, cnt in rows:
            out.setdefault(mid, {})[emoji] = cnt
        return out


class ChatReactionRepository:
    def __init__(self, db: Session):
        self.db = db

    def toggle(self, *, message_id: int, user_id: int, emoji: str) -> bool:
        # true -> added, false -> removed
        stmt = select(ChatReaction).where(
            ChatReaction.message_id == message_id,
            ChatReaction.user_id == user_id,
            ChatReaction.emoji == emoji,
        )
        r = self.db.execute(stmt).scalars().first()
        if r:
            self.db.delete(r)
            return False
        r = ChatReaction(message_id=message_id, user_id=user_id, emoji=emoji)
        self.db.add(r)
        return True
