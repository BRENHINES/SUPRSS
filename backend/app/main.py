import logging
from datetime import datetime

from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session
from starlette.middleware.gzip import GZipMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

from ..app.routes import article as articles_routes
from ..app.routes import auth as auth_routes
from ..app.routes import category as categories_routes
from ..app.routes import chat as chat_routes
from ..app.routes import collection as collections_routes
from ..app.routes import comment as comments_routes
from ..app.routes import feed as feeds_routes
from ..app.routes import fetch as fetch_routes
from ..app.routes import imports as imports_routes
from ..app.routes import user as user_routes
# from ..app.api.users import router as users_router
from .core.config import settings
from .core.database import get_db
from .core.errors import install_exception_handlers
from .core.exception_handlers import register_exception_handlers
from .core.logging import configure_logging
from .schemas.common import HealthResponse, ReadyResponse
from .routes.auth_oauth import router as oauth_router
from .routes.auth_email import router as email_router

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)
app_logger = logging.getLogger("app.requests")

# --- CORS ---
ALLOWED_ORIGINS = [
    "http://localhost:5173",   # Vite
    "http://localhost:3000",   # React.js
    #"https://front.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Exception handlers ---
register_exception_handlers(app)


# --- Logging middleware (simple & utile) ---
@app.middleware("http")
async def log_requests(request: Request, call_next):
    import logging
    import time

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
        version = db.execute(
            text("SELECT version_num FROM alembic_version")
        ).scalar_one()
        return {
            "Migration Status": "Database ready",
            "Migrations in sync": True,
            "Database Version": version,
            "timestamp": datetime.now(),
        }
    except Exception:
        # DB up mais migrations pas appliquées
        return {
            "Migration Status": "Database not-ready",
            "Migrations in sync": False,
            "Database Version": None,
            "timestamp": datetime.utcnow(),
        }


app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(categories_routes.router)
app.include_router(feeds_routes.router)
app.include_router(collections_routes.router)
app.include_router(articles_routes.router)
app.include_router(comments_routes.router)
app.include_router(chat_routes.router)
app.include_router(imports_routes.router)
app.include_router(fetch_routes.router)
app.include_router(oauth_router)
app.include_router(email_router)
