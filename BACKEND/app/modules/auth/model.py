from datetime import datetime
from enum import Enum
#from backendy.app.shared.enums import ClassLevel, JourneyStage


from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
import sqlalchemy as sa
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id                      = Column(Integer, primary_key=True, index=True)
    email                   = Column(String(255), unique=True, index=True, nullable=False)
    full_name               = Column(String(200), nullable=False)
    hashed_password         = Column(String(255), nullable=False)
    class_level             = Column(String(10),  nullable=True)    # SS1 | SS2 | SS3
                  
    journey_stage           = Column(String(20),  nullable=False, default="onboarding",server_default="onboarding")
    career_interests        = Column(Text, nullable=True)
    has_real_waec_results   = Column(Boolean, default=False, nullable=False, server_default=sa.text("false"))
    
    # FK to selected university/course (set after JAMB)
    selected_university_id  = Column(Integer, nullable=True)
    selected_course_id      = Column(Integer, nullable=True)
    is_active               = Column(Boolean, default=True, nullable=False)
    is_email_verified       = Column(Boolean, default=False, nullable=False)
    last_login_at           = Column(DateTime, nullable=True)
    created_at              = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at              = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # relationships imported in __init__.py to avoid circular imports
    from sqlalchemy.orm import relationship
    refresh_tokens          = relationship("RefreshToken",         back_populates="user", cascade="all, delete-orphan")
    exam_attempts           = relationship("ExamAttempt",          back_populates="student", cascade="all, delete-orphan")
    practice_sessions       = relationship("PracticeSession",      back_populates="student", cascade="all, delete-orphan")
    advisor_conversations   = relationship("AdvisorConversation",  back_populates="user",    cascade="all, delete-orphan")
    career_assessments      = relationship("CareerAssessment",     back_populates="user",    cascade="all, delete-orphan")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, nullable=False, index=True)
    token      = Column(String(512), unique=True, index=True, nullable=False)
    is_revoked = Column(Boolean, default=False, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    from sqlalchemy.orm import relationship
    from sqlalchemy import ForeignKey
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"),
                        nullable=False, index=True)
    user       = relationship("User", back_populates="refresh_tokens")

