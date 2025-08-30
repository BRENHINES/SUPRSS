from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ArticleOut(BaseModel):
    id: int
    title: str
    url: str
    guid: str
    author: Optional[str]
    summary: Optional[str]
    published_at: Optional[datetime]
    image_url: Optional[str]
    total_reads: int
    total_favorites: int
    total_comments: int
    feed_id: int

    model_config = {"from_attributes": True}


class ArticleUserState(BaseModel):
    is_read: bool = False
    is_favorite: bool = False
    is_archived: bool = False
    user_notes: Optional[str] = None
    user_rating: Optional[int] = None  # 1-5


class ArticleWithState(BaseModel):
    article: ArticleOut
    state: ArticleUserState


class InteractionUpdate(BaseModel):
    is_read: Optional[bool] = None
    is_favorite: Optional[bool] = None
    is_archived: Optional[bool] = None
    user_notes: Optional[str] = None
    user_rating: Optional[int] = Field(None, ge=1, le=5)
