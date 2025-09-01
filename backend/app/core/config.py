from functools import lru_cache
from pathlib import Path
from typing import List, Union

from pydantic import AnyHttpUrl, Field, field_validator, EmailStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_ignore_empty=True,
        extra="ignore",
        case_sensitive=False,
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

    # ------------------------------------------------------------------ #
    # AZURE BLOB STORAGE
    # ------------------------------------------------------------------ #
    azure_storage_account: str = Field(..., env="AZURE_STORAGE_ACCOUNT")
    azure_storage_key: str = Field(..., env="AZURE_STORAGE_KEY")
    azure_blob_endpoint: str = Field(..., env="AZURE_BLOB_ENDPOINT")
    azure_avatars_container: str = Field(default="avatars", env="AZURE_AVATARS_CONTAINER")
    azure_avatar_sas_expire_min: int = Field(default=10, env="AZURE_AVATAR_SAS_EXPIRE_MIN")
    azure_avatar_max_mb: int = Field(default=2, env="AZURE_AVATAR_MAX_MB")
    azure_avatar_allowed_types: list[str] = Field(default_factory=list, env="AZURE_AVATAR_ALLOWED_TYPES")

    # ------------------------------------------------------------------ #
    # RSS
    # ------------------------------------------------------------------ #
    rss_fetch_timeout: int = Field(default=30, env="RSS_FETCH_TIMEOUT")
    rss_user_agent: str = Field(default="SUPRSS/1.0", env="RSS_USER_AGENT")
    rss_max_articles_per_feed: int = Field(default=1000, env="RSS_MAX_ARTICLES_PER_FEED")
    rss_default_update_interval: int = Field(default=60, env="RSS_DEFAULT_UPDATE_INTERVAL")
    rss_max_concurrent_fetches: int = Field(default=10, env="RSS_MAX_CONCURRENT_FETCHES")

    # ----------------------------------
    # OAuth (Google / GitHub)
    # ----------------------------------
    google_client_id: str = Field(default="", env="GOOGLE_CLIENT_ID")
    google_client_secret: str = Field(default="", env="GOOGLE_CLIENT_SECRET")

    github_client_id: str = Field(default="", env="GITHUB_CLIENT_ID")
    github_client_secret: str = Field(default="", env="GITHUB_CLIENT_SECRET")

    # ----------------------------------
    # SMTP (envoi d’emails)
    # ----------------------------------
    smtp_host: str = Field(default="", env="SMTP_HOST")
    smtp_port: int = Field(default=587, env="SMTP_PORT")
    smtp_user: str = Field(default="", env="SMTP_USER")
    smtp_password: str = Field(default="", env="SMTP_PASSWORD")
    from_email: EmailStr = Field(default="noreply@example.com", env="FROM_EMAIL")
    from_name: str = Field(default="SUPRSS", env="FROM_NAME")

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

    @property
    def avatar_base_url(self) -> str:
        # URL publique du conteneur d’avatars sans SAS
        return f"{self.azure_blob_endpoint}/{self.azure_avatars_container}"


@lru_cache
def get_settings() -> Settings:
    """Instance unique mise en cache."""
    return Settings()


settings = get_settings()
