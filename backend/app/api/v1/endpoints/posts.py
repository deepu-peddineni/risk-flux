"""Posts endpoints — CRUD for blog posts and doc pages"""

import math
from uuid import UUID
from fastapi import APIRouter, HTTPException, Depends, Query, status
from pydantic import BaseModel
from typing import Optional
from app.core.auth import get_current_user, get_admin_user, get_optional_user
from app.core.supabase import supabase, supabase_admin
from app.services.reading_time import estimate_reading_time

router = APIRouter()


class PostCreate(BaseModel):
    title: str
    slug: str
    excerpt: str | None = None
    content: str
    cover_image_url: str | None = None
    category_id: int
    subcategory_id: int | None = None
    type: str = "blog"  # "blog" | "doc"
    status: str = "draft"
    tags: list[str] = []


class PostUpdate(BaseModel):
    title: str | None = None
    excerpt: str | None = None
    content: str | None = None
    cover_image_url: str | None = None
    status: str | None = None
    tags: list[str] | None = None


@router.get("/")
async def list_posts(
    category: Optional[str] = None,
    subcategory: Optional[str] = None,
    tag: Optional[str] = None,
    type: Optional[str] = "blog",
    page: int = Query(1, ge=1),
    limit: int = Query(10, le=50),
    current_user: dict | None = Depends(get_optional_user),
):
    query = (
        supabase.table("posts")
        .select("*, profiles!posts_author_id_fkey(username, display_name, avatar_url), categories(name, slug), subcategories(name, slug)")
        .eq("status", "published")
        .eq("type", type)
        .order("published_at", desc=True)
        .range((page - 1) * limit, page * limit - 1)
    )
    if category:
        query = query.eq("categories.slug", category)
    if subcategory:
        query = query.eq("subcategories.slug", subcategory)

    result = query.execute()
    return {"posts": result.data, "page": page, "limit": limit}


@router.get("/{slug}")
async def get_post(slug: str, current_user: dict | None = Depends(get_optional_user)):
    result = supabase.table("posts").select(
        "*, profiles!posts_author_id_fkey(username, display_name, avatar_url), categories(name, slug), subcategories(name, slug), post_tags(tags(name, slug))"
    ).eq("slug", slug).eq("status", "published").single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Post not found")

    # Increment view count
    supabase_admin.table("posts").update({"views_count": result.data["views_count"] + 1}).eq("slug", slug).execute()

    post = result.data
    # Check if current user liked this post
    if current_user:
        like = supabase.table("likes").select("*").eq("post_id", post["id"]).eq("user_id", current_user["id"]).execute()
        post["user_liked"] = len(like.data) > 0
    else:
        post["user_liked"] = False

    return post


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_post(body: PostCreate, admin: dict = Depends(get_admin_user)):
    reading_time = estimate_reading_time(body.content)

    post_data = {
        "title": body.title,
        "slug": body.slug,
        "excerpt": body.excerpt,
        "content": body.content,
        "cover_image_url": body.cover_image_url,
        "author_id": admin["id"],
        "category_id": body.category_id,
        "subcategory_id": body.subcategory_id,
        "type": body.type,
        "status": body.status,
        "reading_time": reading_time,
        "version": "1.0",
    }

    if body.status == "published":
        from datetime import datetime, timezone
        post_data["published_at"] = datetime.now(timezone.utc).isoformat()

    result = supabase_admin.table("posts").insert(post_data).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create post")

    post = result.data[0]

    # Handle tags
    if body.tags:
        _sync_tags(post["id"], body.tags)

    return post


@router.put("/{post_id}")
async def update_post(post_id: UUID, body: PostUpdate, admin: dict = Depends(get_admin_user)):
    # Fetch current post
    current = supabase_admin.table("posts").select("*").eq("id", str(post_id)).single().execute()
    if not current.data:
        raise HTTPException(status_code=404, detail="Post not found")

    update_data = {k: v for k, v in body.model_dump().items() if v is not None and k != "tags"}

    # If content changed and it's a doc, snapshot old version
    if body.content and current.data["type"] == "doc":
        _snapshot_doc_version(post_id, current.data)
        # Bump minor version
        parts = current.data["version"].split(".")
        update_data["version"] = f"{parts[0]}.{int(parts[1]) + 1}"
        update_data["reading_time"] = estimate_reading_time(body.content)

    if body.status == "published" and current.data["status"] == "draft":
        from datetime import datetime, timezone
        update_data["published_at"] = datetime.now(timezone.utc).isoformat()

    result = supabase_admin.table("posts").update(update_data).eq("id", str(post_id)).execute()
    post = result.data[0]

    if body.tags is not None:
        _sync_tags(str(post_id), body.tags)

    return post


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(post_id: UUID, admin: dict = Depends(get_admin_user)):
    supabase_admin.table("posts").delete().eq("id", str(post_id)).execute()


def _snapshot_doc_version(post_id: UUID, post: dict):
    supabase_admin.table("doc_versions").insert({
        "post_id": str(post_id),
        "version": post["version"],
        "content": post["content"],
    }).execute()


def _sync_tags(post_id: str, tag_names: list[str]):
    # Upsert tags and link them
    for name in tag_names:
        slug = name.lower().replace(" ", "-")
        tag_res = supabase_admin.table("tags").upsert({"name": name, "slug": slug}, on_conflict="slug").execute()
        tag_id = tag_res.data[0]["id"]
        supabase_admin.table("post_tags").upsert({"post_id": post_id, "tag_id": tag_id}, on_conflict="post_id,tag_id").execute()
