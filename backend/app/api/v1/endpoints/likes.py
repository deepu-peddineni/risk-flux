"""Likes endpoints — toggle like on posts (slug or UUID)"""

from fastapi import APIRouter, HTTPException, Depends, status
from app.core.auth import get_current_user
from app.core.supabase import supabase_admin


router = APIRouter()


def _resolve_post_id(post_slug: str) -> str:
    """Resolve a post slug to its UUID."""
    from uuid import UUID as _UUID
    try:
        _UUID(post_slug)
        return post_slug
    except ValueError:
        pass
    from app.core.supabase import supabase
    result = supabase.table("posts").select("id").eq("slug", post_slug).eq("status", "published").single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Post not found")
    return result.data["id"]


@router.post("/post/{post_slug}", status_code=status.HTTP_201_CREATED)
async def like_post(post_slug: str, current_user: dict = Depends(get_current_user)):
    post_id = _resolve_post_id(post_slug)
    try:
        supabase_admin.table("likes").insert({
            "post_id": post_id,
            "user_id": current_user["id"],
        }).execute()
    except Exception:
        raise HTTPException(status_code=409, detail="Already liked")

    post = supabase_admin.table("posts").select("likes_count").eq("id", post_id).single().execute()
    supabase_admin.table("posts").update({"likes_count": post.data["likes_count"] + 1}).eq("id", post_id).execute()

    return {"liked": True}


@router.delete("/post/{post_slug}", status_code=status.HTTP_204_NO_CONTENT)
async def unlike_post(post_slug: str, current_user: dict = Depends(get_current_user)):
    post_id = _resolve_post_id(post_slug)
    supabase_admin.table("likes").delete().eq("post_id", post_id).eq("user_id", current_user["id"]).execute()

    post = supabase_admin.table("posts").select("likes_count").eq("id", post_id).single().execute()
    new_count = max(0, post.data["likes_count"] - 1)
    supabase_admin.table("posts").update({"likes_count": new_count}).eq("id", post_id).execute()
