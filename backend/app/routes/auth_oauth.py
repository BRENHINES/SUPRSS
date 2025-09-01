# backend/app/routes/auth_oauth.py
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from authlib.integrations.starlette_client import OAuth, OAuthError
import os
from ..core.database import get_db
from ..models.user import User
from ..models.oauth import OAuthAccount
from ..services.tokens import create_access_token, create_refresh_token

router = APIRouter(prefix="/api/auth/oauth", tags=["auth:oauth"])

API_BASE = os.getenv("API_BASE_URL", "http://localhost:8000")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

oauth = OAuth()
enabled_providers: set[str] = set()

def register_if_configured(name: str, **kwargs):
    client_id = kwargs.get("client_id")
    client_secret = kwargs.get("client_secret")
    if client_id and client_secret:
        oauth.register(name=name, **kwargs)
        enabled_providers.add(name)

# Google (OIDC)
register_if_configured(
    "google",
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    client_kwargs={"scope": "openid email profile"},
)

# GitHub (OAuth2)
register_if_configured(
    "github",
    api_base_url="https://api.github.com/",
    access_token_url="https://github.com/login/oauth/access_token",
    authorize_url="https://github.com/login/oauth/authorize",
    client_id=os.getenv("GITHUB_CLIENT_ID"),
    client_secret=os.getenv("GITHUB_CLIENT_SECRET"),
    client_kwargs={"scope": "user:email"},
)

@router.get("/{provider}")
async def oauth_start(provider: Literal["google", "github", "microsoft"]):
    # Stub de test : doit répondre 200
    return {"ok": True, "where": "start", "provider": provider}

@router.get("/{provider}/callback")
async def oauth_callback(
    provider: Literal["google", "github", "microsoft"],
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
):
    # Stub de test : doit répondre 200
    return {"ok": True, "where": "callback", "provider": provider, "code": code, "state": state, "error": error}