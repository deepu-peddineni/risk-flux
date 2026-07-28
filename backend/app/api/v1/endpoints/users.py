"""Users endpoints — profile management"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
from app.core.auth import get_current_user
from app.core.supabase import supabase, supabase_admin

router = APIRouter()


class ProfileUpdate(BaseModel):
    display_name: str | None = None
    bio: str | None = None
    avatar_url: str | None = None


@router.get("/me")
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    return current_user


@router.put("/me")
async def update_my_profile(body: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in body.model_dump().items() if v is not None}
    result = supabase_admin.table("profiles").update(update_data).eq("id", current_user["id"]).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to update profile")
    return result.data[0]


@router.get("/{username}")
async def get_public_profile(username: str):
    result = supabase.table("profiles").select(
        "username, display_name, avatar_url, bio, created_at"
    ).eq("username", username).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    return result.data
