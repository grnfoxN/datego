from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://dating_user:password@localhost:5432/dating_db"
    JWT_SECRET: str = "change-me"
    JWT_EXPIRE_HOURS: int = 72
    TELEGRAM_BOT_TOKEN: str = ""
    BOT_INTERNAL_URL: str = "http://localhost:8081"
    NEXT_PUBLIC_API_URL: str = "http://localhost:3000"
    UPLOAD_DIR: str = "/var/www/datego/uploads"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
