import hashlib
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from .config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(plain: str) -> str:
    return pwd_context.hash(plain)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str | None) -> bool:
    if not hashed:
        return False
    return pwd_context.verify(plain, hashed)


def _now() -> datetime:
    return datetime.now(timezone.utc)


def create_access_token(
    sub: str, extra: dict[str, Any] | None = None
) -> tuple[str, int]:
    exp = _now() + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {
        "sub": sub,
        "typ": "access",
        "exp": exp,
        "iat": _now(),
        "jti": str(uuid.uuid4()),
    }
    if extra:
        payload.update(extra)
    token = jwt.encode(
        payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm
    )
    ttl_seconds = int(settings.access_token_expire_minutes * 60)
    return token, ttl_seconds


def create_refresh_token(sub: str, session_id: int) -> tuple[str, datetime]:
    exp = _now() + timedelta(days=settings.refresh_token_expire_days)
    payload = {
        "sub": sub,
        "typ": "refresh",
        "sid": session_id,
        "exp": exp,
        "iat": _now(),
        "jti": str(uuid.uuid4()),
    }
    token = jwt.encode(
        payload, settings.refresh_secret_key, algorithm=settings.jwt_algorithm
    )
    return token, exp


def decode_access(token: str) -> dict:
    payload = jwt.decode(
        token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm]
    )
    if payload.get("typ") != "access":
        raise JWTError("Invalid token type")
    return payload


def decode_refresh(token: str) -> dict:
    payload = jwt.decode(
        token, settings.refresh_secret_key, algorithms=[settings.jwt_algorithm]
    )
    if payload.get("typ") != "refresh":
        raise JWTError("Invalid token type")
    return payload


def refresh_hash(rt: str) -> str:
    return hashlib.sha256(rt.encode("utf-8")).hexdigest()
