from pydantic import BaseModel, Field
from datetime import datetime

class LoginRequest(BaseModel):
    username_or_email: str = Field(..., examples=["alice", "alice@example.com"])
    password: str = Field(..., min_length=6)

class TokenPair(BaseModel):
    token_type: str = "bearer"
    access_token: str
    refresh_token: str
    access_expires_in: int  # seconds
    refresh_expires_at: datetime

class RefreshRequest(BaseModel):
    refresh_token: str

class LogoutRequest(BaseModel):
    refresh_token: str  # on exige le refresh courant pour le logout “propre”

class UserPublic(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool
    is_superuser: bool
