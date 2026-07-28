"""Application configuration via environment variables"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # App
    DEBUG: bool = False

    # Supabase — new key names (sb_publishable / sb_secret)
    SUPABASE_URL: str
    SUPABASE_PUBLISHABLE_KEY: str = ""   # sb_publishable_xxx — client-side / anon operations
    SUPABASE_SECRET_KEY: str = ""        # sb_secret_xxx — server-side / admin operations

    # Legacy fallback — still supported, but prefer the new keys above
    SUPABASE_ANON_KEY: str = ""          # legacy anon key (deprecated late 2026)
    SUPABASE_SERVICE_KEY: str = ""       # legacy service_role key (deprecated late 2026)

    # JWT — verify user access tokens issued by Supabase Auth
    # Option A (legacy): set JWT_SECRET to your symmetric secret (HS256)
    # Option B (JWT Signing Keys): leave JWT_SECRET empty, auto-uses JWKS endpoint
    JWT_SECRET: str = ""                 # set only if using legacy HS256 JWT secret

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # CORS — override as JSON array in .env: ALLOWED_ORIGINS=["https://domain.com"]
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://risk-flux.is-a.dev",
        "https://risk-flux.vercel.app",
    ]

    # Resend (email)
    RESEND_API_KEY: str = ""
    RESEND_FROM_EMAIL: str = "noreply@risk-flux.is-a.dev"

    # Frontend URL
    FRONTEND_URL: str = "http://localhost:3000"

    @property
    def effective_publishable_key(self) -> str:
        """Return the publishable key, falling back to legacy anon key."""
        return self.SUPABASE_PUBLISHABLE_KEY or self.SUPABASE_ANON_KEY

    @property
    def effective_secret_key(self) -> str:
        """Return the secret key, falling back to legacy service_role key."""
        return self.SUPABASE_SECRET_KEY or self.SUPABASE_SERVICE_KEY

    @property
    def jwks_url(self) -> str:
        """JWKS endpoint for JWT Signing Keys (asymmetric verification)."""
        return f"{self.SUPABASE_URL}/auth/v1/.well-known/jwks.json"

    @property
    def use_jwks(self) -> bool:
        """True if using JWT Signing Keys (no legacy secret set)."""
        return not self.JWT_SECRET

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
