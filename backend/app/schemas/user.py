# backend/app/schemas/user.py
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from backend.app.models.user import FontSize, UserTheme


class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: str | None = None
    bio: str | None = None
    avatar_url: str | None = None


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    username: str
    full_name: str | None = None
    avatar_url: str | None = None
    bio: str | None = None
    is_active: bool
    is_verified: bool
    is_superuser: bool


class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=50)
    password: str | None = Field(default=None, min_length=6)
    full_name: str | None = None
    avatar_url: str | None = None
    bio: str | None = None


class UserUpdate(BaseModel):
    email: str | None = None
    username: str | None = None
    password: str | None = None
    full_name: str | None = None
    avatar_url: str | None = None
    bio: str | None = None
    is_active: bool | None = None
    is_superuser: bool | None = None
    theme: UserTheme | None = None
    font_size: FontSize | None = None
    articles_per_page: int | None = None
    auto_mark_read: bool | None = None


class UserFlagsUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    is_superuser: bool | None = None
    is_active: bool | None = None
    is_verified: bool | None = None


class PasswordChangeRequest(BaseModel):
    old_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=6)

    class Config:
        from_attributes = True  # Pydantic v2: permet de lire depuis ORM
