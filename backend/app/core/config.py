"""
config.py - Loads settings from your .env file.

WHY THIS FILE EXISTS:
You NEVER want to hardcode secrets (API keys, passwords) in your code.
If you accidentally push code with a real API key to GitHub, hackers can
find it within minutes and use it (this actually happens all the time).

Instead, we store secrets in a .env file (which .gitignore prevents from
being committed) and this config.py file reads those secrets at runtime.

ANALOGY:
Think of .env as a locked safe, and config.py as the person with the key.
Your app asks config.py for secrets, and config.py fetches them from the safe.
"""

import os

# python-dotenv reads your .env file and loads its values into environment variables
from dotenv import load_dotenv

# Load the .env file
# WHY: This must be called BEFORE you try to read any environment variables
load_dotenv()


# WHY a class?
# Grouping all settings in one class makes them easy to import anywhere:
#   from app.core.config import settings
#   print(settings.APP_NAME)
class Settings:
    APP_NAME: str = os.getenv("APP_NAME", "UnifiedResumeBuilder")
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    API_VERSION: str = os.getenv("API_VERSION", "v1")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    # AI/NLP
    HUGGINGFACE_API_KEY: str = os.getenv("HUGGINGFACE_API_KEY", "")

    # Database
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")


# Create a single instance that the whole app uses
settings = Settings()
