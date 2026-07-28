"""Image upload endpoint — stores to Supabase Storage"""

import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.core.auth import get_admin_user
from app.core.supabase import supabase_admin
from app.core.config import settings

router = APIRouter()

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


@router.post("/image")
async def upload_image(file: UploadFile = File(...), admin: dict = Depends(get_admin_user)):
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "jpg"
    filename = f"posts/{uuid.uuid4()}.{ext}"

    result = supabase_admin.storage.from_("images").upload(
        filename,
        contents,
        {"content-type": file.content_type},
    )

    public_url = supabase_admin.storage.from_("images").get_public_url(filename)
    return {"url": public_url, "filename": filename}
