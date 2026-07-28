"""Users endpoints — profile management"""

import uuid
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
from app.core.auth import get_current_user
from app.core.supabase import supabase, supabase_admin

router = APIRouter()

ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_SIZE = 5 * 1024 * 1024


class ProfileUpdate(BaseModel):
    display_name: str | None = None
    bio: str | None = None
    avatar_url: str | None = None
    phone: str | None = None
    website: str | None = None
    location: str | None = None


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


@router.post("/me/avatar")
async def upload_avatar(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}")

    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "jpg"
    filename = f"avatars/{current_user['id']}/{uuid.uuid4()}.{ext}"

    supabase_admin.storage.from_("images").upload(
        filename,
        contents,
        {"content-type": file.content_type},
    )

    public_url = supabase_admin.storage.from_("images").get_public_url(filename)

    supabase_admin.table("profiles").update({"avatar_url": public_url}).eq("id", current_user["id"]).execute()

    return {"url": public_url}


@router.get("/{username}")
async def get_public_profile(username: str):
    result = supabase.table("profiles").select(
        "username, display_name, avatar_url, bio, created_at"
    ).eq("username", username).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    return result.data
