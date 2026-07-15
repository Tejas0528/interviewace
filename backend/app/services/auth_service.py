from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from app.models.db_models import User
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.schemas.schemas import SignupRequest


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_user(self, payload: SignupRequest) -> User:
        result = await self.db.execute(select(User).where(User.email == payload.email))
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Email already registered")

        user = User(
            email=payload.email,
            full_name=payload.full_name,
            hashed_password=hash_password(payload.password),
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def authenticate(self, email: str, password: str) -> tuple[str, str]:
        result = await self.db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
            )
        if not user.is_active:
            raise HTTPException(status_code=400, detail="Account disabled")

        access = create_access_token({"sub": user.id})
        refresh = create_refresh_token({"sub": user.id})
        return access, refresh

    async def get_user_by_id(self, user_id: str) -> User | None:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()
