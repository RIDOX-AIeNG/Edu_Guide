from datetime import date, datetime
from typing import Optional, List
from sqlalchemy import Column, Integer, String, Boolean, Date, Text, DateTime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from fastapi import APIRouter, Depends, Header, HTTPException
from app.core.database import Base, get_db
from app.core.config import settings


class Scholarship(Base):
    __tablename__ = "scholarships"

    id             = Column(Integer, primary_key=True, index=True)
    title          = Column(String(300), nullable=False)
    provider       = Column(String(200), nullable=False) 
    description    = Column(Text,        nullable=True)
    amount         = Column(String(100), nullable=True)  
    deadline       = Column(Date,        nullable=True)
    eligibility    = Column(Text,        nullable=True)  
    apply_url      = Column(String(500), nullable=True)
    category       = Column(String(50),  default="undergraduate") 
    country        = Column(String(50),  default="Nigeria")
    is_active      = Column(Boolean,     default=True,  index=True)
    is_urgent      = Column(Boolean,     default=False)  
    created_at     = Column(DateTime,    default=datetime.utcnow)
    updated_at     = Column(DateTime,    default=datetime.utcnow, onupdate=datetime.utcnow)


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
    description: Optional[str]
    amount:      Optional[str]
    deadline:    Optional[date]
    eligibility: Optional[str]
    apply_url:   Optional[str]
    category:    str
    country:     str
    is_urgent:   bool

    class Config:
        from_attributes = True


router_scholarships = APIRouter()


@router_scholarships.get("/scholarships", response_model=List[ScholarshipResponse])
async def list_scholarships(
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    from app.core.cache import Cache, TTL_SCHOLARSHIP_LIST
    key = f"scholarships:{category or 'all'}"
    cached = await Cache.get(key)
    if cached:
        return cached

    q = select(Scholarship).where(Scholarship.is_active == True)
    if category:
        q = q.where(Scholarship.category == category)
    q = q.order_by(Scholarship.is_urgent.desc(), Scholarship.deadline.asc())
    rows = (await db.execute(q)).scalars().all()
    result = [ScholarshipResponse.model_validate(r).model_dump(mode="json") for r in rows]

    await Cache.set(key, result, TTL_SCHOLARSHIP_LIST)
    return result


@router_scholarships.post("/admin/scholarships")
async def create_scholarship(
    payload: ScholarshipCreate,
    x_admin_key: str = Header(...),
    db: AsyncSession = Depends(get_db),
):
    if x_admin_key != settings.ADMIN_SEED_KEY:
        raise HTTPException(status_code=403)
    s = Scholarship(**payload.model_dump())
    db.add(s)
    await db.commit()
    from app.core.cache import Cache
    await Cache.delete_pattern("scholarships:*")
    return {"id": s.id}

"""
CREATE TABLE IF NOT EXISTS scholarships (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(300) NOT NULL,
    provider    VARCHAR(200) NOT NULL,
    description TEXT,
    amount      VARCHAR(100),
    deadline    DATE,
    eligibility TEXT,
    apply_url   VARCHAR(500),
    category    VARCHAR(50) DEFAULT 'undergraduate',
    country     VARCHAR(50) DEFAULT 'Nigeria',
    is_active   BOOLEAN DEFAULT TRUE,
    is_urgent   BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);
"""