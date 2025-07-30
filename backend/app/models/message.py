# message.py
from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from ..core.database import Base

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id           = Column(Integer, primary_key=True)
    content      = Column(Text, nullable=False)
    collection_id= Column(Integer, ForeignKey("collections.id"))
    author_id    = Column(Integer, ForeignKey("users.id"))
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
