from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ErrorResponse(BaseModel):
    error: str = Field(
        ..., description="Code d'erreur lisible par la machine (ex: ResourceNotFound)"
    )
    message: str = Field(..., description="Message lisible par l'humain")
    details: Any | None = Field(None, description="Détails (validation, contexte…)")
    request_id: str | None = Field(None, description="ID de corrélation (optionnel)")


class PageMeta(BaseModel):
    total: int
    page: int
    size: int


class HealthResponse(BaseModel):
    status: str = Field(alias="Health Status")
    timestamp: datetime


class ReadyResponse(BaseModel):
    status: str = Field(alias="Migration Status")
    migrations_in_sync: bool = Field(alias="Migrations in sync")
    db_version: str = Field(None, alias="Database Version")
    timestamp: datetime
