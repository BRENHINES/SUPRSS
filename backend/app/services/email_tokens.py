import secrets
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from ..models.email_token import EmailToken, EmailTokenPurpose

def _now():
    return datetime.now(timezone.utc)

def create_email_token(db: Session, user_id: int, purpose: EmailTokenPurpose, ttl_minutes: int = 60) -> EmailToken:
    t = secrets.token_urlsafe(48)
    row = EmailToken(
        user_id=user_id,
        token=t,
        purpose=purpose,
        expires_at=_now() + timedelta(minutes=ttl_minutes),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row

def use_email_token(db: Session, token: str, purpose: EmailTokenPurpose) -> EmailToken | None:
    row = db.query(EmailToken).filter(
        EmailToken.token == token,
        EmailToken.purpose == purpose,
        EmailToken.used_at.is_(None),
        EmailToken.expires_at > _now(),
    ).first()
    if not row:
        return None
    row.used_at = _now()
    db.commit()
    return row
