# backend/app/routes/auth_oauth.py
import urllib.parse
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from ..core.config import settings
from ..core.database import get_db
from ..repositories.user import UserRepository
from ..services.auth_service import AuthService
from ..services.user_service import UserService

router = APIRouter(prefix="/api/auth/oauth", tags=["Auth / OAuth"])

# Helpers -----------------------------------------------------------------

def _api_base() -> str:
    # settings.api_base peut être AnyHttpUrl → on caste en str et on vire le trailing slash
    return str(settings.api_base).rstrip("/")

def _redirect_uri(provider: str) -> str:
    return f"{_api_base()}/api/auth/oauth/{provider}/callback"

# GOOGLE ------------------------------------------------------------------

GOOGLE_AUTH_URL   = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL  = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO   = "https://www.googleapis.com/oauth2/v3/userinfo"

@router.get("/google")
def google_start():
    if not settings.google_client_id or not settings.google_client_secret:
        raise HTTPException(status_code=500, detail="Google OAuth is not configured")

    params = {
        "client_id": settings.google_client_id,
        "response_type": "code",
        "redirect_uri": _redirect_uri("google"),
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
    }
    url = f"{GOOGLE_AUTH_URL}?{urllib.parse.urlencode(params)}"
    return RedirectResponse(url)

@router.get("/google/callback")
async def google_callback(
    request: Request,
    code: str | None = None,
    db: Session = Depends(get_db),
):
    if not code:
        raise HTTPException(status_code=400, detail="Missing 'code'")

    async with httpx.AsyncClient(timeout=15) as client:
        # 1) échange du code contre un access_token
        tok = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "grant_type": "authorization_code",
                "redirect_uri": _redirect_uri("google"),
            },
            headers={"content-type": "application/x-www-form-urlencoded"},
        )
        if tok.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Google token error: {tok.text}")
        access_token = tok.json().get("access_token")
        if not access_token:
            raise HTTPException(status_code=400, detail="No access_token from Google")

        # 2) userinfo
        ui = await client.get(GOOGLE_USERINFO, headers={"Authorization": f"Bearer {access_token}"})
        if ui.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Google userinfo error: {ui.text}")
        info = ui.json()

    email = info.get("email")
    sub = info.get("sub")
    name = info.get("name") or f"google_{sub}"
    picture = info.get("picture")
    email_verified = bool(info.get("email_verified"))

    # upsert user
    repo = UserRepository(db)
    user = repo.get_by_email(email) if email else None
    if user:
        if not user.google_id:
            user.google_id = sub
            if email_verified:
                user.is_verified = True
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user = UserService(db).create_user(
            email=email or f"google_{sub}@example.local",
            username=name[:32],
            password=None,  # pas de mdp pour OAuth
            full_name=name,
            avatar_url=picture,
            is_verified=email_verified,
            google_id=sub,
        )

    # émettre tes tokens applicatifs
    auth = AuthService(db)
    access, ttl, refresh, refresh_exp = auth.mint_for_user(
        user=user,
        user_agent=request.headers.get("user-agent"),
        ip=request.client.host if request.client else None,
    )

    return {
        "provider": "google",
        "user": {"id": user.id, "email": user.email, "username": user.username},
        "token_type": "bearer",
        "access_token": access,
        "access_expires_in": ttl,
        "refresh_token": refresh,
        "refresh_expires_at": refresh_exp,
    }

# GITHUB ------------------------------------------------------------------

GITHUB_AUTH_URL   = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL  = "https://github.com/login/oauth/access_token"
GITHUB_USER_URL   = "https://api.github.com/user"
GITHUB_EMAILS_URL = "https://api.github.com/user/emails"

@router.get("/github")
def github_start():
    if not settings.github_client_id or not settings.github_client_secret:
        raise HTTPException(status_code=500, detail="GitHub OAuth is not configured")

    params = {
        "client_id": settings.github_client_id,
        "redirect_uri": _redirect_uri("github"),
        "scope": "read:user user:email",
        # pas de state pour la version minimale
        "allow_signup": "true",
    }
    url = f"{GITHUB_AUTH_URL}?{urllib.parse.urlencode(params)}"
    return RedirectResponse(url)

@router.get("/github/callback")
async def github_callback(
    request: Request,
    code: str | None = None,
    db: Session = Depends(get_db),
):
    if not code:
        raise HTTPException(status_code=400, detail="Missing 'code'")

    async with httpx.AsyncClient(timeout=15, headers={"Accept": "application/json"}) as client:
        # 1) échange du code contre access_token
        tok = await client.post(
            GITHUB_TOKEN_URL,
            data={
                "client_id": settings.github_client_id,
                "client_secret": settings.github_client_secret,
                "code": code,
                "redirect_uri": _redirect_uri("github"),
            },
        )
        if tok.status_code != 200:
            raise HTTPException(status_code=400, detail=f"GitHub token error: {tok.text}")
        access_token = tok.json().get("access_token")
        if not access_token:
            raise HTTPException(status_code=400, detail="No access_token from GitHub")

        # 2) /user
        u = await client.get(GITHUB_USER_URL, headers={"Authorization": f"Bearer {access_token}"})
        if u.status_code != 200:
            raise HTTPException(status_code=400, detail=f"GitHub user error: {u.text}")
        userinfo = u.json()

        # 3) /user/emails pour obtenir un email vérifié
        primary_verified: str | None = None
        e = await client.get(GITHUB_EMAILS_URL, headers={"Authorization": f"Bearer {access_token}"})
        if e.status_code == 200:
            emails = e.json() or []
            # d’abord primary+verified
            for it in emails:
                if it.get("primary") and it.get("verified"):
                    primary_verified = it.get("email")
                    break
            # sinon n’importe quel verified
            if not primary_verified:
                for it in emails:
                    if it.get("verified"):
                        primary_verified = it.get("email")
                        break

    github_id = str(userinfo.get("id"))
    login = (userinfo.get("login") or f"github_{github_id}")[:32]
    name = userinfo.get("name") or login
    avatar = userinfo.get("avatar_url")

    # upsert user
    repo = UserRepository(db)
    user = repo.get_by_email(primary_verified) if primary_verified else None
    if user:
        if not user.github_id:
            user.github_id = github_id
            user.is_verified = True
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user = UserService(db).create_user(
            email=primary_verified or f"github_{github_id}@example.local",
            username=login,
            password=None,
            full_name=name,
            avatar_url=avatar,
            is_verified=bool(primary_verified),
            github_id=github_id,
        )

    # tokens applicatifs
    auth = AuthService(db)
    access, ttl, refresh, refresh_exp = auth.mint_for_user(
        user=user,
        user_agent=request.headers.get("user-agent"),
        ip=request.client.host if request.client else None,
    )

    return {
        "provider": "github",
        "user": {"id": user.id, "email": user.email, "username": user.username},
        "token_type": "bearer",
        "access_token": access,
        "access_expires_in": ttl,
        "refresh_token": refresh,
        "refresh_expires_at": refresh_exp,
    }
