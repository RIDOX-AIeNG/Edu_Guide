from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "EduGuide"

    # ── PostgreSQL ──────────────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://postgres:chery%40NG1@localhost:5432/eduguide1_db"
    
    # ── Redis ───────────────────────────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"

    # ── JWT ─────────────────────────────────────────────────────────────────
    SECRET_KEY: str = "CHANGE-THIS-TO-A-RANDOM-32-CHAR-STRING"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440   # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # ── CORS ────────────────────────────────────────────────────────────────
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
    ]

    # ── AI ──────────────────────────────────────────────────────────────────
    AI_PROVIDER: str = "openai"      
    AI_MODEL: str = "gpt-4o-mini"       
   # OPENAI_API_KEY: str = ""
    

    # ── Exam Rules ──────────────────────────────────────────────────────────
    # WAEC
    WAEC_QUESTIONS_PER_SUBJECT: int = 60
    WAEC_DURATION_MINUTES: int = 40
    WAEC_REQUIRED_CREDITS: int = 5       # Student needs 5 credits minimum
    WAEC_PASS_PERCENTAGE: float = 50.0   # 50% = C6 = minimum credit grade

    # JAMB
    JAMB_QUESTIONS_PER_SUBJECT: int = 45
    JAMB_TOTAL_QUESTIONS: int = 180      # 4 subjects × 45
    JAMB_DURATION_MINUTES: int = 180     # 3 hours
    JAMB_MAX_SCORE: int = 400
    JAMB_MIN_PASS_SCORE: int = 200       # National minimum

    # POST-UTME
    POST_UTME_QUESTIONS: int = 50
    POST_UTME_DURATION_MINUTES: int = 60
    POST_UTME_PASS_PERCENTAGE: float = 40.0

    # Practice
    PRACTICE_DEFAULT_QUESTIONS: int = 20

    # ── Admin ───────────────────────────────────────────────────────────────
    #ADMIN_SEED_KEY: str = "eduguide-admin-secret-2026"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
