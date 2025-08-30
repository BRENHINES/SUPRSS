# backend/app/core/errors.py
import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from starlette.exceptions import HTTPException as StarletteHTTPException

from ..schemas.common import ErrorResponse
from .config import settings

logger = logging.getLogger(__name__)


class AppError(Exception):
    status_code = 400
    code = "AppError"

    def __init__(self, message: str = "Application error", *, details=None):
        self.message = message
        self.details = details
        super().__init__(message)


class NotFoundError(AppError):
    status_code = 404
    code = "ResourceNotFound"


class ConflictError(AppError):
    status_code = 409
    code = "Conflict"


class AuthError(AppError):
    status_code = 401
    code = "Unauthorized"


class ForbiddenError(AppError):
    status_code = 403
    code = "Forbidden"


def install_exception_handlers(app: FastAPI):
    @app.exception_handler(SQLAlchemyError)
    async def sqlalchemy_error_handler(request: Request, exc: SQLAlchemyError):
        logger.exception("DB error")
        return JSONResponse(
            status_code=500,
            content={"detail": "Database error"},
        )

    @app.exception_handler(Exception)
    async def unhandled_error_handler(request: Request, exc: Exception):
        logger.exception("Unhandled error")
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"},
        )


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(RequestValidationError)
    async def on_validation_error(request: Request, exc: RequestValidationError):
        # 422 Unprocessable Entity
        payload = ErrorResponse(
            error="Validation error",
            code="VALIDATION_ERROR",
            detail=exc.errors(),
        ).model_dump()
        return JSONResponse(status_code=422, content=payload)

    @app.exception_handler(StarletteHTTPException)
    async def on_http_exception(request: Request, exc: StarletteHTTPException):
        # Unifie 404/401/403 etc. lancées via HTTPException
        payload = ErrorResponse(
            error=exc.detail if isinstance(exc.detail, str) else "HTTP error",
            code=f"HTTP_{exc.status_code}",
        ).model_dump()
        return JSONResponse(status_code=exc.status_code, content=payload)

    @app.exception_handler(IntegrityError)
    async def on_integrity_error(request: Request, exc: IntegrityError):
        # 409 Conflict typique (unique constraint, fk, etc.)
        msg_lower = str(exc.orig).lower() if exc.orig else ""
        if "unique" in msg_lower or "duplicate" in msg_lower:
            code = "UNIQUE_VIOLATION"
            error = "Conflit: ressource déjà existante"
        elif "foreign key" in msg_lower:
            code = "FOREIGN_KEY_VIOLATION"
            error = "Conflit d'intégrité référentielle"
        else:
            code = "INTEGRITY_ERROR"
            error = "Erreur d'intégrité"
        payload = ErrorResponse(
            error=error, code=code, detail=str(exc.orig)
        ).model_dump()
        return JSONResponse(status_code=409, content=payload)

    @app.exception_handler(Exception)
    async def on_unhandled_exception(request: Request, exc: Exception):
        # 500 Internal Server Error
        payload = ErrorResponse(
            error="Internal server error",
            code="INTERNAL_ERROR",
            detail=str(exc) if settings.DEBUG else None,
        ).model_dump()
        return JSONResponse(status_code=500, content=payload)
