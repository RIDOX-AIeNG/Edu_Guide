from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from app.shared.enums import JourneyStage, ClassLevel


class RegisterRequest(BaseModel):
    email:            EmailStr
    password:         str
    full_name:        str
    class_level:      ClassLevel
    career_interests: Optional[str] = None

    @field_validator("password")
    @classmethod
    def password_length(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v

    @field_validator("full_name")
    @classmethod
    def name_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Full name cannot be empty")
        return v.strip()


class LoginRequest(BaseModel):
    email:    EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token:  str
    refresh_token: str
    token_type:    str = "bearer"
    user_id:       int
    full_name:     str
    class_level:   Optional[ClassLevel]
    journey_stage: JourneyStage


class OAuth2TokenResponse(BaseModel):
    """Swagger-compatible response (only access_token)."""
    access_token: str
    token_type:   str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    id:                     int
    email:                  str
    full_name:              str
    class_level:            Optional[ClassLevel]
    journey_stage:          JourneyStage
    career_interests:       Optional[str]
    has_real_waec_results:  bool = False
    is_email_verified:      bool
    selected_university_id: Optional[int]
    selected_course_id:     Optional[int]
    is_active:              bool

    class Config:
        from_attributes = True


class UpdateProfileRequest(BaseModel):
    full_name:        Optional[str] = None
    career_interests: Optional[str] = None
    class_level:      Optional[ClassLevel] = None
    has_real_waec_results:  Optional[bool] = None   # NEW — set true if student has real WAEC

