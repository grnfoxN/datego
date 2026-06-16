import uuid
from sqlalchemy import Column, Boolean, DateTime, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID
from database import Base


class AuthToken(Base):
    __tablename__ = "auth_tokens"

    token = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    confirmed = Column(Boolean, default=False)
    telegram_chat_id = Column(
        "telegram_chat_id",
        __import__("sqlalchemy").BigInteger,
        nullable=True,
    )
    created_at = Column(DateTime, server_default=func.now())
    expires_at = Column(
        DateTime,
        server_default=text("NOW() + INTERVAL '10 minutes'"),
    )


from sqlalchemy import func  # noqa: E402 — already imported above, keep for clarity
