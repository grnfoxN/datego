import uuid
from sqlalchemy import Column, String, BigInteger, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    avatar_url = Column(String(500))
    telegram_id = Column(BigInteger, unique=True)
    telegram_chat_id = Column(BigInteger)
    telegram_username = Column(String(255))
    created_at = Column(DateTime, server_default=func.now())
