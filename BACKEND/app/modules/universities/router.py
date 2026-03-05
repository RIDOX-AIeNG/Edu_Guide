from unittest import result

from fastapi import APIRouter, Depends, Query
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.core.dependencies import get_current_student
from app.modules.universities.schema import (
    UniversityListResponse, UniversityDetailResponse,
    CourseResponse, CutoffMarkResponse,
    RecommendRequest, RecommendedOption,
    SelectUniversityRequest,
)
from app.modules.universities.service import UniversityService
from app.core.cache import TTL_UNIVERSITY_LIST

router = APIRouter()


@router.get("/", response_model=List[UniversityListResponse])
async def list_universities(
    state: Optional[str] = Query(None, description="e.g. Lagos, Oyo"),
    type:  Optional[str] = Query(None, description="federal | state | private"),
    db:    AsyncSession  = Depends(get_db),
):
    """List all active universities. Filter by state or type."""
    
    from app.core.cache import Cache, TTL_UNIVERSITY_LIST
    cached = await Cache.get("universities:all")
    if cached:
        return cached

    result = await UniversityService(db).list_all(state, type)
    await Cache.set("universities:all", result, TTL_UNIVERSITY_LIST)
    return result
   

@router.get("/{uni_id}", response_model=UniversityDetailResponse)
async def get_university(uni_id: int, db: AsyncSession = Depends(get_db)):
    """Get full university details including all courses."""
    uni = await UniversityService(db).get_by_id(uni_id)
    uni.courses = await UniversityService(db).get_courses(uni_id)
    return uni


@router.get("/{uni_id}/courses", response_model=List[CourseResponse])
async def get_courses(uni_id: int, db: AsyncSession = Depends(get_db)):
    """List all courses offered by a university."""
    
    from app.core.cache import Cache, TTL_COURSE_LIST
    key = f"courses:{uni_id}"
    cached = await Cache.get(key)
    if cached:
        return cached
    
    result = await UniversityService(db).get_courses(uni_id)
    await Cache.set(key, result, TTL_COURSE_LIST)
    return result

    


@router.get("/courses/{course_id}", response_model=CourseResponse)
async def get_course(course_id: int, db: AsyncSession = Depends(get_db)):
    """Get course details: JAMB subjects, WAEC requirements, cutoff."""
    return await UniversityService(db).get_course_by_id(course_id)


@router.get("/courses/{course_id}/cutoffs", response_model=List[CutoffMarkResponse])
async def cutoff_history(course_id: int, db: AsyncSession = Depends(get_db)):
    """Historical cutoff marks for a course (year by year)."""
    return await UniversityService(db).get_cutoff_history(course_id)


@router.post("/recommend", response_model=List[RecommendedOption])
async def recommend_universities(
    payload: RecommendRequest,
    db:      AsyncSession = Depends(get_db),
):
    """
    Given a JAMB score, return universities/courses the student qualifies for.
    Used for:  general discovery, JAMB low-score alternatives, POST-UTME alternatives.
    """
    return await UniversityService(db).recommend_by_score(
        payload.jamb_score, payload.course_interest
    )


@router.post("/select")
async def select_university(
    payload: SelectUniversityRequest,
    user=Depends(get_current_student),
    db:      AsyncSession = Depends(get_db),
):
    """Student saves their target university + course (must be done before JAMB)."""
    return await UniversityService(db).select_university_course(
        user.id, payload.university_id, payload.course_id
    )
