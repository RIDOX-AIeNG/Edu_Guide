from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean,
    DateTime, Float, Text, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class University(Base):
    __tablename__ = "universities"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String(300), nullable=False)
    short_name  = Column(String(50),  nullable=True, unique=True, index=True)
    state       = Column(String(100), nullable=True)
    type        = Column(String(30),  nullable=True)  
    jamb_cutoff = Column(Integer,     nullable=True)  
    description = Column(Text,        nullable=True)
    website     = Column(String(300), nullable=True)
    is_active   = Column(Boolean, default=True, nullable=False)
    created_at  = Column(DateTime, default=datetime.utcnow, nullable=False)

    courses      = relationship("Course",     back_populates="university", cascade="all, delete-orphan")
    cutoff_marks = relationship("CutoffMark", back_populates="university", cascade="all, delete-orphan")
    news         = relationship("UniversityNews", back_populates="university", cascade="all, delete-orphan")


class Course(Base):
    __tablename__ = "courses"

    id               = Column(Integer, primary_key=True, index=True)
    university_id    = Column(Integer, ForeignKey("universities.id", ondelete="CASCADE"), nullable=False, index=True)
    name             = Column(String(255), nullable=False)
    code             = Column(String(20),  nullable=True)
    faculty          = Column(String(150), nullable=True)
    department       = Column(String(150), nullable=True)

  
   
    jamb_subjects    = Column(JSON, nullable=True)
   
    waec_subjects    = Column(JSON, nullable=True)

    jamb_cutoff      = Column(Integer, nullable=True)
    post_utme_cutoff = Column(Integer, nullable=True)
    description      = Column(Text, nullable=True)
    is_active        = Column(Boolean, default=True, nullable=False)
    created_at       = Column(DateTime, default=datetime.utcnow, nullable=False)

    university   = relationship("University", back_populates="courses")
    cutoff_marks = relationship("CutoffMark", back_populates="course")


class CutoffMark(Base):
    """Historical cutoff data by year — useful for trend charts."""
    __tablename__ = "cutoff_marks"

    id              = Column(Integer, primary_key=True, index=True)
    university_id   = Column(Integer, ForeignKey("universities.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id       = Column(Integer, ForeignKey("courses.id",      ondelete="CASCADE"), nullable=True,  index=True)
    year            = Column(Integer, nullable=False)
    jamb_score      = Column(Integer, nullable=False)
    post_utme_score = Column(Integer, nullable=True)
    aggregate_score = Column(Float,   nullable=True)
    notes           = Column(Text,    nullable=True)
    created_at      = Column(DateTime, default=datetime.utcnow, nullable=False)

    university = relationship("University", back_populates="cutoff_marks")
    course     = relationship("Course",     back_populates="cutoff_marks")

class UniversityNews(Base):
    """Live admission news/updates shown on dashboard right panel."""
    __tablename__ = "university_news"

    id              = Column(Integer, primary_key=True, index=True)
    university_id   = Column(Integer, ForeignKey("universities.id", ondelete="CASCADE"),
                             nullable=False, index=True)
    message         = Column(String(200), nullable=False)  
    status          = Column(String(20),  nullable=False)  
    status_label    = Column(String(20),  nullable=False)  
    deadline        = Column(String(100), nullable=True)  
    is_active       = Column(Boolean, default=True, nullable=False)
    created_at      = Column(DateTime, default=datetime.utcnow)
    updated_at      = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    university = relationship("University", back_populates="news")




