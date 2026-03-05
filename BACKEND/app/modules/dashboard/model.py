from datetime import datetime
from sqlalchemy import Column, Integer, Text, DateTime
from app.core.database import Base


class AdmissionUpdate(Base):
    __tablename__ = "admission_updates"

    id = Column(Integer, primary_key=True, index=True)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
