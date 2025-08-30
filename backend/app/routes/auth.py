from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ..api.deps import get_current_user
from ..core.database import get_db
from ..schemas.auth import LoginRequest, LogoutRequest, RefreshRequest, TokenPair, UserPublic
from ..services.auth_service import AuthService

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/login", response_model=TokenPair)
def login(data: LoginRequest, request: Request, db: Session = Depends(get_db)):
    svc = AuthService(db)
    try:
        access, ttl, refresh, refresh_exp = svc.login(
            username_or_email=data.username_or_email,
            password=data.password,
            user_agent=request.headers.get("user-agent"),
            ip=request.client.host if request.client else None,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    return {
        "access_token": access,
        "refresh_token": refresh,
        "access_expires_in": ttl,
        "refresh_expires_at": refresh_exp,
        "token_type": "bearer",
    }


@router.post("/token")  # <-- endpoint utilisé par Swagger
def token(
    form: OAuth2PasswordRequestForm = Depends(),
    request: Request = None,
    db: Session = Depends(get_db),
):
    svc = AuthService(db)
    try:
        access, ttl, refresh, refresh_exp = svc.login(
            username_or_email=form.username,  # accepte username OU email
            password=form.password,
            user_agent=request.headers.get("user-agent") if request else None,
            ip=request.client.host if request and request.client else None,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    return {"access_token": access, "token_type": "bearer"}  # <== format minimal


@router.post("/refresh", response_model=TokenPair)
def refresh(data: RefreshRequest, request: Request, db: Session = Depends(get_db)):
    svc = AuthService(db)
    try:
        access, ttl, refresh, refresh_exp = svc.refresh(
            refresh_token=data.refresh_token,
            user_agent=request.headers.get("user-agent"),
            ip=request.client.host if request.client else None,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    return {
        "access_token": access,
        "refresh_token": refresh,
        "access_expires_in": ttl,
        "refresh_expires_at": refresh_exp,
        "token_type": "bearer",
    }


@router.post("/logout")
def logout(data: LogoutRequest, db: Session = Depends(get_db)):
    svc = AuthService(db)
    svc.logout(refresh_token=data.refresh_token)
    return {"ok": True}


@router.post("/logout_all")
def logout_all(user=Depends(get_current_user), db: Session = Depends(get_db)):
    svc = AuthService(db)
    count = svc.logout_all(user_id=user.id)
    return {"revoked": count}


@router.get("/me", response_model=UserPublic)
def me(user=Depends(get_current_user)):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "is_active": user.is_active,
        "is_superuser": user.is_superuser,
    }
