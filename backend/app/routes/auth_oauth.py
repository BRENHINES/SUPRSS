# backend/app/routes/auth_oauth.py
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

# Microsoft (OIDC v2)
tenant = os.getenv("MICROSOFT_TENANT", "common")
register_if_configured(
    "microsoft",
    server_metadata_url=f"https://login.microsoftonline.com/{tenant}/v2.0/.well-known/openid-configuration",
    client_id=os.getenv("MICROSOFT_CLIENT_ID"),
    client_secret=os.getenv("MICROSOFT_CLIENT_SECRET"),
    client_kwargs={"scope": "openid email profile"},
)

@router.get("/{provider}")
async def oauth_login(provider: str, request: Request):
    if provider not in enabled_providers:
        raise HTTPException(404, "Provider non configuré")
    client = oauth.create_client(provider)
    redirect_uri = f"{API_BASE}/api/auth/oauth/{provider}/callback"
    return await client.authorize_redirect(request, redirect_uri)

@router.get("/{provider}/callback")
async def oauth_callback(provider: str, request: Request, db: Session = Depends(get_db)):
    if provider not in enabled_providers:
        raise HTTPException(404, "Provider non configuré")
    client = oauth.create_client(provider)
    try:
        token = await client.authorize_access_token(request)
    except OAuthError as e:
        raise HTTPException(400, f"OAuth error: {e.error}")

    # -- Récupération profil (GitHub ≠ OIDC) --
    if provider == "github":
        uresp = await client.get("user", token=token)
        gh = uresp.json()
        email = gh.get("email")
        if not email:
            emails = (await client.get("user/emails", token=token)).json()
            primary = next((e for e in emails if e.get("primary") and e.get("verified")), None)
            email = (primary or (emails[0] if emails else {})).get("email")
        sub = str(gh["id"])
        name = gh.get("name") or gh.get("login")
        avatar = gh.get("avatar_url")
    else:
        userinfo = await client.parse_id_token(request, token)
        sub = userinfo.get("sub")
        email = userinfo.get("email")
        name = userinfo.get("name") or userinfo.get("preferred_username")
        avatar = userinfo.get("picture")

    if not email:
        raise HTTPException(400, "Email non disponible via le provider.")

    # -- upsert user + lien OAuth --
    user = db.query(User).filter_by(email=email).first()
    if not user:
        user = User(
            email=email,
            username=(name or email.split("@")[0])[:32],
            full_name=name or "",
            avatar_url=avatar or "",
            is_verified=True,
        )
        db.add(user)
        db.flush()

    link = (
        db.query(OAuthAccount)
        .filter_by(provider=provider, provider_account_id=sub)
        .first()
    )
    if not link:
        db.add(OAuthAccount(user_id=user.id, provider=provider, provider_account_id=sub))

    db.commit()

    access = create_access_token({"sub": str(user.id)})
    refresh = create_refresh_token({"sub": str(user.id)})

    return RedirectResponse(f"{FRONTEND_URL}/auth-ok?access_token={access}&refresh_token={refresh}")
