from fastapi import FastAPI
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

# 2. CORS Middleware Hardening
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(",") if settings.ALLOWED_ORIGINS else [],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
    max_age=600,
)

# 3. Production HTTPS & Trusted Host Gatekeeper
if not settings.DEBUG:
    app.add_middleware(HTTPSRedirectMiddleware)
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["tureep.ai", "*.tureep.ai", "api.tureep.ai", "localhost", "127.0.0.1", "testserver"]
    )

# 4. Domain Router Attachments
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
