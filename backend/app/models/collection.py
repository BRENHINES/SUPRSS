from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..core.database import Base


class Collection(Base):
    __tablename__ = "collections"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    slug = Column(String(100), nullable=True, index=True)  # URL friendly

    # Type de collection
    is_public = Column(Boolean, default=False, nullable=False)
    is_personal = Column(Boolean, default=True, nullable=False)

    # Propriétaire
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Paramètres de la collection
    allow_comments = Column(Boolean, default=True, nullable=False)
    allow_chat = Column(Boolean, default=True, nullable=False)
    auto_fetch_feeds = Column(Boolean, default=True, nullable=False)

    # Statistiques
    total_feeds = Column(Integer, default=0, nullable=False)
    total_articles = Column(Integer, default=0, nullable=False)
    total_members = Column(Integer, default=1, nullable=False)  # Owner inclus

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_activity = Column(DateTime(timezone=True), server_default=func.now())

    # Relations
    owner = relationship("User", back_populates="owned_collections")
    members = relationship("CollectionMember", back_populates="collection", cascade="all, delete-orphan")
    feeds = relationship("Feed", back_populates="collection", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="collection", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Collection(id={self.id}, name='{self.name}', owner_id={self.owner_id})>"


class CollectionMember(Base):
    __tablename__ = "collection_members"

    id = Column(Integer, primary_key=True, index=True)
    collection_id = Column(Integer, ForeignKey("collections.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Permissions granulaires
    can_read = Column(Boolean, default=True, nullable=False)
    can_add_feeds = Column(Boolean, default=False, nullable=False)
    can_edit_feeds = Column(Boolean, default=False, nullable=False)
    can_delete_feeds = Column(Boolean, default=False, nullable=False)
    can_comment = Column(Boolean, default=True, nullable=False)
    can_chat = Column(Boolean, default=True, nullable=False)
    can_invite = Column(Boolean, default=False, nullable=False)

    # Statut
    is_admin = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Invitation
    invited_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    invitation_token = Column(String(100), nullable=True, index=True)
    invitation_accepted_at = Column(DateTime(timezone=True), nullable=True)

    # Timestamps
    joined_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    last_activity = Column(DateTime(timezone=True), server_default=func.now())

    # Relations
    collection = relationship("Collection", back_populates="members")
    user = relationship("User", back_populates="collection_memberships", foreign_keys=[user_id])
    inviter = relationship("User", back_populates="invitations_sent", foreign_keys=[invited_by])

    def __repr__(self):
        return f"<CollectionMember(collection_id={self.collection_id}, user_id={self.user_id})>"
