from app.config import get_settings
settings = get_settings()
print(f"Gemini Key: '{settings.gemini_api_key}'")
print(f"Anthropic Key: '{settings.anthropic_api_key}'")
