# backend/app/services/email_token_service.py
import secrets
from datetime import datetime
from sqlalchemy.orm import Session
from ..models.oauth import EmailToken

def create_email_token(db: Session, user_id: int, purpose: str, hours=48) -> str:
    token = secrets.token_urlsafe(32)
    row = EmailToken(
        user_id=user_id,
        token=token,
        purpose=purpose,
        expires_at=EmailToken.default_expiry(hours=hours),
    )
    db.add(row)
    db.commit()
    return token

def consume_email_token(db: Session, token: str, purpose: str):
    row = db.query(EmailToken).filter(EmailToken.token == token, EmailToken.purpose == purpose).first()
    if not row:
        return None
    if row.used_at or row.expires_at < datetime.utcnow():
        return None
    row.used_at = datetime.utcnow()
    db.commit()
    return row
