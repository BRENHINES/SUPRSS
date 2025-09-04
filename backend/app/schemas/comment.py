from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1)
    parent_id: int | None = None


class CommentUpdate(BaseModel):
    content: str = Field(..., min_length=1)


class CommentOut(BaseModel):
    id: int
    article_id: int
    author_id: int
    parent_id: int | None = None
    thread_level: int
    content: str | None = None
    is_edited: bool
    is_deleted: bool
    upvotes: int
    downvotes: int
    created_at: datetime
    updated_at: datetime | None = None
