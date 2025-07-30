from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..core.database import Base


class Article(Base):
    __tablename__ = "articles"

    id    = Column(Integer, primary_key=True)
    title = Column(String(300), nullable=False)
    url   = Column(String(1000), nullable=False)
    guid  = Column(String(500), nullable=False)

    published_at = Column(DateTime(timezone=True))
    feed_id = Column(Integer, ForeignKey("feeds.id"), nullable=False)

    feed = relationship("Feed", back_populates="articles")
    users = relationship("UserArticle", back_populates="article", cascade="all,delete")

    __table_args__ = (Index("ix_guid_feed", "guid", "feed_id", unique=True),)


class UserArticle(Base):
    __tablename__ = "user_articles"
    id         = Column(Integer, primary_key=True)
    user_id    = Column(Integer, ForeignKey("users.id"))
    article_id = Column(Integer, ForeignKey("articles.id"))

    is_read     = Column(Boolean, default=False)
    is_favorite = Column(Boolean, default=False)

    article = relationship("Article", back_populates="users")
    user    = relationship("User")
