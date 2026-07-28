"""JWT authentication dependency for FastAPI routes

Supports both:
  - Legacy: HS256 with JWT_SECRET (symmetric)
  - JWT Signing Keys: RS256/ES256 via JWKS endpoint (asymmetric, recommended)

The mode is auto-detected: if JWT_SECRET is set → legacy HS256, otherwise → JWKS.
"""

from functools import lru_cache
import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt, jwk
from jose.utils import base64url_decode
from app.core.config import settings
from app.core.supabase import supabase_admin

security = HTTPBearer()


# ── JWKS cache ───────────────────────────────────────────────
@lru_cache(maxsize=1)
def _fetch_jwks() -> dict:
    """Fetch and cache JWKS from Supabase (sync, called once)."""
    resp = httpx.get(settings.jwks_url, timeout=10)
    resp.raise_for_status()
    return resp.json()


def _get_jwk(kid: str) -> dict:
    """Find a specific key from the JWKS by kid."""
    jwks = _fetch_jwks()
    for key in jwks.get("keys", []):
        if key["kid"] == kid:
            return key
    # If kid not found, refresh JWKS once (key rotation)
    _fetch_jwks.cache_clear()
    jwks = _fetch_jwks()
    for key in jwks.get("keys", []):
        if key["kid"] == kid:
            return key
    raise JWTError(f"Key {kid} not found in JWKS")


def _decode_token(token: str) -> dict:
    """Decode and verify a Supabase JWT — auto-selects HS256 or JWKS mode."""
    header = jwt.get_unverified_header(token)
    kid = header.get("kid")
    alg = header.get("alg", "")

    if settings.use_jwks:
        # ── JWT Signing Keys mode (asymmetric) ──────────────
        jwk_data = _get_jwk(kid)
        public_key = jwk.construct(jwk_data)
        payload = jwt.decode(
            token,
            public_key,
            algorithms=[alg],  # RS256 or ES256
            options={"verify_aud": False},
        )
    else:
        # ── Legacy mode (symmetric HS256) ───────────────────
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False},
        )

    return payload


# ── Dependencies ─────────────────────────────────────────────
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Validate Supabase JWT and return user dict."""
    token = credentials.credentials
    try:
        payload = _decode_token(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    # Fetch profile from DB
    result = supabase_admin.table("profiles").select("*").eq("id", user_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User profile not found")

    return result.data


async def get_admin_user(current_user: dict = Depends(get_current_user)) -> dict:
    """Require admin role."""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer(auto_error=False)),
) -> dict | None:
    """Return user if token present, else None (for public routes)."""
    if not credentials:
        return None
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None
