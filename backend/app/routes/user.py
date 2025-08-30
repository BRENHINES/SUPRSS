from datetime import datetime
from typing import List, Optional

from azure.storage.blob import ContentSettings
from fastapi import (APIRouter, Depends, File, HTTPException, Query, Response,
                     UploadFile, status)
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..api.deps import get_current_user, require_admin
from ..core.config import settings
from ..core.database import get_db
from ..repositories.user import UserRepository
from ..schemas.user import (PasswordChangeRequest, UserCreate, UserFlagsUpdate,
                            UserOut, UserUpdate)
from ..services.blob_storage_service import (AzureBlobStorage, _service_client,
                                             generate_avatar_upload_sas,
                                             make_avatar_blob_name)
from ..services.user_service import UserService

router = APIRouter(prefix="/api/users", tags=["Users"])


# ---------- Schemas locaux pour l’avatar (SAS) ----------
class UploadUrlRequest(BaseModel):
    filename: str = Field(..., examples=["avatar.png", "photo.jpg"])
    content_type: str = Field(..., examples=["image/png", "image/jpeg"])


class UploadUrlResponse(BaseModel):
    method: str = "PUT"
    upload_url: str
    public_url: str
    required_headers: dict
    expires_at: str
    max_mb: int


class SetAvatarRequest(BaseModel):
    blob_url: str = Field(..., description="URL publique du blob sans SAS")


# ---------- Routes CRUD utilisateurs ----------
@router.post("", response_model=UserOut, status_code=201, operation_id="users_create")
def create_user(data: UserCreate, db: Session = Depends(get_db)):
    svc = UserService(db)
    user = svc.create_user(
        email=data.email,
        username=data.username,
        password=data.password,
        full_name=data.full_name,
        avatar_url=data.avatar_url,
        bio=data.bio,
    )
    return user


@router.get("", response_model=List[UserOut], operation_id="users_list")
def list_users(
    response: Response,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    items, total = UserRepository(db).list_paginated(page=page, size=size)
    if response is not None:
        response.headers["X-Total-Count"] = str(total)
    return items


@router.get("/me", response_model=UserOut, operation_id="users_me_get")
def get_me(user=Depends(get_current_user)):
    return user


@router.post(
    "/me/avatar/upload_url",
    response_model=UploadUrlResponse,
    operation_id="users_me_avatar_upload_url",
)
def create_upload_url(data: UploadUrlRequest, user=Depends(get_current_user)):
    try:
        info = generate_avatar_upload_sas(user.id, data.filename, data.content_type)
    except ValueError as e:
        raise HTTPException(status_code=415, detail=str(e))

    return {
        "method": "PUT",
        "upload_url": info["upload_url"],
        "public_url": info["public_url"],
        "required_headers": info["required_headers"],
        "expires_at": info["expires_at"],
        "max_mb": settings.azure_avatar_max_mb,
    }


@router.get("/{user_id}", response_model=UserOut, operation_id="users_get_by_id")
def get_user_by_id(
    user_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)
):
    user = UserService(db).users.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return user


@router.get(
    "/username/{username}", response_model=UserOut, operation_id="users_get_by_name"
)
def get_user_by_username(
    username: str, db: Session = Depends(get_db), _=Depends(get_current_user)
):
    user = UserService(db).users.get_by_username(username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return user


"""@router.patch("/{user_id}", response_model=UserOut, operation_id="users_update_by_id")
def update_user(user_id: int, data: UserUpdate, db: Session = Depends(get_db), me = Depends(get_current_user)):
    if me.id != user_id and not me.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    svc = UserService(db)
    user = svc.update_user(
        user_id,
        email=data.email,
        username=data.username,
        password=data.password,
        full_name=data.full_name,
        avatar_url=data.avatar_url,
        bio=data.bio,
    )
    return user"""


@router.patch("/{user_id}", response_model=UserOut, operation_id="users_update_by_id")
def update_user(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    me=Depends(get_current_user),
):
    svc = UserService(db)
    payload = data.model_dump(exclude_unset=True)
    if not me.is_superuser:
        # empêcher un non-admin de s’auto-promouvoir, etc.
        for forbidden in ("is_superuser", "is_active"):
            payload.pop(forbidden, None)
    updated = svc.update_user(user_id, **payload)
    return updated


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_me(db: Session = Depends(get_db), me=Depends(get_current_user)):
    svc = UserService(db)
    svc.delete_user(target_id=me.id, actor_id=me.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def admin_delete_user(
    user_id: int, db: Session = Depends(get_db), me=Depends(get_current_user)
):
    svc = UserService(db)
    svc.delete_user(target_id=user_id, actor_id=me.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ---------- Avatar - SAS (recommandé) ----------
@router.patch("/me/avatar", operation_id="users_me_avatar_set")
def set_avatar(
    data: SetAvatarRequest,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = UserService(db)
    updated = svc.replace_avatar_url(user=user, new_url=data.blob_url)
    return {"ok": True, "avatar_url": updated.avatar_url}


@router.post("/me/avatar", response_model=UserOut)
def upload_avatar(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Validation simple MIME
    allowed = {"image/jpeg", "image/png", "image/webp"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=415, detail="Unsupported image type")

    blob = AzureBlobStorage()  # lit la config depuis settings
    # On envoie le stream directement à Azure (pas besoin de lire tout en mémoire)
    url = blob.upload_user_avatar(
        user_id=current_user.id,
        filename=file.filename,
        content_type=file.content_type,
        data=file.file,
    )

    svc = UserService(db)
    user = svc.set_avatar_url(user=current_user, url=url)
    return user


@router.delete(
    "/me/avatar",
    status_code=204,
    operation_id="users_me_avatar_delete",
    summary="Supprime l'avatar et le blob associé",
)
def delete_avatar(
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    UserService(db).remove_avatar(user=user)
    return


@router.delete("/me/avatar", response_model=UserOut)
def delete_my_avatar(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = UserService(db).delete_avatar(user=current_user)
    return user


# ---------- Avatar - Proxy (optionnel) ----------
@router.post(
    "/me/avatar/upload",
    summary="Upload direct via le backend (multipart)",
    operation_id="users_me_avatar_upload_proxy",
)
async def upload_avatar_proxy(
    file: UploadFile = File(...),
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    allowed = set(settings.azure_avatar_allowed_types) or {
        "image/png",
        "image/jpeg",
        "image/webp",
    }
    if file.content_type not in allowed:
        raise HTTPException(status_code=415, detail="Unsupported content-type")

    data = await file.read()
    max_bytes = (settings.azure_avatar_max_mb or 2) * 1024 * 1024
    if len(data) > max_bytes:
        raise HTTPException(status_code=413, detail="File too large")

    blob_name = make_avatar_blob_name(user.id, file.filename)
    client = _service_client()
    container = client.get_container_client(settings.azure_avatars_container)
    try:
        container.upload_blob(
            name=blob_name,
            data=data,
            overwrite=True,
            content_settings=ContentSettings(content_type=file.content_type),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {e}")

    public_url = f"{settings.avatar_base_url.rstrip('/')}/{blob_name}"

    updated = UserService(db).replace_avatar_url(user=user, new_url=public_url)
    return {"ok": True, "avatar_url": updated.avatar_url}


# ---------- Sécurité - changement de mot de passe ----------
@router.patch(
    "/me/password",
    status_code=204,
    operation_id="users_me_change_password",
)
def change_my_password(
    payload: PasswordChangeRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    UserService(db).change_password(
        user=current_user,
        old_password=payload.old_password,
        new_password=payload.new_password,
    )
    return Response(status_code=204)


@router.patch(
    "/{user_id}/flags", response_model=UserOut, dependencies=[Depends(get_current_user)]
)
def update_user_flags(
    user_id: int,
    data: UserFlagsUpdate,
    db: Session = Depends(get_db),
):
    repo = UserRepository(db)
    u = repo.get_by_id(user_id)
    if not u:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    if data.is_superuser is not None:
        u.is_superuser = data.is_superuser
    if data.is_active is not None:
        u.is_active = data.is_active
    if data.is_verified is not None:
        u.is_verified = data.is_verified

    db.add(u)
    db.commit()
    db.refresh(u)
    return u
