from typing import Optional

from pydantic import BaseModel, Field


class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    color: str | None = Field(None, description="Hex color, e.g. #36C")
    icon: str | None = None
    description: str | None = None

    model_config = {"from_attributes": True}


class CategoryUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=50)
    color: str | None = None
    icon: str | None = None
    description: str | None = None

    model_config = {"from_attributes": True}


class CategoryOut(BaseModel):
    id: int
    name: str
    color: str | None
    icon: str | None
    description: str | None

    model_config = {"from_attributes": True}


class CategoryWithCountOut(CategoryOut):
    feeds_count: int = 0
