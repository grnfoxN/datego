"""
Telegram bot webhook mode.
Nginx handles TLS on port 8443 and proxies to this server on HTTP port 8444.
This avoids aiohttp TLS compatibility issues with Telegram.
"""
import asyncio
import logging
import os
import httpx
from aiohttp import web
from aiogram import Bot, Dispatcher
from aiogram.filters import CommandStart
from aiogram.types import Message
from aiogram.client.session.aiohttp import AiohttpSession
from aiogram.webhook.aiohttp_server import SimpleRequestHandler, setup_application
import socket

logging.basicConfig(level=logging.INFO)

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
SITE_URL = os.getenv("NEXT_PUBLIC_API_URL", "http://176.123.164.182")
# Bot listens on plain HTTP 8444; Nginx terminates TLS on 8443 and proxies here
BOT_INTERNAL_PORT = int(os.getenv("BOT_INTERNAL_PORT", "8444"))
WEBHOOK_PATH = "/bot/webhook"

dp = Dispatcher()


async def try_send(message: Message, text: str):
    try:
        await message.answer(text)
    except Exception as e:
        logging.warning(f"Could not send reply (Telegram API unreachable): {e}")


@dp.message(CommandStart())
async def start(message: Message, command: CommandStart):
    args = command.args
    tg_user = message.from_user
    name = tg_user.full_name or tg_user.username or "Пользователь"

    if args:
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    f"{BACKEND_URL}/api/auth/telegram/confirm",
                    params={
                        "token": args,
                        "telegram_id": tg_user.id,
                        "chat_id": message.chat.id,
                        "name": name,
                        "username": tg_user.username or "",
                    },
                    timeout=10,
                )
            if resp.status_code == 200:
                logging.info(f"Auth confirmed for {name} (id={tg_user.id})")
                await try_send(message,
                    f"Привет, {name}! 🎉 Ты вошёл в DateGo. "
                    f"Возвращайся на сайт 💌\n{SITE_URL}/dashboard"
                )
            else:
                logging.warning(f"Confirm {resp.status_code}: {resp.text[:200]}")
                await try_send(message, "Ссылка устарела. Попробуй войти заново на сайте.")
        except Exception as e:
            logging.error(f"Backend confirm error: {e}")
    else:
        await try_send(message,
            f"Привет! 👋 Я бот DateGo.\n"
            f"Зайди на сайт чтобы создать приглашение: {SITE_URL}"
        )


async def main():
    session = AiohttpSession()
    session._connector_init["family"] = socket.AF_INET
    bot = Bot(token=BOT_TOKEN, session=session)

    app = web.Application()
    SimpleRequestHandler(dispatcher=dp, bot=bot).register(app, path=WEBHOOK_PATH)
    setup_application(app, dp, bot=bot)

    runner = web.AppRunner(app)
    await runner.setup()
    # Plain HTTP — Nginx handles TLS in front
    site = web.TCPSite(runner, "127.0.0.1", BOT_INTERNAL_PORT)
    await site.start()
    logging.info(f"Bot webhook HTTP server on 127.0.0.1:{BOT_INTERNAL_PORT}")
    await asyncio.Event().wait()


if __name__ == "__main__":
    asyncio.run(main())
