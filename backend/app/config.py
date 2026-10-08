"""
Application configuration via environment variables.
"""
import os
from pydantic_settings import BaseSettings
from functools import lru_cache

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "orbit.db")

class Settings(BaseSettings):
    # Gemini API
    gemini_api_key: str = ""

    # Local LLM
    use_local_llm: bool = False
    local_model_url: str = "http://localhost:11434/v1"
    local_model_name: str = "llama3.1"
    local_vision_model_name: str = "llama3.2-vision"

    # Database — defaults to local SQLite
    database_url: str = f"sqlite+aiosqlite:///{DB_PATH}"

    # CORS
    frontend_url: str = "http://localhost:5173"

    # Ignore unknown keys so an existing .env that still sets copilot-only
    # values (ANTHROPIC_API_KEY, model names) keeps working after the split.
    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


@lru_cache()
def get_settings() -> Settings:
    return Settings()
