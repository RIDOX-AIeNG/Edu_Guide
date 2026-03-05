from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean,
    DateTime, Float, Text, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class Subject(Base):
    """Top-level subject: Mathematics, English Language, Physics, etc."""
    __tablename__ = "subjects"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String(150), nullable=False, unique=True, index=True)
    code        = Column(String(10),  nullable=True, unique=True) 
    category    = Column(String(50),  nullable=True)      
    description = Column(Text, nullable=True)
    is_active   = Column(Boolean, default=True, nullable=False)
    created_at  = Column(DateTime, default=datetime.utcnow, nullable=False)

    topics    = relationship("Topic",    back_populates="subject", cascade="all, delete-orphan")
    questions = relationship("Question", back_populates="subject", cascade="all, delete-orphan")


class Topic(Base):
    """Sub-topic within a subject: Algebra, Trigonometry, Organic Chemistry, etc."""
    __tablename__ = "topics"

    id          = Column(Integer, primary_key=True, index=True)
    subject_id  = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    name        = Column(String(200), nullable=False)
    description = Column(Text,        nullable=True)
    order_index = Column(Integer,     default=0, nullable=False)
    created_at  = Column(DateTime, default=datetime.utcnow, nullable=False)

    subject   = relationship("Subject",  back_populates="topics")
    questions = relationship("Question", back_populates="topic")


class Question(Base):
    """
    Core question bank.
    exam_type: waec | jamb | post_utme | practice
    difficulty: easy | medium | hard
    """
    __tablename__ = "questions"

    id             = Column(Integer, primary_key=True, index=True)
    subject_id     = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_id       = Column(Integer, ForeignKey("topics.id",   ondelete="SET NULL"), nullable=True,  index=True)

   
    question_text  = Column(Text,      nullable=False)
    option_a       = Column(Text,      nullable=False)
    option_b       = Column(Text,      nullable=False)
    option_c       = Column(Text,      nullable=False)
    option_d       = Column(Text,      nullable=False)
    correct_answer = Column(String(1), nullable=False)  
    explanation    = Column(Text,      nullable=True)  

  
    exam_type      = Column(String(20), nullable=False, index=True) 
    difficulty     = Column(String(10), nullable=True,  index=True) 
    year           = Column(Integer,    nullable=True)
    image_url      = Column(String(500), nullable=True)

  
    times_attempted = Column(Integer, default=0,   nullable=False)
    times_correct   = Column(Integer, default=0,   nullable=False)
    success_rate    = Column(Float,   default=0.0, nullable=False)

    is_active    = Column(Boolean, default=True,  nullable=False)
    is_verified  = Column(Boolean, default=False, nullable=False) 
    created_at   = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at   = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    subject      = relationship("Subject",    back_populates="questions")
    topic        = relationship("Topic",      back_populates="questions")
    exam_answers = relationship("ExamAnswer", back_populates="question")

    __table_args__ = (
        Index("ix_q_subject_exam_diff", "subject_id", "exam_type", "difficulty"),
        Index("ix_q_topic_active",      "topic_id",   "is_active"),        
        Index("ix_q_exam_type_active",  "exam_type",  "is_active"),       
        Index("ix_q_subject_active",    "subject_id", "is_active"),  
    )

