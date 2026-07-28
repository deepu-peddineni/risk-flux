"""Risk-Flux FastAPI Backend — Main entry point"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.api.v1.router import api_router

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Risk-Flux API",
    description="Backend API for Risk-Flux — Energy Trading & Technology Knowledge Hub",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {
        "service": "Risk-Flux API",
        "description": "Backend API for Risk-Flux — Energy Trading Risk & Technology Knowledge Hub",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "posts": "/api/v1/posts/",
            "search": "/api/v1/search/?q=",
            "auth": "/api/v1/auth/login",
            "tags": "/api/v1/tags/",
        },
    }


@app.get("/auth/callback")
async def auth_callback_redirect(code: str | None = None):
    """Redirect OAuth callback to the frontend."""
    url = f"{settings.FRONTEND_URL}/auth/callback"
    if code:
        url += f"?code={code}"
    return RedirectResponse(url=url)


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "risk-flux-api"}
