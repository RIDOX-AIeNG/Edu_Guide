from fastapi import Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.core.database import get_db
from app.core.security import decode_token
from app.core.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    """Validates JWT Bearer token and returns the User ORM object."""
    from app.modules.auth.model import User
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    result = await db.execute(select(User).where(User.id == int(payload["sub"])))
    user = result.scalars().first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or account disabled",
        )
    return user


# Alias — all student endpoints use this
get_current_student = get_current_user


def require_admin_key(x_admin_key: Optional[str] = Header(None)):
    """Header-based guard for admin/seeding endpoints."""
    if x_admin_key != settings.ADMIN_SEED_KEY:
        raise HTTPException(status_code=403, detail="Invalid admin key. Add X-Admin-Key header.")
    return True






















# from fastapi import Depends, HTTPException, status, Header
# from fastapi.security import OAuth2PasswordBearer
# from sqlalchemy.ext.asyncio import AsyncSession
# from typing import AsyncGenerator
# from sqlalchemy import select
# from typing import Optional
# from app.core.database import AsyncSessionLocal
# from app.core.security import decode_token
# from app.core.config import settings

# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")


# from typing import AsyncGenerator
# from fastapi import Depends, HTTPException, status
# from fastapi.security import OAuth2PasswordBearer
# from sqlalchemy.ext.asyncio import AsyncSession
# from sqlalchemy import select

# from app.core.database import AsyncSessionLocal
# from app.core.security import decode_token

# # tokenUrl must exactly match the route that accepts form data
# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")


# async def get_db() -> AsyncGenerator[AsyncSession, None]:
#     async with AsyncSessionLocal() as session:
#         try:
#             yield session
#         finally:
#             await session.close()


# async def get_current_user(
#     token: str = Depends(oauth2_scheme),
#     db: AsyncSession = Depends(get_db),
# ):
#     """Validates JWT Bearer token and returns the User ORM object."""
#     from app.modules.auth.model import User
#     payload = decode_token(token)
#     if not payload or payload.get("type") != "access":
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Invalid or expired access token",
#             headers={"WWW-Authenticate": "Bearer"},
#         )
#     result = await db.execute(select(User).where(User.id == int(payload["sub"])))
#     user = result.scalars().first()
#     if not user or not user.is_active:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="User not found or account disabled",
#         )
#     return user


# # Alias — all student endpoints use this
# get_current_student = get_current_user


# def require_admin_key(x_admin_key: Optional[str] = Header(None)):
#     """Header-based guard for admin/seeding endpoints."""
#     if x_admin_key != settings.ADMIN_SEED_KEY:
#         raise HTTPException(status_code=403, detail="Invalid admin key. Add X-Admin-Key header.")
#     return True


