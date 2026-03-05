
from typing import List, Optional
from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime

from app.core.database  import get_db
from app.core.config    import settings
from app.modules.scholarships.models  import Scholarship
from app.modules.scholarships.schemas import ScholarshipCreate, ScholarshipResponse

router = APIRouter()


@router.get("/", response_model=List[ScholarshipResponse])
async def list_scholarships(
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    q = select(Scholarship).where(Scholarship.is_active == True)
    if category:
        q = q.where(Scholarship.category == category)
    q = q.order_by(Scholarship.is_urgent.desc(), Scholarship.deadline.asc())
    rows = (await db.execute(q)).scalars().all()
    return rows



@router.post("/", status_code=201)
async def create_scholarship(
    payload: ScholarshipCreate,
    db: AsyncSession = Depends(get_db),
    x_admin_key: Optional[str] = Header(None, alias="x-admin-key"),
):
    if not x_admin_key or x_admin_key != settings.ADMIN_SEED_KEY:
        raise HTTPException(status_code=403, detail="Admin access required")
    s = Scholarship(**payload.model_dump())
    db.add(s)
    await db.commit()
    await db.refresh(s)
    return {"id": s.id, "message": "Scholarship created"}


@router.post("/bulk", status_code=201)
async def create_scholarships_bulk(
    payload: List[ScholarshipCreate],
    db: AsyncSession = Depends(get_db),
    x_admin_key: Optional[str] = Header(None, alias="x-admin-key"),
):
    if not x_admin_key or x_admin_key != settings.ADMIN_SEED_KEY:
        raise HTTPException(status_code=403, detail="Admin access required")
    created = []
    for item in payload:
        s = Scholarship(**item.model_dump())
        db.add(s)
        created.append(s)
    await db.commit()
    return {"created": len(created), "message": f"{len(created)} scholarships added"}


@router.put("/{scholarship_id}")
async def update_scholarship(
    scholarship_id: int,
    payload: ScholarshipCreate,
    db: AsyncSession = Depends(get_db),
    x_admin_key: Optional[str] = Header(None, alias="x-admin-key"),
):
    if not x_admin_key or x_admin_key != settings.ADMIN_SEED_KEY:
        raise HTTPException(status_code=403, detail="Admin access required")
    s = (await db.execute(
        select(Scholarship).where(Scholarship.id == scholarship_id)
    )).scalars().first()
    if not s:
        raise HTTPException(status_code=404, detail="Scholarship not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(s, k, v)
    s.updated_at = datetime.utcnow()
    await db.commit()
    return {"message": "Updated"}


@router.delete("/{scholarship_id}")
async def delete_scholarship(
    scholarship_id: int,
    db: AsyncSession = Depends(get_db),
    x_admin_key: Optional[str] = Header(None, alias="x-admin-key"),
):
    if not x_admin_key or x_admin_key != settings.ADMIN_SEED_KEY:
        raise HTTPException(status_code=403, detail="Admin access required")
    s = (await db.execute(
        select(Scholarship).where(Scholarship.id == scholarship_id)
    )).scalars().first()
    if s:
        s.is_active = False
        await db.commit()
    return {"message": "Deleted"}