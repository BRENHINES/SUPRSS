from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..core.database import Base


class Collection(Base):
    __tablename__ = "collections"

    id   = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    is_personal = Column(Boolean, default=True)

    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner   = relationship("User", back_populates="owned_collections")
    feeds   = relationship("Feed", back_populates="collection", cascade="all,delete")
    members = relationship("CollectionMember", back_populates="collection", cascade="all,delete")


class CollectionMember(Base):
    __tablename__ = "collection_members"

    id            = Column(Integer, primary_key=True)
    collection_id = Column(Integer, ForeignKey("collections.id"), nullable=False)
    user_id       = Column(Integer, ForeignKey("users.id"), nullable=False)

    can_add_feeds = Column(Boolean, default=False)

    collection = relationship("Collection", back_populates="members")
    user       = relationship("User")
