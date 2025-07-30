from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    Text,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship, declarative_base

# NOTE: the project already declares Base in app.core.database
# To keep this standalone for first review, we create a local Base;
# replace by `from app.core.database import Base` when integrating.
Base = declarative_base()

class ImportJob(Base):
    __tablename__ = "import_jobs"

    id = Column(Integer, primary_key=True)
    filename = Column(String(255), nullable=False)
    file_format = Column(String(10), nullable=False)   # opml/json/csv
    status = Column(String(20), default="pending", nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())