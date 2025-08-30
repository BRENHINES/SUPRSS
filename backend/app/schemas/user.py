# backend/app/schemas/user.py
from datetime import datetime
from typing import Optional

from backend.app.models.user import FontSize, UserTheme
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    is_active: bool
    is_verified: bool
    is_superuser: bool


class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=50)
    password: Optional[str] = Field(default=None, min_length=6)
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None


class UserUpdate(BaseModel):
    email: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None
    theme: Optional[UserTheme] = None
    font_size: Optional[FontSize] = None
    articles_per_page: Optional[int] = None
    auto_mark_read: Optional[bool] = None


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
