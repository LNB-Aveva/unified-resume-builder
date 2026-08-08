"""Application settings loaded from environment variables."""

import logging
import os

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


class Settings:
    APP_NAME: str = os.getenv("APP_NAME", "UnifiedResumeBuilder")
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    API_VERSION: str = os.getenv("API_VERSION", "v1")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    HUGGINGFACE_API_KEY: str = os.getenv("HUGGINGFACE_API_KEY", "")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")
    AI_QUOTA_ENFORCEMENT: bool = os.getenv(
        "AI_QUOTA_ENFORCEMENT",
        "true" if os.getenv("ENV", "").lower() == "production" else "false",
    ).lower() == "true"


settings = Settings()

if not settings.HUGGINGFACE_API_KEY or settings.HUGGINGFACE_API_KEY == "hf_your_key_here":
    logger.warning(
        "HUGGINGFACE_API_KEY is not set — AI endpoints (summary, rewrite, cover letter) "
        "will return 503. Get a free key at https://huggingface.co/settings/tokens"
    )

if settings.AI_QUOTA_ENFORCEMENT and (
    not settings.SUPABASE_URL or not settings.SUPABASE_ANON_KEY
):
    logger.error(
        "AI_QUOTA_ENFORCEMENT is enabled without SUPABASE_URL and SUPABASE_ANON_KEY — "
        "AI endpoints will fail closed with 503 before contacting Hugging Face"
    )
