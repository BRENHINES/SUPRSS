# backend/app/routes/auth_oauth.py
import secrets, urllib.parse
from typing import Optional
from fastapi import APIRouter, HTTPException, Request, Response, Depends, status
from fastapi.responses import RedirectResponse, JSONResponse
import httpx
from sqlalchemy.orm import Session

from ..core.config import settings
from ..core.database import get_db
from ..models.user import User
from ..repositories.user import UserRepository
from ..services.auth_service import AuthService  # on l’utilise pour émettre tes tokens

router = APIRouter(prefix="/api/auth/oauth", tags=["Auth / OAuth"])

STATE_MAX_AGE = 600  # 10 min

def _cookie_flags():
    # En prod HTTPS: secure=True (sur Render = True)
    return dict(httponly=True, samesite="lax", secure=True)

def _redirect_uri(provider: str) -> str:
    return f"{settings.api_base.rstrip('/')}/api/auth/oauth/{provider}/callback"

def _save_state_cookie(response: Response, name: str, state: str, next_url: str, path: str):
    response.set_cookie(name, f"{state}|{next_url}", max_age=STATE_MAX_AGE, path=path, **_cookie_flags())

def _pop_state_cookie(response: Response, name: str, path: str):
    response.delete_cookie(name, path=path)

def _read_state(request: Request, name: str) -> tuple[str, str]:
    cookie = request.cookies.get(name)
    if not cookie:
        raise HTTPException(status_code=400, detail="Missing state cookie")
    try:
        s, nxt = cookie.split("|", 1)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid state cookie")
    return s, nxt

def _safe_next(next_param: Optional[str]) -> str:
    return next_param or (str(settings.frontend_url).rstrip("/") + "/auth-ok") if settings.frontend_url else "/"

# ====== GOOGLE ======
GOOGLE_AUTH_URL  = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"
STATE_COOKIE_GOOGLE = "oauth_state_google"

@router.get("/google")
def google_start(response: Response, next: Optional[str] = None):
    state = secrets.token_urlsafe(16)
    next_url = _safe_next(next)
    _save_state_cookie(response, STATE_COOKIE_GOOGLE, state, next_url, "/api/auth/oauth/google/callback")

    params = {
        "client_id": settings.google_client_id,
        "response_type": "code",
        "redirect_uri": _redirect_uri("google"),
        "scope": "openid email profile",
        "state": state,
        "access_type": "offline",
        "prompt": "consent",
    }
    url = f"{GOOGLE_AUTH_URL}?{urllib.parse.urlencode(params)}"
    return RedirectResponse(url, status_code=302)

@router.get("/google/callback")
async def google_callback(
    request: Request,
    response: Response,
    code: Optional[str] = None,
    state: Optional[str] = None,
    db: Session = Depends(get_db),
):
    if not code or not state:
        raise HTTPException(status_code=400, detail="Missing code/state")
    state_saved, next_url = _read_state(request, STATE_COOKIE_GOOGLE)
    if state != state_saved:
        raise HTTPException(status_code=400, detail="State mismatch")

    async with httpx.AsyncClient(timeout=15) as client:
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
            raise HTTPException(status_code=400, detail=f"Token exchange failed: {tok.text}")
        access = tok.json().get("access_token")

        ui = await client.get(GOOGLE_USERINFO_URL, headers={"Authorization": f"Bearer {access}"})
        if ui.status_code != 200:
            raise HTTPException(status_code=400, detail=f"UserInfo failed: {ui.text}")

        info = ui.json()
        email = info.get("email")
        sub = info.get("sub")
        name = info.get("name")
        picture = info.get("picture")
        email_verified = bool(info.get("email_verified"))

    # upsert user
    repo = UserRepository(db)
    user = None
    if email:
        user = repo.get_by_email(email)

    if user and not user.google_id:
        user.google_id = sub
        if email_verified:
            user.is_verified = True
        db.add(user)
        db.commit()
        db.refresh(user)
    elif not user:
        # créer un nouvel utilisateur (mdp None)
        from ..services.user_service import UserService
        svc = UserService(db)
        user = svc.create_user(
            email=email or f"google_{sub}@example.local",
            username=(name or f"google_{sub}")[:32],
            password=None,
            full_name=name,
            avatar_url=picture,
            is_verified=email_verified,
            google_id=sub,
        )

    _pop_state_cookie(response, STATE_COOKIE_GOOGLE, "/api/auth/oauth/google/callback")

    # Émettre TES tokens (access/refresh) via AuthService
    auth = AuthService(db)
    access_token, ttl, refresh_token, refresh_exp = auth.mint_for_user(
        user=user,
        user_agent=request.headers.get("user-agent"),
        ip=request.client.host if request.client else None,
    )

    # Pour l’instant on renvoie du JSON (le front n’est pas branché)
    return {
        "provider": "google",
        "user": {"id": user.id, "email": user.email, "username": user.username},
        "token_type": "bearer",
        "access_token": access_token,
        "access_expires_in": ttl,
        "refresh_token": refresh_token,
        "refresh_expires_at": refresh_exp,
    }

# ====== GITHUB ======
GITHUB_AUTH_URL  = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USER_URL  = "https://api.github.com/user"
GITHUB_EMAILS_URL= "https://api.github.com/user/emails"
STATE_COOKIE_GITHUB = "oauth_state_github"

@router.get("/github")
def github_start(response: Response, next: Optional[str] = None):
    state = secrets.token_urlsafe(16)
    next_url = _safe_next(next)
    _save_state_cookie(response, STATE_COOKIE_GITHUB, state, next_url, "/api/auth/oauth/github/callback")

    params = {
        "client_id": settings.github_client_id,
        "redirect_uri": _redirect_uri("github"),
        "scope": "read:user user:email",
        "state": state,
        "allow_signup": "true",
    }
    url = f"{GITHUB_AUTH_URL}?{urllib.parse.urlencode(params)}"
    return RedirectResponse(url, status_code=302)

@router.get("/github/callback")
async def github_callback(
    request: Request,
    response: Response,
    code: Optional[str] = None,
    state: Optional[str] = None,
    db: Session = Depends(get_db),
):
    if not code or not state:
        raise HTTPException(status_code=400, detail="Missing code/state")
    state_saved, next_url = _read_state(request, STATE_COOKIE_GITHUB)
    if state != state_saved:
        raise HTTPException(status_code=400, detail="State mismatch")

    async with httpx.AsyncClient(timeout=15, headers={"Accept": "application/json"}) as client:
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
            raise HTTPException(status_code=400, detail=f"Token exchange failed: {tok.text}")
        access = tok.json().get("access_token")

        u = await client.get(GITHUB_USER_URL, headers={"Authorization": f"Bearer {access}"})
        if u.status_code != 200:
            raise HTTPException(status_code=400, detail=f"User fetch failed: {u.text}")
        userinfo = u.json()

        emails = await client.get(GITHUB_EMAILS_URL, headers={"Authorization": f"Bearer {access}"})
        primary_verified = None
        if emails.status_code == 200:
            for it in emails.json():
                if it.get("primary") and it.get("verified"):
                    primary_verified = it.get("email")
                    break
            if not primary_verified:
                for it in emails.json():
                    if it.get("verified"):
                        primary_verified = it.get("email")
                        break

        github_id = str(userinfo.get("id"))
        login = userinfo.get("login") or f"github_{github_id}"
        name = userinfo.get("name") or login
        avatar = userinfo.get("avatar_url")

    # upsert user
    repo = UserRepository(db)
    user = None
    if primary_verified:
        user = repo.get_by_email(primary_verified)

    if user and not user.github_id:
        user.github_id = github_id
        user.is_verified = True
        db.add(user)
        db.commit()
        db.refresh(user)
    elif not user:
        from ..services.user_service import UserService
        svc = UserService(db)
        user = svc.create_user(
            email=primary_verified or f"github_{github_id}@example.local",
            username=login[:32],
            password=None,
            full_name=name,
            avatar_url=avatar,
            is_verified=bool(primary_verified),
            github_id=github_id,
        )

    _pop_state_cookie(response, STATE_COOKIE_GITHUB, "/api/auth/oauth/github/callback")

    # Émettre TES tokens applicatifs
    auth = AuthService(db)
    access_token, ttl, refresh_token, refresh_exp = auth.mint_for_user(
        user=user,
        user_agent=request.headers.get("user-agent"),
        ip=request.client.host if request.client else None,
    )

    return {
        "provider": "github",
        "user": {"id": user.id, "email": user.email, "username": user.username},
        "token_type": "bearer",
        "access_token": access_token,
        "access_expires_in": ttl,
        "refresh_token": refresh_token,
        "refresh_expires_at": refresh_exp,
    }
