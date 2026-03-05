from datetime import datetime, date
from typing import Optional, List
from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, ForeignKey, Text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from fastapi import APIRouter, Depends, Header, HTTPException
from app.core.database import Base, get_db
from app.core.config import settings


class AdmissionWindow(Base):
    __tablename__ = "admission_windows"

    id             = Column(Integer, primary_key=True, index=True)
    university_id  = Column(Integer, ForeignKey("universities.id", ondelete="CASCADE"),
                            nullable=False, index=True)
    exam_type      = Column(String(50),  default="jamb")   
    status         = Column(String(30),  nullable=False)   
    form_fee       = Column(Integer,     nullable=True)  
    open_date      = Column(Date,        nullable=True)
    close_date     = Column(Date,        nullable=True)
    post_utme_date = Column(Date,        nullable=True)
    cutoff_mark    = Column(Integer,     nullable=True)
    notes          = Column(Text,        nullable=True) 
    is_active      = Column(Boolean,     default=True)
    updated_at     = Column(DateTime,    default=datetime.utcnow, onupdate=datetime.utcnow)


class AdmissionWindowCreate(BaseModel):
    university_id:  int
    exam_type:      str = "jamb"
    status:         str     
    form_fee:       Optional[int] = None
    open_date:      Optional[date] = None
    close_date:     Optional[date] = None
    post_utme_date: Optional[date] = None
    cutoff_mark:    Optional[int] = None
    notes:          Optional[str] = None


class AdmissionWindowResponse(BaseModel):
    id:             int
    university_id:  int
    university_name: Optional[str] = None
    exam_type:      str
    status:         str
    form_fee:       Optional[int]
    open_date:      Optional[date]
    close_date:     Optional[date]
    post_utme_date: Optional[date]
    cutoff_mark:    Optional[int]
    notes:          Optional[str]
    updated_at:     datetime

    class Config:
        from_attributes = True


router = APIRouter()

def _check_admin(x_admin_key: str = Header(...)):
    if x_admin_key != settings.ADMIN_SEED_KEY:
        raise HTTPException(status_code=403, detail="Admin access required")


@router.get("/admission-status", response_model=List[AdmissionWindowResponse])
async def get_admission_status(
    university_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
):
    from app.core.cache import Cache, TTL_ADMISSION_STATUS
    from app.modules.universities.model import University

    cache_key = f"admission_status:{university_id or 'all'}"
    cached = await Cache.get(cache_key)
    if cached:
        return cached

    q = select(AdmissionWindow, University.name.label("uni_name")) \
        .join(University, University.id == AdmissionWindow.university_id) \
        .where(AdmissionWindow.is_active == True) \
        .order_by(AdmissionWindow.updated_at.desc())

    if university_id:
        q = q.where(AdmissionWindow.university_id == university_id)

    rows = (await db.execute(q)).all()
    result = []
    for window, uni_name in rows:
        r = AdmissionWindowResponse.model_validate(window)
        r.university_name = uni_name
        result.append(r.model_dump(mode="json"))

    await Cache.set(cache_key, result, TTL_ADMISSION_STATUS)
    return result


@router.post("/admin/admission-status", dependencies=[Depends(_check_admin)])
async def create_admission_window(
    payload: AdmissionWindowCreate,
    db: AsyncSession = Depends(get_db),
):
    window = AdmissionWindow(**payload.model_dump())
    db.add(window)
    await db.commit()
    await db.refresh(window)
 
    from app.core.cache import Cache
    await Cache.delete_pattern("admission_status:*")
    return {"id": window.id, "message": "Admission window created"}


@router.put("/admin/admission-status/{window_id}", dependencies=[Depends(_check_admin)])
async def update_admission_window(
    window_id: int,
    payload: AdmissionWindowCreate,
    db: AsyncSession = Depends(get_db),
):
    window = (await db.execute(
        select(AdmissionWindow).where(AdmissionWindow.id == window_id)
    )).scalars().first()
    if not window:
        raise HTTPException(status_code=404, detail="Window not found")

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(window, k, v)
    window.updated_at = datetime.utcnow()
    await db.commit()

    from app.core.cache import Cache
    await Cache.delete_pattern("admission_status:*")
    return {"message": "Updated"}


@router.delete("/admin/admission-status/{window_id}", dependencies=[Depends(_check_admin)])
async def delete_admission_window(
    window_id: int,
    db: AsyncSession = Depends(get_db),
):
    window = (await db.execute(
        select(AdmissionWindow).where(AdmissionWindow.id == window_id)
    )).scalars().first()
    if window:
        window.is_active = False
        await db.commit()
        from app.core.cache import Cache
        await Cache.delete_pattern("admission_status:*")
    return {"message": "Deleted"}


"""
CREATE TABLE IF NOT EXISTS admission_windows (
    id             SERIAL PRIMARY KEY,
    university_id  INTEGER NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    exam_type      VARCHAR(50) DEFAULT 'jamb',
    status         VARCHAR(30) NOT NULL,
    form_fee       INTEGER,
    open_date      DATE,
    close_date     DATE,
    post_utme_date DATE,
    cutoff_mark    INTEGER,
    notes          TEXT,
    is_active      BOOLEAN DEFAULT TRUE,
    updated_at     TIMESTAMP DEFAULT NOW()
);
CREATE INDEX ix_adm_win_uni ON admission_windows(university_id);
CREATE INDEX ix_adm_win_status ON admission_windows(status, is_active);
"""

