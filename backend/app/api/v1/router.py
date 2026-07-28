"""Main API v1 router — aggregates all endpoint routers"""

from fastapi import APIRouter
from app.api.v1.endpoints import auth, posts, docs, comments, likes, users, tags, search, upload

api_router = APIRouter()

api_router.include_router(auth.router,     prefix="/auth",     tags=["Auth"])
api_router.include_router(posts.router,    prefix="/posts",    tags=["Posts"])
api_router.include_router(docs.router,     prefix="/docs",     tags=["Docs"])
api_router.include_router(comments.router, prefix="/comments", tags=["Comments"])
api_router.include_router(likes.router,    prefix="/likes",    tags=["Likes"])
api_router.include_router(users.router,    prefix="/users",    tags=["Users"])
api_router.include_router(tags.router,     prefix="/tags",     tags=["Tags"])
api_router.include_router(search.router,   prefix="/search",   tags=["Search"])
api_router.include_router(upload.router,   prefix="/upload",   tags=["Upload"])
