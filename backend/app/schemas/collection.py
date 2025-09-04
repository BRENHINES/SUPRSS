from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class CollectionCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = None
    slug: str | None = Field(None, min_length=1, max_length=100)
    is_public: bool = False
    is_personal: bool = True
    allow_comments: bool = True
    allow_chat: bool = True
    auto_fetch_feeds: bool = True

    model_config = {"from_attributes": True}


class CollectionUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    slug: str | None = None
    is_public: bool | None = None
    is_personal: bool | None = None
    allow_comments: bool | None = None
    allow_chat: bool | None = None
    auto_fetch_feeds: bool | None = None

    model_config = {"from_attributes": True}


class CollectionOut(BaseModel):
    id: int
    name: str
    description: str | None
    slug: str | None
    is_public: bool
    is_personal: bool
    total_feeds: int
    total_articles: int
    total_members: int
    owner_id: int
    created_at: datetime
    updated_at: datetime | None
    last_activity: datetime | None

    model_config = {"from_attributes": True}


# Members
class MemberAdd(BaseModel):
    user_id: int
    is_admin: bool = False
    can_read: bool = True
    can_add_feeds: bool = False
    can_edit_feeds: bool = False
    can_delete_feeds: bool = False
    can_comment: bool = True
    can_chat: bool = True
    can_invite: bool = False


class MemberUpdate(BaseModel):
    is_admin: bool | None = None
    is_active: bool | None = None
    can_read: bool | None = None
    can_add_feeds: bool | None = None
    can_edit_feeds: bool | None = None
    can_delete_feeds: bool | None = None
    can_comment: bool | None = None
    can_chat: bool | None = None
    can_invite: bool | None = None


class MemberOut(BaseModel):
    id: int
    collection_id: int
    user_id: int
    is_admin: bool
    is_active: bool
    can_read: bool
    can_add_feeds: bool
    can_edit_feeds: bool
    can_delete_feeds: bool
    can_comment: bool
    can_chat: bool
    can_invite: bool
    joined_at: datetime
    last_activity: datetime | None

    model_config = {"from_attributes": True}
