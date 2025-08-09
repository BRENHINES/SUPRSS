from datetime import datetime

from fastapi import FastAPI, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware
import logging
from starlette.middleware.gzip import GZipMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware
from .core.database import get_db
from ..app.api.users import router as users_router
from .core.config import settings
from .core.errors import install_exception_handlers
from .core.logging import configure_logging

from .core.exception_handlers import register_exception_handlers
from .schemas.common import HealthResponse, ReadyResponse

from ..app.routes import auth as auth_routes

app = FastAPI(title=settings.APP_NAME, version=settings.VERSION, docs_url="/docs", redoc_url="/redoc")
app_logger = logging.getLogger("app.requests")

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=(settings.CORS_ORIGINS or ["*"]) if settings.DEBUG else settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Exception handlers ---
register_exception_handlers(app)

# --- Logging middleware (simple & utile) ---
@app.middleware("http")
async def log_requests(request: Request, call_next):
    import time, logging
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000
    app_logger.info(
        "%s %s -> %s in %.2fms",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    return response

# --- Probes ---
@app.get("/health", response_model=HealthResponse, response_model_by_alias=True)
def health_check(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"Health Status": "Database is healthy", "timestamp": datetime.now()}

@app.get("/ready", response_model=ReadyResponse, response_model_by_alias=True)
def readiness(db: Session = Depends(get_db)):
    try:
        version = db.execute(text("SELECT version_num FROM alembic_version")).scalar_one()
        return {"Migration Status": "Database ready", "Migrations in sync": True, "Database Version": version, "timestamp": datetime.now()}
    except Exception:
        # DB up mais migrations pas appliquées
        return {"Migration Status": "Database not-ready", "Migrations in sync": False, "Database Version": None, "timestamp": datetime.utcnow()}

app.include_router(auth_routes.router)