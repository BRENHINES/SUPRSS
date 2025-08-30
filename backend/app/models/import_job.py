import enum

from sqlalchemy import (Boolean, Column, DateTime, Enum, ForeignKey, Integer,
                        String, Text)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..core.database import Base


class ImportStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class FileFormat(str, enum.Enum):
    OPML = "opml"
    JSON = "json"
    CSV = "csv"


class ImportJob(Base):
    __tablename__ = "import_jobs"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    file_format = Column(Enum(FileFormat), nullable=False)
    file_size = Column(Integer, nullable=True)  # Taille en bytes

    # État de l'import
    status = Column(Enum(ImportStatus), default=ImportStatus.PENDING, nullable=False)
    progress_percentage = Column(Integer, default=0, nullable=False)

    # Résultats de l'import
    total_feeds = Column(Integer, default=0, nullable=False)
    imported_feeds = Column(Integer, default=0, nullable=False)
    failed_feeds = Column(Integer, default=0, nullable=False)
    skipped_feeds = Column(Integer, default=0, nullable=False)  # Déjà existants

    # Messages et erreurs
    success_message = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    error_log = Column(Text, nullable=True)  # Détails des erreurs

    # Configuration de l'import
    target_collection_id = Column(Integer, ForeignKey("collections.id"), nullable=True)
    override_existing = Column(Boolean, default=False, nullable=False)

    # Relations
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Timestamps
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relations
    user = relationship("User", back_populates="import_jobs")
    target_collection = relationship("Collection")

    def __repr__(self):
        return f"<ImportJob(id={self.id}, filename='{self.filename}', status='{self.status}')>"
