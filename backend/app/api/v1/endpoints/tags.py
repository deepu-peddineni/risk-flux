"""Tags, Search, Docs, and Upload endpoints"""

# ---- tags.py ----
from fastapi import APIRouter
from app.core.supabase import supabase

router = APIRouter()


@router.get("/")
async def list_tags():
    result = supabase.table("tags").select("*").order("name").execute()
    return result.data or []
