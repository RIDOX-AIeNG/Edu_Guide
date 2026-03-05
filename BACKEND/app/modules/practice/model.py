from datetime import datetime
from sqlalchemy import (
    Column, Index, Integer, String, Boolean,
    DateTime, Float, ForeignKey
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class PracticeSession(Base):
    """
    A focused practice session.
    Unlike exams, practice gives immediate feedback after each question.
    """
    __tablename__ = "practice_sessions"

    id               = Column(Integer, primary_key=True, index=True)
    student_id       = Column(Integer, ForeignKey("users.id",    ondelete="CASCADE"), nullable=False, index=True)
    subject_id       = Column(Integer, ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True,  index=True)
    topic_id         = Column(Integer, ForeignKey("topics.id",   ondelete="SET NULL"), nullable=True)
    is_ai_recommended = Column(Boolean, default=False, nullable=False)
    total_questions  = Column(Integer, default=0, nullable=False)
    correct_count    = Column(Integer, default=0, nullable=False)
    percentage       = Column(Float,   nullable=True)
    status           = Column(String(20), default="in_progress", nullable=False)
    started_at       = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at     = Column(DateTime, nullable=True)
    created_at       = Column(DateTime, default=datetime.utcnow, nullable=False)

    student = relationship("User",    back_populates="practice_sessions")
    subject = relationship("Subject", foreign_keys=[subject_id])
    topic   = relationship("Topic",   foreign_keys=[topic_id])

    __table_args__ = (
        Index("ix_ps_student_status", "student_id", "status"),            
        Index("ix_ps_subject",        "subject_id"),                     
    )