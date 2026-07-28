"""Comments endpoints — nested comments with replies"""

from uuid import UUID
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from app.core.auth import get_current_user, get_optional_user
from app.core.supabase import supabase, supabase_admin

router = APIRouter()


class CommentCreate(BaseModel):
    content: str
    parent_id: UUID | None = None


class CommentUpdate(BaseModel):
    content: str


def build_comment_tree(flat: list[dict]) -> list[dict]:
    """Convert a flat list of comments into a nested tree."""
    by_id = {c["id"]: {**c, "replies": []} for c in flat}
    roots = []
    for comment in by_id.values():
        pid = comment.get("parent_id")
        if pid and pid in by_id:
            by_id[pid]["replies"].append(comment)
        else:
            roots.append(comment)
    return roots


def _resolve_post_id(slug_or_uuid: str) -> str:
    """Resolve a post slug to its UUID. If already a UUID, return as-is."""
    try:
        UUID(slug_or_uuid)
        return slug_or_uuid
    except ValueError:
        pass
    result = supabase.table("posts").select("id").eq("slug", slug_or_uuid).eq("status", "published").single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Post not found")
    return result.data["id"]


@router.get("/post/{post_slug}")
async def get_comments(post_slug: str, current_user: dict | None = Depends(get_optional_user)):
    post_id = _resolve_post_id(post_slug)
    result = supabase.table("comments").select(
        "*, profiles!comments_user_id_fkey(username, display_name, avatar_url)"
    ).eq("post_id", post_id).order("created_at").execute()

    return {"comments": build_comment_tree(result.data or [])}


@router.post("/post/{post_slug}", status_code=status.HTTP_201_CREATED)
async def add_comment(
    post_slug: str,
    body: CommentCreate,
    current_user: dict = Depends(get_current_user),
):
    post_id = _resolve_post_id(post_slug)
    data = {
        "post_id": post_id,
        "user_id": current_user["id"],
        "content": body.content,
        "parent_id": str(body.parent_id) if body.parent_id else None,
    }
    result = supabase_admin.table("comments").insert(data).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to post comment")
    return result.data[0]


@router.put("/{comment_id}")
async def update_comment(
    comment_id: UUID,
    body: CommentUpdate,
    current_user: dict = Depends(get_current_user),
):
    comment = supabase_admin.table("comments").select("*").eq("id", str(comment_id)).single().execute()
    if not comment.data:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.data["user_id"] != current_user["id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorised to edit this comment")

    result = supabase_admin.table("comments").update({"content": body.content}).eq("id", str(comment_id)).execute()
    return result.data[0]


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(comment_id: UUID, current_user: dict = Depends(get_current_user)):
    comment = supabase_admin.table("comments").select("*").eq("id", str(comment_id)).single().execute()
    if not comment.data:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.data["user_id"] != current_user["id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorised to delete this comment")

    supabase_admin.table("comments").delete().eq("id", str(comment_id)).execute()
