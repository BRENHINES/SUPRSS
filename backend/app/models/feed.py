from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Enum as PgEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from ..core.database import Base


class FeedStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"
    DELETED = "deleted"


# Important: create_type=False pour éviter que SQLAlchemy essaie de créer l'enum automatiquement
FeedStatusEnum = PgEnum(
    FeedStatus,
    name="feedstatus",
    create_type=False,
    validate_strings=True,
)


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    color = Column(String(7), nullable=True)  # Code couleur hex #FFFFFF
    icon = Column(String(50), nullable=True)  # Nom d'icône
    description = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relations
    feed_categories = relationship("FeedCategory", back_populates="category")

    def __repr__(self):
        return f"<Category(id={self.id}, name='{self.name}')>"


class Feed(Base):
    __tablename__ = "feeds"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    url = Column(String(500), nullable=False, index=True)  # URL du flux RSS
    description = Column(Text, nullable=True)
    website_url = Column(String(500), nullable=True)  # URL du site web
    language = Column(String(10), nullable=True)  # Code ISO langue

    # Configuration du flux - Utiliser l'enum avec create_type=False
    status = Column(FeedStatusEnum, default=FeedStatus.ACTIVE.value, nullable=False)
    update_frequency = Column(Integer, default=60, nullable=False)  # Minutes
    priority = Column(Integer, default=5, nullable=False)  # 1-10, 10 = haute priorité

    # Métadonnées RSS
    rss_title = Column(String(200), nullable=True)  # Titre du flux original
    rss_description = Column(Text, nullable=True)
    rss_image_url = Column(String(500), nullable=True)
    rss_generator = Column(String(100), nullable=True)
    rss_version = Column(String(10), nullable=True)  # RSS 2.0, Atom 1.0, etc.

    # Gestion des mises à jour
    last_fetched_at = Column(DateTime(timezone=True), nullable=True)
    last_modified = Column(String(100), nullable=True)  # Header Last-Modified
    etag = Column(String(100), nullable=True)  # Header ETag
    last_build_date = Column(DateTime(timezone=True), nullable=True)

    # Statistiques et gestion d'erreurs
    total_articles = Column(Integer, default=0, nullable=False)
    successful_fetches = Column(Integer, default=0, nullable=False)
    failed_fetches = Column(Integer, default=0, nullable=False)
    consecutive_failures = Column(Integer, default=0, nullable=False)
    last_error_message = Column(Text, nullable=True)
    last_error_at = Column(DateTime(timezone=True), nullable=True)

    # Relations
    collection_id = Column(Integer, ForeignKey("collections.id"), nullable=False, index=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relations
    collection = relationship("Collection", back_populates="feeds")
    creator = relationship("User")
    articles = relationship("Article", back_populates="feed", cascade="all, delete-orphan")
    categories = relationship("FeedCategory", back_populates="feed", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Feed(id={self.id}, title='{self.title}', url='{self.url}')>"


class FeedCategory(Base):
    __tablename__ = "feed_categories"

    id = Column(Integer, primary_key=True, index=True)
    feed_id = Column(Integer, ForeignKey("feeds.id"), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False, index=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relations
    feed = relationship("Feed", back_populates="categories")
    category = relationship("Category", back_populates="feed_categories")

    def __repr__(self):
        return f"<FeedCategory(feed_id={self.feed_id}, category_id={self.category_id})>"