from typing import List
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True
    )

    # App
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "EduGuide"

    # Database
    DATABASE_URL: str

    # Redis
    REDIS_URL: str

    # Security (REQUIRED)
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    REFRESH_TOKEN_EXPIRE_DAYS: int

    # CORS
    CORS_ORIGINS: List[str]

    # AI
    AI_PROVIDER: str
    AI_MODEL: str
    OPENAI_API_KEY: str | None = None

    # Admin
    ADMIN_SEED_KEY: str

    # WAEC config
    WAEC_QUESTIONS_PER_SUBJECT: int
    WAEC_DURATION_MINUTES: int
    WAEC_REQUIRED_CREDITS: int
    WAEC_PASS_PERCENTAGE: float

    # JAMB config
    JAMB_QUESTIONS_PER_SUBJECT: int
    JAMB_TOTAL_QUESTIONS: int
    JAMB_DURATION_MINUTES: int
    JAMB_MAX_SCORE: int
    JAMB_MIN_PASS_SCORE: int

    # Post UTME config
    POST_UTME_QUESTIONS: int
    POST_UTME_DURATION_MINUTES: int
    POST_UTME_PASS_PERCENTAGE: float

    # Practice
    PRACTICE_DEFAULT_QUESTIONS: int

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v):
        if isinstance(v, str):
            return [i.strip() for i in v.split(",")]
        return v


settings = Settings()
