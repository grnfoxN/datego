from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from config import settings
from database import engine
from models import user, auth_token, card, offer, selection  # ensure tables are known to SQLAlchemy
from routers import auth, offers, invite, cards, stats

app = FastAPI(title="DateGo API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(offers.router)
app.include_router(invite.router)
app.include_router(cards.router)
app.include_router(stats.router)

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


@app.get("/health")
def health():
    return {"status": "ok"}
