from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import auth, users, products, demands, pre_deals, waitlist

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Tureep AI+ API",
    description="AI-powered B2B pre-deal trade platform",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(products.router)
app.include_router(demands.router)
app.include_router(pre_deals.router)
app.include_router(waitlist.router)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "tureep-ai-backend"}
