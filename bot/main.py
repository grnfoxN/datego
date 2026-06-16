import asyncio
import logging
import os
import httpx
from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart
from aiogram.types import Message

logging.basicConfig(level=logging.INFO)

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
SITE_URL = os.getenv("NEXT_PUBLIC_API_URL", "http://176.123.164.182")

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()


@dp.message(CommandStart())
async def start(message: Message, command: CommandStart):
    args = command.args  # token after /start
    if args:
        # Confirm auth token with backend
        tg_user = message.from_user
        name = tg_user.full_name or tg_user.username or "Пользователь"
        async with httpx.AsyncClient() as client:
            try:
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
                    await message.answer(
                        f"Привет, {name}! 🎉\n\nТы вошёл в DateGo. Возвращайся на сайт — он уже знает, что это ты 💌\n\n{SITE_URL}/dashboard"
                    )
                else:
                    detail = resp.json().get("detail", "Ошибка")
                    await message.answer(f"Не удалось войти: {detail}. Попробуй ещё раз на сайте.")
            except Exception as e:
                logging.error(f"Backend error: {e}")
                await message.answer("Сервис временно недоступен. Попробуй позже.")
    else:
        await message.answer(
            "Привет! 👋 Я бот DateGo — помогаю парням делать романтические приглашения на свидание.\n\n"
            f"Зайди на сайт, чтобы создать своё первое приглашение: {SITE_URL}"
        )


async def main():
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
