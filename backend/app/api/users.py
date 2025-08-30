from fastapi import APIRouter, Depends
from sqlalchemy import text

from ..db.uow import UnitOfWork, get_uow

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/uow-ping")
def uow_ping(uow: UnitOfWork = Depends(get_uow)):
    # Vérifie que la session gérée par le UoW exécute bien une requête
    uow.session.execute(text("SELECT 1"))
    return {"uow": "ok"}
