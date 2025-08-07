from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware
from .core.database import get_db
from ..app.api.users import router as users_router
from .core.config import settings
from .core.errors import install_exception_handlers
from .core.logging import configure_logging

# app = FastAPI()

def create_app() -> FastAPI:
    configure_logging()
    app = FastAPI(title=settings.APP_NAME, version=settings.VERSION)

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS or ["http://localhost:3000"],
        allow_methods=["*"],
        allow_headers=["*"],
        allow_credentials=True,
    )
    # Compression & hosts
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])  # durcir en prod

    install_exception_handlers(app)

    @app.get("/health")
    def health_check(db: Session = Depends(get_db)):
        db.execute(text("SELECT 1"))
        return {"status": "Database connected successfully!"}

    @app.get("/ready")
    def ready_check(db: Session = Depends(get_db)):
        row = db.execute(text("SELECT 1 FROM alembic_version LIMIT 1")).first()
        if not row:
            from fastapi import status
            return {"status": "migrations missing"}, status.HTTP_503_SERVICE_UNAVAILABLE
        return {"status": "ready"}

    return app

app = create_app()

"""@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "Database connected successfully!"}
    except Exception as e:
        return {"status": "Database connection failed", "error": str(e)}

app.include_router(users_router)"""





