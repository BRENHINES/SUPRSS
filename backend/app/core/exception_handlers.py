import logging
from typing import Any
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from .errors import AppError
from ..schemas.common import ErrorResponse

logger = logging.getLogger("app")

def _to_jsonable(obj: Any):
    if isinstance(obj, (bytes, bytearray)):
        return obj.decode("utf-8", errors="replace")
    if isinstance(obj, dict):
        return {k: _to_jsonable(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple, set)):
        return [_to_jsonable(v) for v in obj]
    if isinstance(obj, Exception):
        return str(obj)
    return obj

def _json_error(*, code: str, message: str, status_code: int,
                details: Any = None, request_id: str | None = None) -> JSONResponse:
    payload = ErrorResponse(
        error=code,
        message=message,
        details=_to_jsonable(details) if details is not None else None,
        request_id=request_id,
    ).model_dump()
    return JSONResponse(status_code=status_code, content=payload)

def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(RequestValidationError)
    async def _validation_handler(request: Request, exc: RequestValidationError):
        return _json_error(
            code="ValidationError",
            message="Invalid request.",
            status_code=422,
            details=exc.errors(),
            request_id=request.headers.get("x-request-id"),
        )

    @app.exception_handler(StarletteHTTPException)
    async def _http_handler(request: Request, exc: StarletteHTTPException):
        code_map = {404: "NotFound", 409: "Conflict", 401: "Unauthorized", 403: "Forbidden"}
        # detail peut être str / dict / list
        msg = exc.detail if isinstance(exc.detail, str) else "HTTP error"
        det = None if isinstance(exc.detail, str) else exc.detail
        return _json_error(
            code=code_map.get(exc.status_code, "HTTPError"),
            message=_to_jsonable(msg),
            status_code=exc.status_code,
            details=_to_jsonable(det),
            request_id=request.headers.get("x-request-id"),
        )

    @app.exception_handler(AppError)
    async def _app_error_handler(request: Request, exc: AppError):
        return _json_error(
            code=exc.code,
            message=exc.message,
            status_code=exc.status_code,
            details=_to_jsonable(exc.details),
            request_id=request.headers.get("x-request-id"),
        )

    @app.exception_handler(Exception)
    async def _unhandled_handler(request: Request, exc: Exception):
        logger.exception("Unhandled error on %s %s", request.method, request.url, exc_info=exc)
        return _json_error(
            code="InternalServerError",
            message="An unexpected error occurred.",
            status_code=500,
            request_id=request.headers.get("x-request-id"),
        )