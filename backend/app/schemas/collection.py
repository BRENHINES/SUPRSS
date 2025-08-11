from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CollectionCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    slug: Optional[str] = Field(None, min_length=1, max_length=100)
    is_public: bool = False
    is_personal: bool = True
    allow_comments: bool = True
    allow_chat: bool = True
    auto_fetch_feeds: bool = True

    model_config = {"from_attributes": True}


class CollectionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    slug: Optional[str] = None
    is_public: Optional[bool] = None
    is_personal: Optional[bool] = None
    allow_comments: Optional[bool] = None
    allow_chat: Optional[bool] = None
    auto_fetch_feeds: Optional[bool] = None

    model_config = {"from_attributes": True}


class CollectionOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    slug: Optional[str]
    is_public: bool
    is_personal: bool
    total_feeds: int
    total_articles: int
    total_members: int
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    last_activity: Optional[datetime]

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
    is_admin: Optional[bool] = None
    is_active: Optional[bool] = None
    can_read: Optional[bool] = None
    can_add_feeds: Optional[bool] = None
    can_edit_feeds: Optional[bool] = None
    can_delete_feeds: Optional[bool] = None
    can_comment: Optional[bool] = None
    can_chat: Optional[bool] = None
    can_invite: Optional[bool] = None


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
    last_activity: Optional[datetime]

    model_config = {"from_attributes": True}
