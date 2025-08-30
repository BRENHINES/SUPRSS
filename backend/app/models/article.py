from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..core.database import Base


class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False, index=True)
    url = Column(String(1000), nullable=False)  # URL article original
    guid = Column(String(500), nullable=False, index=True)  # Identifiant unique RSS

    # Contenu de l'article
    summary = Column(Text, nullable=True)
    content = Column(Text, nullable=True)  # Contenu complet si disponible
    author = Column(String(200), nullable=True, index=True)

    # Métadonnées
    published_at = Column(DateTime(timezone=True), nullable=True, index=True)
    updated_at_source = Column(
        DateTime(timezone=True), nullable=True
    )  # Mise à jour côté source

    # Classification automatique
    language = Column(String(10), nullable=True)
    word_count = Column(Integer, nullable=True)
    reading_time = Column(Integer, nullable=True)  # En minutes

    # Médias
    image_url = Column(String(1000), nullable=True)
    enclosure_url = Column(String(1000), nullable=True)  # Podcast, vidéo
    enclosure_type = Column(String(50), nullable=True)
    enclosure_length = Column(Integer, nullable=True)

    # Engagement
    total_reads = Column(Integer, default=0, nullable=False)
    total_favorites = Column(Integer, default=0, nullable=False)
    total_comments = Column(Integer, default=0, nullable=False)

    # Relations
    feed_id = Column(Integer, ForeignKey("feeds.id"), nullable=False, index=True)

    # Timestamps
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relations
    feed = relationship("Feed", back_populates="articles")
    user_interactions = relationship(
        "UserArticle", back_populates="article", cascade="all, delete-orphan"
    )
    comments = relationship(
        "Comment", back_populates="article", cascade="all, delete-orphan"
    )

    # Index composites pour les performances
    __table_args__ = (
        Index("ix_articles_feed_published", "feed_id", "published_at"),
        Index("ix_articles_guid_feed", "guid", "feed_id", unique=True),
    )

    def __repr__(self):
        return f"<Article(id={self.id}, title='{self.title[:50]}...', feed_id={self.feed_id})>"


class UserArticle(Base):
    """Table de liaison pour les interactions utilisateur-article"""

    __tablename__ = "user_articles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    article_id = Column(Integer, ForeignKey("articles.id"), nullable=False, index=True)

    # États de lecture
    is_read = Column(Boolean, default=False, nullable=False)
    is_favorite = Column(Boolean, default=False, nullable=False)
    is_archived = Column(Boolean, default=False, nullable=False)

    # Métadonnées d'interaction
    read_at = Column(DateTime(timezone=True), nullable=True)
    favorited_at = Column(DateTime(timezone=True), nullable=True)
    archived_at = Column(DateTime(timezone=True), nullable=True)
    read_duration = Column(Integer, nullable=True)  # Temps de lecture en secondes

    # Notes personnelles
    user_notes = Column(Text, nullable=True)
    user_rating = Column(Integer, nullable=True)  # 1-5 étoiles

    # Timestamps
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relations
    user = relationship("User", back_populates="user_articles")
    article = relationship("Article", back_populates="user_interactions")

    # Index unique pour éviter les doublons
    __table_args__ = (
        Index("ix_user_articles_unique", "user_id", "article_id", unique=True),
        Index("ix_user_articles_read", "user_id", "is_read"),
        Index("ix_user_articles_favorite", "user_id", "is_favorite"),
    )

    def __repr__(self):
        return f"<UserArticle(user_id={self.user_id}, article_id={self.article_id}, is_read={self.is_read})>"
