from functools import lru_cache
from typing import List, Union
from pydantic import AnyHttpUrl, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file= ".env",
        env_file_encoding="utf-8",
        env_ignore_empty=True,
        extra="ignore",
        case_sensitive=False
    )

    # ------------------------------------------------------------------ #
    # Application
    # ------------------------------------------------------------------ #
    APP_NAME: str = Field(default="SUPRSS", env="APP_NAME")
    VERSION: str = Field(default="0.1.0", env="APP_VERSION")
    DEBUG: bool = Field(default=True, env="DEBUG")
    ENV: str = Field(default="development", env="ENV")

    # ------------------------------------------------------------------ #
    # Sécurité
    # ------------------------------------------------------------------ #
    jwt_secret_key: str = Field(..., env="JWT_SECRET_KEY")
    refresh_secret_key: str = Field(..., env="REFRESH_SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", env="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(default=30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    refresh_token_expire_days: int = Field(default=7, env="REFRESH_TOKEN_EXPIRE_DAYS")

    # ------------------------------------------------------------------ #
    # CORS
    # ------------------------------------------------------------------ #
    CORS_ORIGINS: List[str] = Field(default_factory=list, env="CORS_ORIGINS")

    # ------------------------------------------------------------------ #
    # DATABASE
    # ------------------------------------------------------------------ #
    postgres_user: str = Field(..., env="POSTGRES_USER")
    postgres_pass: str = Field(..., env="POSTGRES_PASS")
    postgres_host: str = Field(..., env="POSTGRES_HOST")
    postgres_db: str = Field(..., env="POSTGRES_DB")
    postgres_port: str = Field(default="5432", env="POSTGRES_PORT")


    @classmethod
    def _split_or_list(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i]
        return v if isinstance(v, list) else []

    CORS_ORIGINS: list[str] = Field(default_factory=list)

    @field_validator("CORS_ORIGINS", mode="before")
    def split_cors(cls, v):
        # .env  →  "http://localhost,http://127.0.0.1"
        if isinstance(v, str) and v:
            return [item.strip() for item in v.split(",")]
        return v

    @property
    def database_url(self) -> str:
        return (
            f"postgresql://{self.postgres_user}:"
            f"{self.postgres_pass}@{self.postgres_host}:"
            f"{self.postgres_port}/{self.postgres_db}"
        )

    # ------------------------------------------------------------------ #
    # Convenience flags
    # ------------------------------------------------------------------ #
    @property
    def is_production(self) -> bool:  # noqa: D401
        return self.ENV == "production"

    @property
    def is_development(self) -> bool:
        return self.ENV == "development"

@lru_cache
def get_settings() -> Settings:
    """Instance unique mise en cache."""
    return Settings()

settings = get_settings()
