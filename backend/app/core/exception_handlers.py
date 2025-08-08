import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from .errors import AppError
from ..schemas.common import ErrorResponse

logger = logging.getLogger("app")

def _json_error(code: str, message: str, *, status_code: int, details=None, request_id: str | None = None):
    body = ErrorResponse(error=code, message=message, details=details, request_id=request_id).model_dump()
    return JSONResponse(status_code=status_code, content=body)

def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(RequestValidationError)
    async def validation_handler(request: Request, exc: RequestValidationError):
        return _json_error(
            "ValidationError",
            "Invalid request",
            status_code=422,
            details=exc.errors(),
            request_id=request.headers.get("x-request-id"),
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_handler(request: Request, exc: StarletteHTTPException):
        code_map = {404: "NotFound", 409: "Conflict", 401: "Unauthorized", 403: "Forbidden"}
        return _json_error(
            code_map.get(exc.status_code, "HTTPError"),
            exc.detail or "HTTP error",
            status_code=exc.status_code,
            request_id=request.headers.get("x-request-id"),
        )

    @app.exception_handler(AppError)
    async def app_error_handler(request: Request, exc: AppError):
        return _json_error(
            exc.code,
            exc.message,
            status_code=exc.status_code,
            details=exc.details,
            request_id=request.headers.get("x-request-id"),
        )

    @app.exception_handler(Exception)
    async def unhandled_handler(request: Request, exc: Exception):
        logger.exception("Unhandled error")
        return _json_error(
            "InternalServerError",
            "An unexpected error occurred.",
            status_code=500,
            request_id=request.headers.get("x-request-id"),
        )
