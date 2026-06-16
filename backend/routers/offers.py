import uuid
import secrets
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import Offer, OfferCard, Card, Selection, User
from auth import get_current_user
from config import settings
import aiofiles
import os

router = APIRouter(prefix="/api/offers", tags=["offers"])


class CardInput(BaseModel):
    card_id: Optional[str] = None
    custom_emoji: Optional[str] = None
    custom_title: Optional[str] = None
    custom_description: Optional[str] = None
    sort_order: int = 0


class OfferCreate(BaseModel):
    message: str
    photo_url: Optional[str] = None
    selection_type: str = "single"
    date_mode: str = "free"
    date_from: Optional[str] = None
    date_to: Optional[str] = None
    time_from: Optional[str] = None
    time_to: Optional[str] = None
    custom_question: Optional[str] = None
    custom_question_options: Optional[List[str]] = None
    expires_at: str
    cards: List[CardInput] = []


def _serialize_offer(offer: Offer, cards: list, selection=None):
    return {
        "id": str(offer.id),
        "token": offer.token,
        "status": offer.status,
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
        "created_at": offer.created_at.isoformat() if offer.created_at else None,
        "cards": [
            {
                "id": str(c.id),
                "card_id": str(c.card_id) if c.card_id else None,
                "custom_emoji": c.custom_emoji,
                "custom_title": c.custom_title,
                "custom_description": c.custom_description,
                "sort_order": c.sort_order,
            }
            for c in cards
        ],
        "selection": {
            "selected_offer_card_ids": [str(i) for i in (selection.selected_offer_card_ids or [])],
            "selected_date": str(selection.selected_date),
            "selected_time": str(selection.selected_time),
            "custom_question_answer": selection.custom_question_answer,
            "comment": selection.comment,
        } if selection else None,
    }


@router.get("")
def list_offers(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    offers = db.query(Offer).filter(Offer.user_id == current_user.id).order_by(Offer.created_at.desc()).all()
    result = []
    for o in offers:
        cards = db.query(OfferCard).filter(OfferCard.offer_id == o.id).order_by(OfferCard.sort_order).all()
        sel = db.query(Selection).filter(Selection.offer_id == o.id).first()
        # update expired status
        if o.status == "active" and o.expires_at < datetime.utcnow():
            o.status = "expired"
            db.commit()
        result.append(_serialize_offer(o, cards, sel))
    return result


@router.post("")
def create_offer(data: OfferCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    token = secrets.token_urlsafe(16)
    offer = Offer(
        user_id=current_user.id,
        token=token,
        message=data.message,
        photo_url=data.photo_url,
        selection_type=data.selection_type,
        date_mode=data.date_mode,
        date_from=data.date_from,
        date_to=data.date_to,
        time_from=data.time_from,
        time_to=data.time_to,
        custom_question=data.custom_question,
        custom_question_options=data.custom_question_options,
        expires_at=datetime.fromisoformat(data.expires_at),
    )
    db.add(offer)
    db.flush()

    for c in data.cards:
        oc = OfferCard(
            offer_id=offer.id,
            card_id=uuid.UUID(c.card_id) if c.card_id else None,
            custom_emoji=c.custom_emoji,
            custom_title=c.custom_title,
            custom_description=c.custom_description,
            sort_order=c.sort_order,
        )
        db.add(oc)

    db.commit()
    db.refresh(offer)
    return {"token": offer.token, "id": str(offer.id)}


@router.get("/{offer_id}")
def get_offer(offer_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    offer = db.query(Offer).filter(Offer.id == offer_id, Offer.user_id == current_user.id).first()
    if not offer:
        raise HTTPException(status_code=404)
    cards = db.query(OfferCard).filter(OfferCard.offer_id == offer.id).order_by(OfferCard.sort_order).all()
    sel = db.query(Selection).filter(Selection.offer_id == offer.id).first()
    return _serialize_offer(offer, cards, sel)


@router.patch("/{offer_id}/archive")
def archive_offer(offer_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    offer = db.query(Offer).filter(Offer.id == offer_id, Offer.user_id == current_user.id).first()
    if not offer:
        raise HTTPException(status_code=404)
    offer.status = "archived"
    db.commit()
    return {"ok": True}


@router.post("/upload-photo")
async def upload_photo(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp", ".gif"]:
        raise HTTPException(status_code=400, detail="Invalid file type")
    filename = f"{uuid.uuid4()}{ext}"
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    path = os.path.join(settings.UPLOAD_DIR, filename)
    async with aiofiles.open(path, "wb") as f:
        content = await file.read()
        await f.write(content)
    return {"url": f"/uploads/{filename}"}
