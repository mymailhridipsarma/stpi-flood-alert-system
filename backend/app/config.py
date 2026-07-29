import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Smart Water Logging & Flood Alert System"
    API_V1_STR: str = "/api/v1"
    
    # JWT Auth Configuration
    SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "your-super-secret-jwt-key-for-token-generation-32-chars")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 1 day
    
    # Supabase Configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://xhnmjokqxwfhxkrjuidh.supabase.co")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhobm1qb2txeHdmaHhrcmp1aWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMDM4MzgsImV4cCI6MjEwMDg3OTgzOH0.6aN0Hm32Tzqzejm4olpcwv-SOvm5EEBW7APlJR9MZ2Y")
    
    # Device Authentication Key (simple shared secret for ESP32 request verification)
    DEVICE_API_KEY: str = os.getenv("DEVICE_API_KEY", "esp32-super-secret-api-key-2026")

    # Telegram Bot Configuration
    TELEGRAM_BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN", "8826309434:AAE_FOaeYVT5B9z7kxjM_09Xk89ITyM3ceI")
    TELEGRAM_CHAT_ID: str = os.getenv("TELEGRAM_CHAT_ID", "1618261785")

    class Config:
        case_sensitive = True

settings = Settings()
