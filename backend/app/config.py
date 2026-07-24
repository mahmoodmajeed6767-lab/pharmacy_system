from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = ""  # Must be provided via environment variable
    JWT_SECRET: str = "super-secret-jwt-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_HOURS: int = 24
    APP_NAME: str = "Pharmacy Management System"

    class Config:
        env_file = ".env"


settings = Settings()

# Validate that DATABASE_URL is set
if not settings.DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set. Please configure your database connection.")

