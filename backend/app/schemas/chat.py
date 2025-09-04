from datetime import datetime
from typing import Dict, Optional

from pydantic import BaseModel, Field


class ChatCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)
    message_type: str = Field("TEXT", description="TEXT|SYSTEM|ARTICLE_SHARE|FEED_ADD")
    reply_to_id: int | None = None
    metadata_json: str | None = None  # brut si besoin


class ChatUpdate(BaseModel):
    content: str | None = Field(None, min_length=1)
    is_deleted: bool | None = None


class ReactionRequest(BaseModel):
    emoji: str = Field(..., min_length=1, max_length=32)


class ChatOut(BaseModel):
    id: int
    collection_id: int
    author_id: int
    content: str
    message_type: str
    reply_to_id: int | None = None
    is_edited: bool
    is_deleted: bool
    created_at: datetime
    updated_at: datetime | None = None
    reactions: dict[str, int] = {}

    model_config = {"from_attributes": True}
