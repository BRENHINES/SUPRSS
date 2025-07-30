from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from ..core.database import Base


class MessageType(str, enum.Enum):
    TEXT = "text"
    SYSTEM = "system"
    ARTICLE_SHARE = "article_share"
    FEED_ADD = "feed_add"


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    message_type = Column(Enum(MessageType), default=MessageType.TEXT, nullable=False)

    # Métadonnées pour les messages spéciaux
    metadata_json = Column(Text, nullable=True)  # JSON pour article_id, feed_id, etc.

    # Modération
    is_edited = Column(Boolean, default=False, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)

    # Relations
    collection_id = Column(Integer, ForeignKey("collections.id"), nullable=False, index=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    reply_to_id = Column(Integer, ForeignKey("chat_messages.id"), nullable=True, index=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relations
    collection = relationship("Collection", back_populates="chat_messages")
    author = relationship("User", back_populates="chat_messages")
    reply_to = relationship("ChatMessage", remote_side=[id], backref="replies")

    def __repr__(self):
        return f"<ChatMessage(id={self.id}, collection_id={self.collection_id}, author_id={self.author_id})>"
