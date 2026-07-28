"""Docs endpoints — versioned documentation pages"""

from fastapi import APIRouter, HTTPException, Depends
from app.core.auth import get_admin_user
from app.core.supabase import supabase, supabase_admin

router = APIRouter()


@router.get("/{category_slug}/{subcategory_slug}")
async def get_doc(category_slug: str, subcategory_slug: str):
    """Get the latest published doc for a subcategory."""
    result = supabase.table("posts").select(
        "*, profiles(username, display_name), categories(name, slug), subcategories(name, slug)"
    ).eq("type", "doc").eq("status", "published").eq(
        "categories.slug", category_slug
    ).eq("subcategories.slug", subcategory_slug).order("published_at", desc=True).limit(1).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Documentation not found")
    return result.data[0]


@router.get("/{category_slug}/{subcategory_slug}/versions")
async def get_doc_versions(category_slug: str, subcategory_slug: str, admin: dict = Depends(get_admin_user)):
    """Get version history for a doc (admin only)."""
    doc = supabase_admin.table("posts").select("id").eq("type", "doc").eq(
        "categories.slug", category_slug
    ).eq("subcategories.slug", subcategory_slug).single().execute()

    if not doc.data:
        raise HTTPException(status_code=404, detail="Doc not found")

    versions = supabase_admin.table("doc_versions").select("*").eq("post_id", doc.data["id"]).order("created_at", desc=True).execute()
    return versions.data or []
