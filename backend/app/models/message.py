import enum

from sqlalchemy import Boolean, Column, DateTime, Enum as PgEnum, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..core.database import Base


class MessageType(str, enum.Enum):
    TEXT = "TEXT"
    SYSTEM = "SYSTEM"
    ARTICLE_SHARE = "ACTICLE_SHARE"
    FEED_ADD = "FEED_ADD"


ChatMessageTypeEnum = PgEnum(
    MessageType,
    name="chat_message_type_enum",
    create_type=False,
    validate_strings=True,
)


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    message_type = Column(
        ChatMessageTypeEnum, nullable=False, server_default=MessageType.TEXT.value
    )

    # Métadonnées pour les messages spéciaux
    metadata_json = Column(Text, nullable=True)  # JSON pour article_id, feed_id, etc.

    # Modération
    is_edited = Column(Boolean, default=False, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)

    # Relations
    collection_id = Column(
        Integer, ForeignKey("collections.id"), nullable=False, index=True
    )
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    reply_to_id = Column(
        Integer, ForeignKey("chat_messages.id"), nullable=True, index=True
    )

    # Timestamps
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relations
    collection = relationship("Collection", back_populates="chat_messages")
    author = relationship("User", back_populates="chat_messages")
    reply_to = relationship("ChatMessage", remote_side=[id], backref="replies")

    def __repr__(self):
        return f"<ChatMessage(id={self.id}, collection_id={self.collection_id}, author_id={self.author_id})>"


class ChatReaction(Base):
    __tablename__ = "chat_reactions"

    id = Column(Integer, primary_key=True)
    message_id = Column(
        Integer,
        ForeignKey("chat_messages.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    emoji = Column(String(32), nullable=False)  # "👍", "❤️", ":fire:", etc.
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (
        UniqueConstraint("message_id", "user_id", "emoji", name="uq_chat_reaction"),
    )

    message = relationship("ChatMessage", backref="reactions")
