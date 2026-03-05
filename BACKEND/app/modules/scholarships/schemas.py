from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel


class ScholarshipCreate(BaseModel):
    title:       str
    provider:    str
    description: Optional[str] = None
    amount:      Optional[str] = None
    deadline:    Optional[date] = None
    eligibility: Optional[str] = None
    apply_url:   Optional[str] = None
    category:    str = "undergraduate"
    country:     str = "Nigeria"
    is_urgent:   bool = False


class ScholarshipResponse(BaseModel):
    id:          int
    title:       str
    provider:    str
    description: Optional[str] = None
    amount:      Optional[str] = None
    deadline:    Optional[date] = None
    eligibility: Optional[str] = None
    apply_url:   Optional[str] = None
    category:    str
    country:     str
    is_urgent:   bool
    is_active:   bool

    class Config:
        from_attributes = True

