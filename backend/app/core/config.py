from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    postgres_user: str   = Field(..., env="POSTGRES_USER")
    postgres_pass: str   = Field(..., env="POSTGRES_PASS")
    postgres_host: str   = Field(..., env="POSTGRES_HOST")
    postgres_db:   str   = Field(..., env="POSTGRES_DB")
    postgres_port: str   = Field(default="5432", env="POSTGRES_PORT")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def database_url(self) -> str:
        return (
            f"postgresql://{self.postgres_user}:"
            f"{self.postgres_pass}@{self.postgres_host}:"
            f"{self.postgres_port}/{self.postgres_db}"
        )

settings = Settings()