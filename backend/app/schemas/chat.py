from pydantic import BaseModel, Field
from typing import Optional, Dict
from datetime import datetime

class ChatCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)
    message_type: str = Field("TEXT", description="TEXT|SYSTEM|ARTICLE_SHARE|FEED_ADD")
    reply_to_id: Optional[int] = None
    metadata_json: Optional[str] = None  # brut si besoin

class ChatUpdate(BaseModel):
    content: Optional[str] = Field(None, min_length=1)
    is_deleted: Optional[bool] = None

class ReactionRequest(BaseModel):
    emoji: str = Field(..., min_length=1, max_length=32)

class ChatOut(BaseModel):
    id: int
    collection_id: int
    author_id: int
    content: str
    message_type: str
    reply_to_id: Optional[int] = None
    is_edited: bool
    is_deleted: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    reactions: Dict[str, int] = {}

    model_config = {"from_attributes": True}
