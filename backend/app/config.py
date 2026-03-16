"""
Application configuration via environment variables.
"""
import os
from pydantic_settings import BaseSettings
from functools import lru_cache

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "orbit.db")

class Settings(BaseSettings):
    # Anthropic API
    anthropic_api_key: str = ""

    # Gemini API
    gemini_api_key: str = ""

    # Database — defaults to local SQLite
    database_url: str = f"sqlite+aiosqlite:///{DB_PATH}"

    # Models
    default_model: str = "claude-sonnet-4-20250514"
    opus_model: str = "claude-opus-4-20250514"

    # CORS
    frontend_url: str = "http://localhost:5173"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache()
def get_settings() -> Settings:
    return Settings()
