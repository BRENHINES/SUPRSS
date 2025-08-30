from datetime import datetime
from enum import Enum
from typing import List, Optional, Union

from pydantic import AnyUrl, BaseModel, Field, field_validator
from pydantic.networks import HttpUrl

from .category import CategoryOut


class Frequency(str, Enum):
    hourly = "hourly"
    daily = "daily"
    weekly = "weekly"


class FeedCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    url: Union[HttpUrl, AnyUrl, str]
    language: Optional[str] = None
    update_frequency: Optional[Union[int, Frequency]] = Field(default=60)
    priority: Optional[int] = Field(None, description="1..10, default 5")
    category_names: List[str] = Field(default_factory=list)

    @field_validator("url", mode="before")
    @classmethod
    def url_to_str(cls, v):
        return str(v)

    @field_validator("update_frequency", mode="after")
    @classmethod
    def freq_to_minutes(cls, v):
        if v is None:
            return 60
        if isinstance(v, int):
            return v
        # enum → minutes
        mapping = {
            Frequency.hourly: 60,
            Frequency.daily: 60 * 24,
            Frequency.weekly: 60 * 24 * 7,
        }
        return mapping.get(v, 60)

    model_config = {"from_attributes": True}


class FeedUpdate(BaseModel):
    title: Optional[str] = None
    url: Optional[Union[HttpUrl, AnyUrl, str]] = None
    language: Optional[str] = None
    update_frequency: Optional[Union[int, Frequency]] = None
    priority: Optional[int] = None
    status: Optional[str] = Field(None, description="active/inactive/error/deleted")

    model_config = {"from_attributes": True}


class FeedOut(BaseModel):
    id: int
    title: str
    url: str
    language: Optional[str]
    status: str
    update_frequency: int
    priority: int
    total_articles: int
    created_at: datetime
    collection_id: int
    created_by: int
    categories: List[CategoryOut] = []

    @field_validator("categories", mode="before")
    @classmethod
    def map_feedcategory_to_category(cls, v):
        if not v:
            return []
        # si l’item est un FeedCategory, on prend sa .category ; sinon on le garde tel quel
        return [getattr(item, "category", item) for item in v]

    model_config = {"from_attributes": True}


class FeedAttachCategories(BaseModel):
    category_ids: List[int] = Field(..., min_items=1)
