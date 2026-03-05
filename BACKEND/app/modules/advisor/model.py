from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean,
    DateTime, Text, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class AdvisorConversation(Base):
    """
    Groups messages into a conversation session.
    A student may have many conversations over time.
    """
    __tablename__ = "advisor_conversations"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title      = Column(String(200), nullable=True)  
    context    = Column(String(50),  nullable=True)   
    is_active  = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user     = relationship("User",            back_populates="advisor_conversations")
    messages = relationship("AdvisorMessage",  back_populates="conversation",
                            cascade="all, delete-orphan", order_by="AdvisorMessage.created_at")


class AdvisorMessage(Base):
    """One message turn — role=user|assistant."""
    __tablename__ = "advisor_messages"

    id              = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("advisor_conversations.id", ondelete="CASCADE"),
                             nullable=False, index=True)
    role            = Column(String(15), nullable=False) 
    content         = Column(Text, nullable=False)
    created_at      = Column(DateTime, default=datetime.utcnow, nullable=False)

    conversation = relationship("AdvisorConversation", back_populates="messages")


class CareerAssessment(Base):
    """
    Structured career assessment result.
    Produced by the advisor after the initial career survey.
    """
    __tablename__ = "career_assessments"

    id                 = Column(Integer, primary_key=True, index=True)
    user_id            = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"),
                                nullable=False, index=True, unique=True)
    raw_responses      = Column(JSON, nullable=True)   
    recommended_careers = Column(JSON, nullable=True) 
    recommended_courses = Column(JSON, nullable=True)  
    waec_subjects_needed = Column(JSON, nullable=True)
    jamb_subjects_needed = Column(JSON, nullable=True)
    summary             = Column(Text, nullable=True) 
    created_at          = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at          = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="career_assessments")

