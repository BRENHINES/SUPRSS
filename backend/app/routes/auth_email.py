from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
import os

from ..core.database import get_db
from ..api.deps import get_current_user
from ..models.user import User
from ..models.email_token import EmailTokenPurpose
from ..services.email_tokens import create_email_token, use_email_token
from ..services.email_service import send_email, verification_email_html, reset_email_html
from ..core.security import hash_password

router = APIRouter(prefix="/api/auth", tags=["auth:email"])

API_BASE = os.getenv("API_BASE_URL", "http://localhost:8000")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

class ForgotIn(BaseModel):
    email: EmailStr

class ResetIn(BaseModel):
    token: str
    password: str

@router.post("/send-verify")
async def send_verify_email(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if getattr(current_user, "is_verified", False):
        return {"detail": "Déjà vérifié."}
    row = create_email_token(db, current_user.id, EmailTokenPurpose.VERIFY, ttl_minutes=60*24)
    link = f"{API_BASE}/api/auth/verify-email?token={row.token}"
    await send_email(current_user.email, "Vérifie ton e-mail", verification_email_html(link))
    return {"ok": True}

@router.get("/verify-email")
async def verify_email(token: str, db: Session = Depends(get_db)):
    row = use_email_token(db, token, EmailTokenPurpose.VERIFY)
    if not row:
        raise HTTPException(400, "Token invalide ou expiré")
    user = db.get(User, row.user_id)
    if not user:
        raise HTTPException(404, "Utilisateur introuvable")
    user.is_verified = True
    db.commit()
    return {"ok": True}

@router.post("/forgot-password")
async def forgot_password(body: ForgotIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if user:
        row = create_email_token(db, user.id, EmailTokenPurpose.RESET, ttl_minutes=60)
        link = f"{FRONTEND_URL}/reset-password?token={row.token}"
        await send_email(user.email, "Réinitialisation du mot de passe", reset_email_html(link))
    return {"ok": True}

@router.post("/reset-password")
async def reset_password(body: ResetIn, db: Session = Depends(get_db)):
    row = use_email_token(db, body.token, EmailTokenPurpose.RESET)
    if not row:
        raise HTTPException(400, "Token invalide ou expiré")
    user = db.get(User, row.user_id)
    if not user:
        raise HTTPException(404, "Utilisateur introuvable")
    user.hashed_password = hash_password(body.password)
    db.commit()
    return {"ok": True}
