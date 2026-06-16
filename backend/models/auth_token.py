import uuid
from sqlalchemy import Column, Boolean, DateTime, ForeignKey, BigInteger, func, text
from sqlalchemy.dialects.postgresql import UUID
from database import Base


class AuthToken(Base):
    __tablename__ = "auth_tokens"

    token = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    telegram_chat_id = Column(BigInteger, nullable=True)
    confirmed = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    expires_at = Column(DateTime, server_default=text("NOW() + INTERVAL '10 minutes'"))
