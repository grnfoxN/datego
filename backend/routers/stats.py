from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Selection

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("/couples")
def couples_count(db: Session = Depends(get_db)):
    count = db.query(Selection).count()
    return {"count": count}
