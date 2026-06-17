import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, AuthToken
from auth import create_token, get_current_user
from config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/telegram/init")
def telegram_init(db: Session = Depends(get_db)):
    token = AuthToken(token=uuid.uuid4())
    db.add(token)
    db.commit()
    db.refresh(token)
    bot_link = f"https://t.me/{_get_bot_username()}?start={token.token}"
    return {"token": str(token.token), "bot_url": bot_link}


@router.get("/telegram/status")
def telegram_status(token: str, db: Session = Depends(get_db)):
    auth = db.query(AuthToken).filter(AuthToken.token == token).first()
    if not auth:
        raise HTTPException(status_code=404, detail="Token not found")
    if auth.expires_at < datetime.utcnow():
        raise HTTPException(status_code=410, detail="Token expired")
    if not auth.confirmed:
        return {"confirmed": False}
    user = db.query(User).filter(User.id == auth.user_id).first()
    jwt_token = create_token(str(user.id))
    return {"confirmed": True, "access_token": jwt_token}


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "name": current_user.name,
        "avatar_url": current_user.avatar_url,
        "telegram_username": current_user.telegram_username,
    }


@router.post("/logout")
def logout():
    return {"ok": True}


# Internal endpoint called by the bot
@router.post("/telegram/confirm")
def telegram_confirm(token: str, telegram_id: int, chat_id: int, name: str, username: str = "", db: Session = Depends(get_db)):
    auth = db.query(AuthToken).filter(AuthToken.token == token).first()
    if not auth or auth.confirmed:
        raise HTTPException(status_code=400, detail="Invalid or already used token")
    if auth.expires_at < datetime.utcnow():
        raise HTTPException(status_code=410, detail="Token expired")

    user = db.query(User).filter(User.telegram_id == telegram_id).first()
    if not user:
        user = User(name=name, telegram_id=telegram_id, telegram_chat_id=chat_id, telegram_username=username)
        db.add(user)
        db.flush()
    else:
        user.telegram_chat_id = chat_id
        user.name = name

    auth.user_id = user.id
    auth.confirmed = True
    db.commit()
    return {"ok": True}


_BOT_USERNAME_CACHE: str = ""


def _get_bot_username() -> str:
    global _BOT_USERNAME_CACHE
    if _BOT_USERNAME_CACHE:
        return _BOT_USERNAME_CACHE
    import httpx
    try:
        r = httpx.get(
            f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/getMe",
            timeout=5,
        )
        _BOT_USERNAME_CACHE = r.json()["result"]["username"]
        return _BOT_USERNAME_CACHE
    except Exception:
        return "DateGo_bot"
