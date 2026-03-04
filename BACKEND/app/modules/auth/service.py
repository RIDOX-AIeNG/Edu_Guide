from datetime import datetime, timedelta
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token,
)
from app.core.config import settings
from app.modules.auth.model import User, RefreshToken
from app.modules.auth.schema import RegisterRequest, TokenResponse
from app.shared.enums import JourneyStage


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def register(self, payload: RegisterRequest) -> TokenResponse:
        existing = (await self.db.execute(
            select(User).where(User.email == payload.email)
        )).scalars().first()
        if existing:
            raise HTTPException(status_code=409, detail="Email already registered")

        user = User(
            email=payload.email,
            full_name=payload.full_name,
            hashed_password=hash_password(payload.password),
            class_level=payload.class_level,
            career_interests=payload.career_interests,
            journey_stage=JourneyStage.onboarding,
        )
        self.db.add(user)
        await self.db.flush()
        await self.db.commit()
        await self.db.refresh(user)
        return await self._issue_tokens(user)

    async def login(self, email: str, password: str) -> TokenResponse:
        result = await self.db.execute(select(User).where(User.email == email))
        user   = result.scalars().first()
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if not user.is_active:
            raise HTTPException(status_code=400, detail="Account has been deactivated")
        user.last_login_at = datetime.utcnow()
        await self.db.commit()
        return await self._issue_tokens(user)

    async def refresh_tokens(self, refresh_token: str) -> TokenResponse:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        result = await self.db.execute(
            select(RefreshToken).where(
                RefreshToken.token      == refresh_token,
                RefreshToken.is_revoked == False,
            )
        )
        tok = result.scalars().first()
        if not tok or tok.expires_at < datetime.utcnow():
            raise HTTPException(status_code=401, detail="Refresh token expired or revoked")

        user = (await self.db.execute(
            select(User).where(User.id == tok.user_id)
        )).scalars().first()

        tok.is_revoked = True   # rotate — old token invalidated
        await self.db.commit()
        return await self._issue_tokens(user)

    async def logout(self, refresh_token: str):
        result = await self.db.execute(
            select(RefreshToken).where(RefreshToken.token == refresh_token)
        )
        tok = result.scalars().first()
        if tok:
            tok.is_revoked = True
            await self.db.commit()

    async def update_profile(self, user_id: int, payload) -> User:
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalars().first()
        for k, v in payload.model_dump(exclude_unset=True).items():
            setattr(user, k, v)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def _issue_tokens(self, user: User) -> TokenResponse:
        access  = create_access_token(user.id)
        refresh = create_refresh_token(user.id)
        self.db.add(RefreshToken(
            user_id=user.id,
            token=refresh,
            expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        ))
        await self.db.commit()
        return TokenResponse(
            access_token=access,
            refresh_token=refresh,
            user_id=user.id,
            full_name=user.full_name,
            class_level=user.class_level,
            journey_stage=user.journey_stage,
        )
