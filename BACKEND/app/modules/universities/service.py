from typing import List, Optional
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.modules.universities.model import University, Course, CutoffMark
from app.modules.universities.schema import RecommendedOption


class UniversityService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_all(
        self,
        state:    Optional[str] = None,
        uni_type: Optional[str] = None,
    ) -> List[University]:
        q = select(University).where(University.is_active == True)
        if state:
            q = q.where(University.state.ilike(state))
        if uni_type:
            q = q.where(University.type == uni_type)
        return (await self.db.execute(q.order_by(University.name))).scalars().all()

    async def get_by_id(self, uni_id: int) -> University:
        result = await self.db.execute(
            select(University).where(University.id == uni_id, University.is_active == True)
        )
        uni = result.scalars().first()
        if not uni:
            raise HTTPException(status_code=404, detail="University not found")
        return uni

    async def get_courses(self, uni_id: int) -> List[Course]:
        return (await self.db.execute(
            select(Course)
            .where(Course.university_id == uni_id, Course.is_active == True)
            .order_by(Course.name)
        )).scalars().all()

    async def get_course_by_id(self, course_id: int) -> Course:
        result = await self.db.execute(select(Course).where(Course.id == course_id))
        course = result.scalars().first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        return course

    async def get_cutoff_history(self, course_id: int) -> List[CutoffMark]:
        return (await self.db.execute(
            select(CutoffMark).where(CutoffMark.course_id == course_id)
            .order_by(CutoffMark.year.desc())
        )).scalars().all()

    async def recommend_by_score(
        self, jamb_score: int, course_interest: Optional[str] = None
    ) -> List[RecommendedOption]:
        """
        Find universities where student's JAMB score meets or exceeds cutoff.
        Used for:
          - General university discovery
          - JAMB low-score alternatives
          - POST-UTME fail alternatives
        """
        q = (
            select(Course, University)
            .join(University, University.id == Course.university_id)
            .where(Course.is_active == True)
            .where(University.is_active == True)
            .where(Course.jamb_cutoff != None)
            .where(Course.jamb_cutoff <= jamb_score)
        )
        if course_interest:
            q = q.where(Course.name.ilike(f"%{course_interest}%"))
        q = q.order_by(Course.jamb_cutoff.desc()).limit(15)

        rows = (await self.db.execute(q)).all()
        return [
            RecommendedOption(
                university_id=row.University.id,
                university_name=row.University.name,
                short_name=row.University.short_name,
                state=row.University.state,
                course_id=row.Course.id,
                course_name=row.Course.name,
                jamb_cutoff=row.Course.jamb_cutoff,
                score_above_cutoff=jamb_score - row.Course.jamb_cutoff,
                jamb_subjects=row.Course.jamb_subjects,
            )
            for row in rows
        ]

    async def select_university_course(
        self, user_id: int, university_id: int, course_id: int
    ) -> dict:
        """Persist student's university + course choice."""
        from app.modules.auth.model import User
        course = await self.get_course_by_id(course_id)
        if course.university_id != university_id:
            raise HTTPException(
                status_code=422,
                detail="This course does not belong to the selected university",
            )
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalars().first()
        user.selected_university_id = university_id
        user.selected_course_id     = course_id
        await self.db.commit()
        return {"message": "Selection saved", "university_id": university_id, "course_id": course_id}

