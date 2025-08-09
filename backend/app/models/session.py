from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base

class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # on stocke uniquement le hash du refresh
    refresh_token_hash = Column(String(255), nullable=False, index=True)

    user_agent = Column(String(300), nullable=True)
    ip_address = Column(String(64), nullable=True)

    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    replaced_by_session_id = Column(Integer, ForeignKey("user_sessions.id"), nullable=True)

    user = relationship("User")
    replaced_by = relationship("UserSession", remote_side=[id], uselist=False)

    __table_args__ = (
        Index("ix_user_sessions_user_active", "user_id", "is_active"),
    )
