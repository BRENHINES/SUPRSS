from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from ..models.session import UserSession


class SessionRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        *,
        user_id: int,
        refresh_token_hash: str,
        user_agent: Optional[str],
        ip_address: Optional[str],
        expires_at: datetime
    ) -> UserSession:
        s = UserSession(
            user_id=user_id,
            refresh_token_hash=refresh_token_hash,
            user_agent=user_agent,
            ip_address=ip_address,
            expires_at=expires_at,
            is_active=True,
        )
        self.db.add(s)
        self.db.flush()  # pour obtenir l'id
        return s

    def get_active_by_id(self, session_id: int) -> Optional[UserSession]:
        return (
            self.db.query(UserSession)
            .filter(UserSession.id == session_id, UserSession.is_active == True)
            .first()
        )

    def revoke(
        self, session: UserSession, *, replaced_by: Optional[int] = None
    ) -> None:
        session.is_active = False
        session.revoked_at = datetime.now()
        session.replaced_by_session_id = replaced_by

    def revoke_all_for_user(self, user_id: int) -> int:
        q = self.db.query(UserSession).filter(
            UserSession.user_id == user_id, UserSession.is_active == True
        )
        count = 0
        for s in q:
            s.is_active = False
            s.revoked_at = datetime.now()
            count += 1
        return count
