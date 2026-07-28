"""Search endpoint — full-text search across published posts"""

from fastapi import APIRouter, Query
from app.services.search import search_posts

router = APIRouter()


@router.get("/")
async def search(q: str = Query(..., min_length=1), page: int = Query(0, ge=0)):
    results = await search_posts(q, page=page)
    return results
