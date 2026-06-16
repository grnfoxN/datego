from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Card

router = APIRouter(prefix="/api/cards", tags=["cards"])


@router.get("")
def list_cards(db: Session = Depends(get_db)):
    cards = db.query(Card).filter(Card.is_active == True).all()
    return [
        {"id": str(c.id), "emoji": c.emoji, "title": c.title, "description": c.description, "category": c.category}
        for c in cards
    ]
