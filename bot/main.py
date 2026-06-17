import asyncio
import logging
import os
import httpx
from aiogram import Bot, Dispatcher
from aiogram.filters import CommandStart
from aiogram.types import Message

logging.basicConfig(level=logging.INFO)

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
SITE_URL = os.getenv("NEXT_PUBLIC_API_URL", "http://195.133.39.254")

dp = Dispatcher()


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
                await message.answer(
                    f"Привет, {name}! 🎉 Ты вошёл в DateGo. "
                    f"Возвращайся на сайт 💌\n{SITE_URL}/dashboard"
                )
            else:
                logging.warning(f"Confirm {resp.status_code}: {resp.text[:200]}")
                await message.answer("Ссылка устарела. Попробуй войти заново на сайте.")
        except Exception as e:
            logging.error(f"Backend confirm error: {e}")
            await message.answer("Что-то пошло не так. Попробуй позже.")
    else:
        await message.answer(
            f"Привет! 👋 Я бот DateGo.\n"
            f"Зайди на сайт чтобы создать приглашение: {SITE_URL}"
        )


async def main():
    bot = Bot(token=BOT_TOKEN)
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
