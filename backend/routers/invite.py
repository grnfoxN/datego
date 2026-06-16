from datetime import datetime
from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import Offer, OfferCard, Selection, User, Card
from config import settings
import httpx

router = APIRouter(prefix="/api/invite", tags=["invite"])


def _card_display(oc: OfferCard, card: Optional[Card]):
    if card:
        return {
            "id": str(oc.id),
            "emoji": card.emoji,
            "title": card.title,
            "description": oc.custom_description or card.description,
        }
    return {
        "id": str(oc.id),
        "emoji": oc.custom_emoji or "🎉",
        "title": oc.custom_title or "",
        "description": oc.custom_description or "",
    }


@router.get("/{token}")
def get_invite(token: str, db: Session = Depends(get_db)):
    offer = db.query(Offer).filter(Offer.token == token).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    user = db.query(User).filter(User.id == offer.user_id).first()

    offer_cards = db.query(OfferCard).filter(OfferCard.offer_id == offer.id).order_by(OfferCard.sort_order).all()
    cards_data = []
    for oc in offer_cards:
        catalog_card = db.query(Card).filter(Card.id == oc.card_id).first() if oc.card_id else None
        cards_data.append(_card_display(oc, catalog_card))

    expired = offer.expires_at < datetime.utcnow()
    answered = db.query(Selection).filter(Selection.offer_id == offer.id).first() is not None

    return {
        "token": token,
        "author_name": user.name if user else "Аноним",
        "message": offer.message,
        "photo_url": offer.photo_url,
        "selection_type": offer.selection_type,
        "date_mode": offer.date_mode,
        "date_from": str(offer.date_from) if offer.date_from else None,
        "date_to": str(offer.date_to) if offer.date_to else None,
        "time_from": str(offer.time_from) if offer.time_from else None,
        "time_to": str(offer.time_to) if offer.time_to else None,
        "custom_question": offer.custom_question,
        "custom_question_options": offer.custom_question_options,
        "expires_at": offer.expires_at.isoformat(),
        "expired": expired,
        "answered": answered,
        "cards": cards_data,
    }


class SelectionInput(BaseModel):
    selected_offer_card_ids: List[str]
    selected_date: str
    selected_time: str
    custom_question_answer: Optional[str] = None
    comment: Optional[str] = None


@router.post("/{token}/select")
async def submit_selection(token: str, data: SelectionInput, db: Session = Depends(get_db)):
    offer = db.query(Offer).filter(Offer.token == token).first()
    if not offer:
        raise HTTPException(status_code=404)
    if offer.expires_at < datetime.utcnow():
        raise HTTPException(status_code=410, detail="Offer expired")
    existing = db.query(Selection).filter(Selection.offer_id == offer.id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Already answered")

    sel = Selection(
        offer_id=offer.id,
        selected_offer_card_ids=[uuid.UUID(i) for i in data.selected_offer_card_ids],
        selected_date=data.selected_date,
        selected_time=data.selected_time,
        custom_question_answer=data.custom_question_answer,
        comment=data.comment,
    )
    db.add(sel)
    offer.status = "answered"
    db.commit()

    # Notify via Telegram
    user = db.query(User).filter(User.id == offer.user_id).first()
    if user and user.telegram_chat_id:
        # get card names
        cards_text = ""
        for cid in data.selected_offer_card_ids:
            oc = db.query(OfferCard).filter(OfferCard.id == cid).first()
            if oc:
                if oc.card_id:
                    c = db.query(Card).filter(Card.id == oc.card_id).first()
                    cards_text += f"{c.emoji} {c.title}\n" if c else ""
                else:
                    cards_text += f"{oc.custom_emoji} {oc.custom_title}\n"

        text = (
            "💌 Она ответила!\n\n"
            f"Выбрала:\n{cards_text}"
            f"Дата: {data.selected_date}\n"
            f"Время: {data.selected_time}\n"
        )
        if data.custom_question_answer:
            text += f"Ответ на вопрос: {data.custom_question_answer}\n"
        if data.comment:
            text += f"Комментарий: {data.comment}"

        try:
            async with httpx.AsyncClient() as client:
                await client.post(
                    f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage",
                    json={"chat_id": user.telegram_chat_id, "text": text},
                    timeout=5,
                )
        except Exception:
            pass

    return {"ok": True}
