from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ArticleOut(BaseModel):
    id: int
    title: str
    url: str
    guid: str
    author: str | None
    summary: str | None
    published_at: datetime | None
    image_url: str | None
    total_reads: int
    total_favorites: int
    total_comments: int
    feed_id: int

    model_config = {"from_attributes": True}


class ArticleUserState(BaseModel):
    is_read: bool = False
    is_favorite: bool = False
    is_archived: bool = False
    user_notes: str | None = None
    user_rating: int | None = None  # 1-5


class ArticleWithState(BaseModel):
    article: ArticleOut
    state: ArticleUserState


class InteractionUpdate(BaseModel):
    is_read: bool | None = None
    is_favorite: bool | None = None
    is_archived: bool | None = None
    user_notes: str | None = None
    user_rating: int | None = Field(None, ge=1, le=5)
