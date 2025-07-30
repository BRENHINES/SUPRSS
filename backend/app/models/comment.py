# comment.py
from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base

class Comment(Base):
    __tablename__ = "comments"
    id         = Column(Integer, primary_key=True)
    content    = Column(Text, nullable=False)
    article_id = Column(Integer, ForeignKey("articles.id"))
    author_id  = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
