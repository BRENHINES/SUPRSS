# backend/app/models/oauth.py
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, String, Integer, UniqueConstraint
from ..core.database import Base

class OAuthAccount(Base):
    __tablename__ = "oauth_accounts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    provider: Mapped[str] = mapped_column(String(50), nullable=False)  # 'google' | 'github' | 'microsoft'
    provider_account_id: Mapped[str] = mapped_column(String(255), nullable=False)

    access_token: Mapped[str | None] = mapped_column(String(2048))
    refresh_token: Mapped[str | None] = mapped_column(String(2048))
    expires_at: Mapped[int | None] = mapped_column(Integer)

    __table_args__ = (UniqueConstraint("provider", "provider_account_id",
                                       name="uq_provider_account"),)

    user = relationship("User", back_populates="oauth_accounts")
