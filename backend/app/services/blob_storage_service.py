import os
import uuid
from urllib.parse import urlparse
import pathlib
from typing import BinaryIO
from azure.storage.blob import BlobServiceClient, ContentSettings, PublicAccess, generate_blob_sas, BlobSasPermissions
from ..core.config import settings

import re
from datetime import datetime, timedelta, timezone

class AzureBlobStorage:
    def __init__(self):
        account = settings.azure_storage_account
        key = settings.azure_storage_key
        container = settings.azure_storage_container

        self.container = container
        self._svc = BlobServiceClient(
            account_url=f"https://{account}.blob.core.windows.net",
            credential=key,
        )
        self._container_client = self._svc.get_container_client(container)

        # Crée le container si n’existe pas (dev). En prod: gérez l’IaC (Terraform/CLI).
        try:
            self._container_client.create_container(public_access=PublicAccess.Blob)
        except Exception:
            pass  # existe déjà

    def upload_user_avatar(self, *, user_id: int, filename: str, content_type: str, data: BinaryIO) -> str:
        # Extension propre
        ext = pathlib.Path(filename).suffix.lower() or ".png"
        blob_name = f"users/{user_id}/avatar_{uuid.uuid4().hex}{ext}"

        blob_client = self._container_client.get_blob_client(blob_name)
        content_settings = ContentSettings(content_type=content_type)

        # Upload stream
        blob_client.upload_blob(data, overwrite=True, content_settings=content_settings)

        # URL publique si container public, sinon génère une SAS (à ajouter si tu veux du privé)
        if settings.azure_storage_public_base:
            return f"{settings.azure_storage_public_base}/{self.container}/{blob_name}"
        return blob_client.url

    def delete_by_url(self, url: str) -> None:
        """
        Supprime le blob en se basant sur l'URL (publique ou non).
        """
        p = urlparse(url)
        # path ex: "/container/users/123/avatar_xxx.png"
        path = p.path.lstrip("/")
        parts = path.split("/", 1)
        if len(parts) < 2:
            return  # on ne sait pas parser -> on ignore

        container = parts[0]
        blob_name = parts[1]
        client = self._svc.get_blob_client(container=container, blob=blob_name)
        client.delete_blob(delete_snapshots="include")


def _service_client() -> BlobServiceClient:
    # Auth par clé de compte
    return BlobServiceClient(
        account_url=settings.azure_blob_endpoint,
        credential=settings.azure_storage_key,
    )

def make_avatar_blob_name(user_id: int, filename: str) -> str:
    # Conserve l’extension si valide
    m = re.search(r"\.([A-Za-z0-9]{1,10})$", filename or "")
    ext = f".{m.group(1).lower()}" if m else ".png"
    return f"{user_id}/{uuid.uuid4().hex}{ext}"

def generate_avatar_upload_sas(user_id: int, filename: str, content_type: str):
    # contrôle rapide du content-type
    allowed = set([t.strip() for t in (settings.azure_avatar_allowed_types or []) if t.strip()])
    if allowed and content_type not in allowed:
        raise ValueError("Unsupported content-type")

    blob_name = make_avatar_blob_name(user_id, filename)
    expires = datetime.now(timezone.utc) + timedelta(minutes=settings.azure_avatar_sas_expire_min)

    sas = generate_blob_sas(
        account_name=settings.azure_storage_account,
        container_name=settings.azure_avatars_container,
        blob_name=blob_name,
        account_key=settings.azure_storage_key,
        permission=BlobSasPermissions(write=True, create=True),
        expiry=expires,
        content_type=content_type,  # facultatif mais utile
    )

    upload_url = f"{settings.avatar_base_url}/{blob_name}?{sas}"
    public_url = f"{settings.avatar_base_url}/{blob_name}"
    return {
        "upload_url": upload_url,
        "public_url": public_url,
        "blob_name": blob_name,
        "expires_at": expires.isoformat(),
        # headers requis si upload direct via fetch/XHR:
        "required_headers": {
            "x-ms-blob-type": "BlockBlob",
            "Content-Type": content_type,
        }
    }

def delete_avatar_blob_by_url(url: str) -> bool:
    """
    Supprime le blob si l’URL correspond à notre conteneur avatars.
    Retourne True si supprimé, False si rien à faire.
    """
    if not url:
        return False

    # On attend un URL genre: https://acc.blob.core.windows.net/avatars/123/uuid.png
    parsed = urlparse(url)
    # path ex: '/avatars/123/uuid.png'
    path = (parsed.path or "").lstrip("/")
    # vérifie conteneur
    prefix = f"{settings.azure_avatars_container}/"
    if not path.startswith(prefix):
        return False

    blob_name = path[len(prefix):]

    client = _service_client()
    container = client.get_container_client(settings.azure_avatars_container)
    try:
        container.delete_blob(blob_name, delete_snapshots="include")
        return True
    except Exception:
        # blob déjà supprimé ? on ignore
        return False