from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1)
    parent_id: Optional[int] = None

class CommentUpdate(BaseModel):
    content: str = Field(..., min_length=1)

class CommentOut(BaseModel):
    id: int
    article_id: int
    author_id: int
    parent_id: Optional[int] = None
    thread_level: int
    content: Optional[str] = None
    is_edited: bool
    is_deleted: bool
    upvotes: int
    downvotes: int
    created_at: datetime
    updated_at: Optional[datetime] = None
