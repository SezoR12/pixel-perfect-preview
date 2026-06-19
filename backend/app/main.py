from fastapi import FastAPI, Request, Response, HTTPException, status
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

app = FastAPI(
    title="Tureep AI+ API",
    description="Smart B2B Cross-Border Commodity Trade Matching & Deal Execution Terminal",
    version="0.2.0",
)

# 1. Exceptional SlowAPI Exception Handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# 2. Strict Transport Security & Payload Inspection Middleware
@app.middleware("http")
async def enforce_transport_security(request: Request, call_next):
    # Fully restrict HTTP methods
    if request.method not in ("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"):
        raise HTTPException(
            status_code=status.HTTP_405_METHOD_NOT_ALLOWED,
            detail=f"Security Gatekeeper: HTTP method {request.method} is actively restricted in production."
        )

    # Completely reject oversized payloads (> 5 MB)
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Security Gatekeeper: Payload size exceeds active Enterprise 5MB transport limitation."
        )

    response: Response = await call_next(request)
    
    # Fully program HSTS & transport hardening headers
    if not settings.DEBUG:
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
        
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response


# 3. CORS Middleware Hardening
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(",") if settings.ALLOWED_ORIGINS else [],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
    max_age=600,
)

# 4. Production HTTPS & Trusted Host Gatekeeper
if not settings.DEBUG:
    app.add_middleware(HTTPSRedirectMiddleware)
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["tureep.ai", "*.tureep.ai", "api.tureep.ai", "localhost", "127.0.0.1", "testserver"]
    )

# 5. Domain Router Attachments
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(products.router)
app.include_router(demands.router)
app.include_router(pre_deals.router)
app.include_router(waitlist.router)
app.include_router(orders.router)
app.include_router(kyc.router)
app.include_router(sanctions.router)
app.include_router(notifications.router)
app.include_router(billing.router)
app.include_router(trade_finance.router)
app.include_router(shipments.router)
app.include_router(ml_analytics.router)
app.include_router(supabase_portal.router)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "tureep-enterprise-backend",
        "mode": "production" if not settings.DEBUG else "development"
    }
