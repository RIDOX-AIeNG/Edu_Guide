from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean,
    DateTime, Float, Text, ForeignKey, JSON, Enum
)
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.shared.enums import AttemptStatus
from sqlalchemy import Index


class ExamAttempt(Base):
    """
    One row = one exam session.
    - WAEC:      one attempt per subject
    - JAMB:      one attempt (all 4 subjects combined)
    - POST-UTME: one attempt (course-specific questions)
    """
    __tablename__ = "exam_attempts"

    id               = Column(Integer, primary_key=True, index=True)
    student_id       = Column(Integer, ForeignKey("users.id",        ondelete="CASCADE"), nullable=False, index=True)
    exam_type        = Column(String(20), nullable=False, index=True) 
    subject_id       = Column(Integer, ForeignKey("subjects.id",     ondelete="SET NULL"), nullable=True) 
    university_id    = Column(Integer, ForeignKey("universities.id", ondelete="SET NULL"), nullable=True) 
    course_id        = Column(Integer, ForeignKey("courses.id",      ondelete="SET NULL"), nullable=True) 

   
    started_at       = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at     = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer,  nullable=True)


    status           = Column(String(20), default=AttemptStatus.in_progress, nullable=False)
    total_questions  = Column(Integer, nullable=True)
    correct_answers  = Column(Integer, nullable=True)
    score            = Column(Integer, nullable=True)  
    percentage       = Column(Float,   nullable=True)
    passed           = Column(Boolean, nullable=True)
    grade            = Column(String(5), nullable=True) 

  
    topic_scores     = Column(JSON, nullable=True)  
    weak_topics      = Column(JSON, nullable=True) 

  
    ai_feedback      = Column(Text, nullable=True)

    created_at       = Column(DateTime, default=datetime.utcnow, nullable=False)

    student    = relationship("User",       back_populates="exam_attempts")
    subject    = relationship("Subject",    foreign_keys=[subject_id])
    university = relationship("University", foreign_keys=[university_id])
    course     = relationship("Course",     foreign_keys=[course_id])
    answers    = relationship("ExamAnswer", back_populates="attempt", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_attempt_student_type",   "student_id", "exam_type"),      
        Index("ix_attempt_student_status", "student_id", "status"),        
        Index("ix_attempt_started_at",     "started_at"),                 
    )

class ExamAnswer(Base):
    """One row per question answered in an exam attempt."""
    __tablename__ = "exam_answers"

    id                 = Column(Integer, primary_key=True, index=True)
    attempt_id         = Column(Integer, ForeignKey("exam_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id        = Column(Integer, ForeignKey("questions.id",     ondelete="CASCADE"), nullable=False, index=True)
    selected_answer    = Column(String(1), nullable=True)
    is_correct         = Column(Boolean, default=False, nullable=False)
    time_spent_seconds = Column(Integer, nullable=True)
    answered_at        = Column(DateTime, default=datetime.utcnow, nullable=False)

    attempt  = relationship("ExamAttempt", back_populates="answers")
    question = relationship("Question",    back_populates="exam_answers")
