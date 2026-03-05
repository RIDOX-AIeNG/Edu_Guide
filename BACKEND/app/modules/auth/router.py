from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.core.dependencies import get_current_user
from app.modules.auth.schema import (
    RegisterRequest, LoginRequest, TokenResponse,
    OAuth2TokenResponse, RefreshRequest,
    UserResponse, UpdateProfileRequest,
)
from fastapi import APIRouter, Depends, HTTPException, status, Request

from app.modules.auth.service import AuthService
from app.core.rate_limit import limiter


router = APIRouter()


@router.post("/token", response_model=OAuth2TokenResponse, summary="Swagger OAuth2 login")
async def oauth2_token(
    form: OAuth2PasswordRequestForm = Depends(),
    db:   AsyncSession = Depends(get_db),
):
    """Form-based login for Swagger UI. Put your email in the 'username' field."""
    tokens = await AuthService(db).login(form.username, form.password)
    return OAuth2TokenResponse(access_token=tokens.access_token)


@router.post("/register", response_model=TokenResponse, status_code=201)
@limiter.limit("5/minute")
async def register(request: Request, payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new student. Returns JWT tokens immediately — no separate login needed."""
    return await AuthService(db).register(payload)


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
async def login(request: Request,payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Login with email + password (JSON body). Returns access + refresh tokens."""
    return await AuthService(db).login(payload.email, payload.password)


@router.post("/refresh", response_model=TokenResponse)
@limiter.limit("30/minute")
async def refresh(request: Request, payload: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """Rotate refresh token. Issues new access + refresh pair."""
    return await AuthService(db).refresh_tokens(payload.refresh_token)


@router.post("/logout", status_code=200)
async def logout(payload: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """Revoke refresh token."""
    await AuthService(db).logout(payload.refresh_token)
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_me(user=Depends(get_current_user)):
    """Return current authenticated user's profile."""
    return user


@router.put("/me", response_model=UserResponse)
async def update_me(
    payload: UpdateProfileRequest,
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update name, class level, or career interests."""
    return await AuthService(db).update_profile(user.id, payload)
