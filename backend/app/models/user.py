import enum

from sqlalchemy import Boolean, Column, DateTime, Enum, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..core.database import Base


class UserTheme(str, enum.Enum):
    LIGHT = "light"
    DARK = "dark"
    AUTO = "auto"


class FontSize(str, enum.Enum):
    SMALL = "small"
    MEDIUM = "medium"
    LARGE = "large"


class User(Base):
    __tablename__ = "users"

    # Identifiants principaux
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(
        String(255), nullable=True
    )  # Nullable pour OAuth uniquement

    # Informations personnelles
    full_name = Column(String(100), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)

    # Statut du compte
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)

    # Préférences utilisateur
    theme = Column(Enum(UserTheme), default=UserTheme.LIGHT, nullable=False)
    font_size = Column(Enum(FontSize), default=FontSize.MEDIUM, nullable=False)
    articles_per_page = Column(Integer, default=20, nullable=False)
    auto_mark_read = Column(Boolean, default=False, nullable=False)

    # OAuth providers
    google_id = Column(String(100), nullable=True, index=True)
    github_id = Column(String(100), nullable=True, index=True)
    microsoft_id = Column(String(100), nullable=True, index=True)

    # Statistiques
    total_feeds = Column(Integer, default=0, nullable=False)
    total_articles_read = Column(Integer, default=0, nullable=False)

    # Timestamps
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    email_verified_at = Column(DateTime(timezone=True), nullable=True)

    # Relations
    owned_collections = relationship(
        "Collection", back_populates="owner", cascade="all, delete-orphan"
    )
    collection_memberships = relationship(
        "CollectionMember",
        back_populates="user",
        foreign_keys="CollectionMember.user_id",
        cascade="all, delete-orphan",
    )
    invitations_sent = relationship(
        "CollectionMember",
        back_populates="inviter",
        foreign_keys="CollectionMember.invited_by",
    )
    user_articles = relationship(
        "UserArticle", back_populates="user", cascade="all, delete-orphan"
    )
    comments = relationship(
        "Comment", back_populates="author", cascade="all, delete-orphan"
    )
    chat_messages = relationship(
        "ChatMessage", back_populates="author", cascade="all, delete-orphan"
    )
    import_jobs = relationship(
        "ImportJob", back_populates="user", cascade="all, delete-orphan"
    )
    sessions = relationship(
        "UserSession", back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"
