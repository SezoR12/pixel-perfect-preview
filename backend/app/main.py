import uuid
import logging
from datetime import datetime, UTC
from fastapi import FastAPI, Request, Response, HTTPException, status, APIRouter
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.ratelimit import limiter
from app.routers import (
    auth, users, products, demands, pre_deals, waitlist, orders,
    kyc, sanctions, notifications, billing, trade_finance, shipments,
    ml_analytics, supabase_portal
)

main_logger = logging.getLogger("tureep.main")

app = FastAPI(
    title="Tureep AI+ Institutional Trade API",
    description="Smart B2B Cross-Border Commodity Matching Engine & Escrow Execution Terminal",
    version="1.0.0",
)

# 1. Exceptional SlowAPI Rate Limiter Exception Handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# 2. Universal Request ID Middleware for Deep Telemetry Tracing
@app.middleware("http")
async def attach_request_id_and_transport_security(request: Request, call_next):
    # Formulate distributed unique request ID
    req_id = request.headers.get("x-request-id") or str(uuid.uuid4())
    request.state.request_id = req_id

    # Fully restrict HTTP methods
    if request.method not in ("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"):
        return JSONResponse(
            status_code=status.HTTP_405_METHOD_NOT_ALLOWED,
            content={
                "detail": f"Security Gatekeeper: HTTP method {request.method} is actively restricted.",
                "error": {
                    "code": 405,
                    "message": f"Security Gatekeeper: HTTP method {request.method} is actively restricted.",
                    "request_id": req_id,
                    "timestamp": datetime.now(UTC).isoformat()
                }
            }
        )

    # Completely reject oversized payloads (> 5 MB)
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > 5 * 1024 * 1024:
        return JSONResponse(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            content={
                "detail": "Security Gatekeeper: Payload size exceeds active Enterprise 5MB limitation.",
                "error": {
                    "code": 413,
                    "message": "Security Gatekeeper: Payload size exceeds active Enterprise 5MB limitation.",
                    "request_id": req_id,
                    "timestamp": datetime.now(UTC).isoformat()
                }
            }
        )

    response: Response = await call_next(request)
    
    # Fully program active Request ID and Transport Hardening headers
    response.headers["X-Request-ID"] = req_id
    if not settings.DEBUG:
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
        
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Content-Security-Policy"] = "frame-ancestors 'self' https://*.lovable.dev https://*.lovableproject.com https://*.arena.ai https://*.e2b.dev https://*.e2b.local localhost:* 127.0.0.1:*;"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response


# 3. Standardized Error Formatter Handlers (Pydantic Validation & HTTP Exceptions)
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    req_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    errors = exc.errors()
    # Mask potentially sensitive raw value errors or repeats mid-message
    sanitized_errors = [{"field": str(err.get("loc", [])[-1]), "message": err.get("msg")} for err in errors]
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Payload structure validation failed.",
            "error": {
                "code": 422,
                "message": "Payload structure validation failed.",
                "details": sanitized_errors,
                "request_id": req_id,
                "timestamp": datetime.now(UTC).isoformat()
            }
        }
    )


@app.exception_handler(HTTPException)
async def standardized_http_exception_handler(request: Request, exc: HTTPException):
    req_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    return JSONResponse(
        status_code=exc.status_code,
        headers=exc.headers,
        content={
            "detail": exc.detail,
            "error": {
                "code": exc.status_code,
                "message": exc.detail,
                "request_id": req_id,
                "timestamp": datetime.now(UTC).isoformat()
            }
        }
    )


# 4. CORS Middleware Hardening
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(",") if settings.ALLOWED_ORIGINS else [],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
    max_age=600,
)

# 5. Production HTTPS & Trusted Host Gatekeeper
if not settings.DEBUG:
    app.add_middleware(HTTPSRedirectMiddleware)
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["tureep.ai", "*.tureep.ai", "api.tureep.ai", "localhost", "127.0.0.1", "testserver"]
    )


# 6. Authoritative Dual-Mode Router Attachments (Supporting standard /api and robust /api/v1 versions)
def _attach_versioned_routers(target_app: FastAPI, version_prefix: str):
    v_router = APIRouter(prefix=version_prefix)
    v_router.include_router(auth.router)
    v_router.include_router(users.router)
    v_router.include_router(products.router)
    v_router.include_router(demands.router)
    v_router.include_router(pre_deals.router)
    v_router.include_router(waitlist.router)
    v_router.include_router(orders.router)
    v_router.include_router(kyc.router)
    v_router.include_router(sanctions.router)
    v_router.include_router(notifications.router)
    v_router.include_router(billing.router)
    v_router.include_router(trade_finance.router)
    v_router.include_router(shipments.router)
    v_router.include_router(ml_analytics.router)
    v_router.include_router(supabase_portal.router)
    target_app.include_router(v_router)


# Attach Legacy/Standard paths (/api) and Active Versioned paths (/api/v1)
_attach_versioned_routers(app, "/api")
_attach_versioned_routers(app, "/api/v1")


@app.get("/health")
def health_check(request: Request):
    req_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    return JSONResponse(
        content={
            "status": "ok",
            "service": "tureep-institutional-backend",
            "api_versions": ["v1", "legacy"],
            "request_id": req_id,
            "timestamp": datetime.now(UTC).isoformat()
        }
    )
