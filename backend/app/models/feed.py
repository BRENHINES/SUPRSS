from sqlalchemy import Column, Integer, String, Text, Enum, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from ..core.database import Base


class FeedStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"


class Feed(Base):
    __tablename__ = "feeds"

    id      = Column(Integer, primary_key=True)
    title   = Column(String(200), nullable=False)
    url     = Column(String(500), nullable=False, unique=True)
    status  = Column(Enum(FeedStatus), default=FeedStatus.active)

    collection_id = Column(Integer, ForeignKey("collections.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    collection = relationship("Collection", back_populates="feeds")
    articles   = relationship("Article", back_populates="feed", cascade="all,delete")


class Category(Base):
    __tablename__ = "categories"
    id   = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)


class FeedCategory(Base):
    __tablename__ = "feed_categories"
    id          = Column(Integer, primary_key=True)
    feed_id     = Column(Integer, ForeignKey("feeds.id"))
    category_id = Column(Integer, ForeignKey("categories.id"))
