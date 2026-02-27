from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str

    ALGORITHM: str | None = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int | None = 60

    GITHUB_CLIENT_ID: str | None = None
    GITHUB_CLIENT_SECRET: str | None = None
    GITHUB_REDIRECT_URI: str | None = None

    model_config = SettingsConfigDict(
        env_file="backend/.env",
        env_file_encoding="utf-8"
    )


settings = Settings()
