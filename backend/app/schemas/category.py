from pydantic import BaseModel, Field
from typing import Optional

class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    color: Optional[str] = Field(None, description="Hex color, e.g. #36C")
    icon: Optional[str] = None
    description: Optional[str] = None

    model_config = {"from_attributes": True}

class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    color: Optional[str] = None
    icon: Optional[str] = None
    description: Optional[str] = None

    model_config = {"from_attributes": True}

class CategoryOut(BaseModel):
    id: int
    name: str
    color: Optional[str]
    icon: Optional[str]
    description: Optional[str]

    model_config = {"from_attributes": True}
