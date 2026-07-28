"""Auth endpoints — signup, login, logout, Google OAuth"""

from fastapi import APIRouter, HTTPException, status, Request
from pydantic import BaseModel, EmailStr
from app.core.supabase import supabase, supabase_admin
from app.core.config import settings
import resend

router = APIRouter()
resend.api_key = settings.RESEND_API_KEY


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    username: str
    display_name: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(body: SignupRequest):
    """Register with email + password. Triggers email confirmation."""
    # Create Supabase auth user
    result = supabase.auth.sign_up({
        "email": body.email,
        "password": body.password,
        "options": {
            "email_redirect_to": f"{settings.FRONTEND_URL}/auth/callback",
            "data": {"username": body.username},
        },
    })
    if result.user is None:
        raise HTTPException(status_code=400, detail="Signup failed. Email may already be registered.")

    user_id = result.user.id

    # Create profile row
    supabase_admin.table("profiles").insert({
        "id": user_id,
        "username": body.username,
        "display_name": body.display_name or body.username,
        "email": body.email,
        "role": "user",
    }).execute()

    return {"message": "Account created. Please check your email to confirm your account."}


@router.post("/login")
async def login(body: LoginRequest):
    """Login with email + password, returns session tokens."""
    result = supabase.auth.sign_in_with_password({
        "email": body.email,
        "password": body.password,
    })
    if result.user is None:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "access_token": result.session.access_token,
        "refresh_token": result.session.refresh_token,
        "token_type": "bearer",
        "user": {
            "id": result.user.id,
            "email": result.user.email,
        },
    }


@router.post("/logout")
async def logout(request: Request):
    """Invalidate the current session."""
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.replace("Bearer ", "")
    supabase.auth.sign_out()
    return {"message": "Logged out successfully"}


@router.post("/refresh")
async def refresh_token(refresh_token: str):
    """Refresh access token using refresh token."""
    result = supabase.auth.refresh_session(refresh_token)
    if not result.session:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    return {
        "access_token": result.session.access_token,
        "refresh_token": result.session.refresh_token,
    }


@router.get("/google")
async def google_oauth():
    """Get Google OAuth sign-in URL."""
    result = supabase.auth.sign_in_with_oauth({
        "provider": "google",
        "options": {
            "redirect_to": f"{settings.FRONTEND_URL}/auth/callback",
        },
    })
    return {"url": result.url}
