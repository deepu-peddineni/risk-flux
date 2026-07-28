"""Search service — Supabase full-text search via ilike"""

from app.core.supabase import supabase


async def search_posts(query: str, page: int = 0, hits_per_page: int = 10) -> dict:
    """Search published posts using case-insensitive LIKE across title, excerpt, content."""
    like_pattern = f"%{query}%"

    qb = (
        supabase.table("posts")
        .select(
            "id, title, slug, excerpt, type, reading_time, likes_count, views_count, published_at, "
            "category_id, subcategory_id, "
            "categories(name, slug), subcategories(name, slug), profiles!posts_author_id_fkey(username, display_name, avatar_url)",
            count="exact",
        )
        .eq("status", "published")
        .or_(
            f"title.ilike.{like_pattern},"
            f"excerpt.ilike.{like_pattern},"
            f"content.ilike.{like_pattern}"
        )
        .order("published_at", desc=True)
        .range(page * hits_per_page, (page + 1) * hits_per_page - 1)
    )

    result = qb.execute()

    hits = result.data or []
    total = result.count or 0

    return {
        "hits": hits,
        "nbHits": total,
        "page": page,
        "hitsPerPage": hits_per_page,
        "nbPages": (total + hits_per_page - 1) // hits_per_page if hits_per_page else 0,
    }
