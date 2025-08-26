import hashlib
from typing import Optional, Tuple
from sqlalchemy.orm import Session

from ..core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, decode_refresh
from ..repositories.user import UserRepository
from ..repositories.session import SessionRepository
from ..models.user import User

def _sha256(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()

class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.users = UserRepository(db)
        self.sessions = SessionRepository(db)

    def _find_user_by_login(self, username_or_email: str) -> Optional[User]:
        if "@" in username_or_email:
            return self.users.get_by_email(username_or_email)
        return self.users.get_by_username(username_or_email)


    def login(self, *, username_or_email: str, password: str, user_agent: Optional[str], ip: Optional[str]) -> Tuple[str, int, str, str]:
        user = self._find_user_by_login(username_or_email)
        if not user or not user.hashed_password or not verify_password(password, user.hashed_password):
            raise ValueError("Invalid credentials")
        if not user.is_active:
            raise ValueError("User inactive")

        # on crée une session et un refresh rotatif
        access_token, access_ttl = create_access_token(str(user.id))
        refresh_token, refresh_exp = create_refresh_token(str(user.id), session_id=0)  # sid placeholder
        # on hash le refresh pour stocker en base
        refresh_hash = _sha256(refresh_token)
        # créer session pour avoir l'id
        session = self.sessions.create(
            user_id=user.id,
            refresh_token_hash=refresh_hash,
            user_agent=user_agent,
            ip_address=ip,
            expires_at=refresh_exp,
        )
        # regénérer un refresh avec le bon sid (session.id)
        refresh_token, refresh_exp = create_refresh_token(str(user.id), session_id=session.id)
        # mettre à jour le hash avec ce nouveau token
        session.refresh_token_hash = _sha256(refresh_token)

        return access_token, access_ttl, refresh_token, refresh_exp.isoformat()

    def refresh(self, *, refresh_token: str, user_agent: Optional[str], ip: Optional[str]) -> Tuple[str, int, str, str]:
        payload = decode_refresh(refresh_token)
        user_id = int(payload["sub"])
        sid = int(payload["sid"])

        session = self.sessions.get_active_by_id(sid)
        if not session or session.user_id != user_id:
            raise ValueError("Invalid session")
        # vérifie le hash
        if session.refresh_token_hash != _sha256(refresh_token):
            # refresh réutilisé / mismatch => sécurité: révoquer cette session
            self.sessions.revoke(session)
            raise ValueError("Refresh token mismatch")

        # rotation: révoque l’ancienne session et crée une nouvelle
        self.sessions.revoke(session)

        # nouveaux tokens
        access_token, access_ttl = create_access_token(str(user_id))
        new_refresh_token, new_refresh_exp = create_refresh_token(str(user_id), session_id=0)
        new_hash = _sha256(new_refresh_token)
        new_session = self.sessions.create(
            user_id=user_id,
            refresh_token_hash=new_hash,
            user_agent=user_agent,
            ip=ip,
            expires_at=new_refresh_exp,
        )
        # finalise refresh avec le vrai sid
        new_refresh_token, new_refresh_exp = create_refresh_token(str(user_id), session_id=new_session.id)
        new_session.refresh_token_hash = _sha256(new_refresh_token)

        return access_token, access_ttl, new_refresh_token, new_refresh_exp.isoformat()

    def logout(self, *, refresh_token: str) -> None:
        payload = decode_refresh(refresh_token)
        sid = int(payload["sid"])
        session = self.sessions.get_active_by_id(sid)
        if session:
            self.sessions.revoke(session)

    def logout_all(self, *, user_id: int) -> int:
        return self.sessions.revoke_all_for_user(user_id)
