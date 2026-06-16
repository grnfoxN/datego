import uuid
from sqlalchemy import Column, String, Text, Date, Time, DateTime, Integer, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from database import Base


class Offer(Base):
    __tablename__ = "offers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    token = Column(String(100), unique=True, nullable=False)
    status = Column(String(50), default="active")

    message = Column(Text, nullable=False)
    photo_url = Column(String(500))

    selection_type = Column(String(20), default="single")

    date_mode = Column(String(20), default="free")
    date_from = Column(Date)
    date_to = Column(Date)
    time_from = Column(Time)
    time_to = Column(Time)

    custom_question = Column(Text)
    custom_question_options = Column(JSONB)

    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, server_default=func.now())


class OfferCard(Base):
    __tablename__ = "offer_cards"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    offer_id = Column(UUID(as_uuid=True), ForeignKey("offers.id"))
    card_id = Column(UUID(as_uuid=True), ForeignKey("cards.id"), nullable=True)
    custom_emoji = Column(String(10))
    custom_title = Column(String(255))
    custom_description = Column(Text)
    sort_order = Column(Integer, default=0)
