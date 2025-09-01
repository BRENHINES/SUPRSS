import os, uuid
from datetime import datetime, timedelta, timezone
from jose import jwt

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
ALGORITHM = "HS256"

ACCESS_EXPIRES_SECONDS = int(os.getenv("ACCESS_EXPIRES_SECONDS", "1800"))      # 30 min
REFRESH_EXPIRES_SECONDS = int(os.getenv("REFRESH_EXPIRES_SECONDS", "2592000")) # 30 jours

def _now():
    return datetime.now(timezone.utc)

def _exp(after_seconds: int):
    return _now() + timedelta(seconds=after_seconds)

def create_access_token(claims: dict, expires_in: int = ACCESS_EXPIRES_SECONDS) -> str:
    payload = claims.copy()
    payload.update({"type": "access", "exp": _exp(expires_in), "iat": _now(), "jti": str(uuid.uuid4())})
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(claims: dict, sid: int | None = None, expires_in: int = REFRESH_EXPIRES_SECONDS) -> str:
    payload = claims.copy()
    payload.update({"type": "refresh", "sid": sid, "exp": _exp(expires_in), "iat": _now(), "jti": str(uuid.uuid4())})
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
