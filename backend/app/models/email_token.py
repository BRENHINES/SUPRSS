from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, DateTime, ForeignKey, func, Enum as SAEnum
from enum import Enum

from backend.app.core.database import Base


class EmailTokenPurpose(str, Enum):
    VERIFY = "verify"
    RESET = "reset"

class EmailToken(Base):  # Assure-toi d'importer Base depuis ton module de modèles
    __tablename__ = "email_tokens"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    token: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    purpose: Mapped[EmailTokenPurpose] = mapped_column(SAEnum(EmailTokenPurpose), nullable=False)
    expires_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=False)
    used_at: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="email_tokens")
