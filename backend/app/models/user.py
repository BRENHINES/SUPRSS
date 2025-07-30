from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..core.database import Base


class User(Base):
    __tablename__ = "users"

    id       = Column(Integer, primary_key=True, index=True)
    email    = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50),  unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)

    is_active  = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # relations
    owned_collections = relationship("Collection", back_populates="owner", cascade="all,delete")
