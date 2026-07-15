"""Seed demo user. Run: python seed.py"""
import asyncio
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

async def seed():
    from app.core.database import init_db, AsyncSessionLocal
    from app.models.db_models import User
    from app.core.security import hash_password
    from sqlalchemy import select

    await init_db()

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.email == "demo@interviewace.ai"))
        if not result.scalar_one_or_none():
            user = User(
                email="demo@interviewace.ai",
                full_name="Demo User",
                hashed_password=hash_password("Demo@1234"),
                is_active=True,
            )
            db.add(user)
            await db.commit()
            print("✅ Demo user created: demo@interviewace.ai / Demo@1234")
        else:
            print("ℹ️  Demo user already exists")

    print("🚀 Seed complete!")

if __name__ == "__main__":
    asyncio.run(seed())
