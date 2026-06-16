import uuid
from sqlalchemy import Column, Text, Date, Time, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from database import Base


class Selection(Base):
    __tablename__ = "selections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    offer_id = Column(UUID(as_uuid=True), ForeignKey("offers.id"), unique=True)
    selected_offer_card_ids = Column(ARRAY(UUID(as_uuid=True)))
    selected_date = Column(Date, nullable=False)
    selected_time = Column(Time, nullable=False)
    custom_question_answer = Column(Text)
    comment = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
