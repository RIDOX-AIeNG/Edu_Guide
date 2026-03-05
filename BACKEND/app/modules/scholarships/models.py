from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Date, Text, DateTime, Index
from app.core.database import Base


class Scholarship(Base):
    __tablename__ = "scholarships"

    id           = Column(Integer, primary_key=True, index=True)
    title        = Column(String(300), nullable=False)
    provider     = Column(String(200), nullable=False)
    description  = Column(Text,        nullable=True)
    amount       = Column(String(100), nullable=True) 
    deadline     = Column(Date,        nullable=True)
    eligibility  = Column(Text,        nullable=True)
    apply_url    = Column(String(500), nullable=True)
    category     = Column(String(50),  default="undergraduate") 
    country      = Column(String(50),  default="Nigeria")
    is_active    = Column(Boolean,     default=True, index=True)
    is_urgent    = Column(Boolean,     default=False)
    created_at   = Column(DateTime,    default=datetime.utcnow)
    updated_at   = Column(DateTime,    default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index("ix_scholarship_active_deadline", "is_active", "deadline"),
    )
