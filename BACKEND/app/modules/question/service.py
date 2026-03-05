from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, not_
from app.modules.question.model import Subject, Topic, Question


class QuestionService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_subjects(self) -> List[Subject]:
        return (await self.db.execute(
            select(Subject).where(Subject.is_active == True).order_by(Subject.name)
        )).scalars().all()

    async def list_topics(self, subject_id: int) -> List[Topic]:
        return (await self.db.execute(
            select(Topic).where(Topic.subject_id == subject_id).order_by(Topic.order_index)
        )).scalars().all()

    async def fetch_for_exam(
        self,
        subject_id: int,
        exam_type:  str,
        limit:      int,
        topic_id:   Optional[int] = None,
        exclude_ids: Optional[List[int]] = None,
    ) -> List[Question]:
        """Fetch active, verified questions for an exam session."""
        q = select(Question).where(
            Question.subject_id  == subject_id,
            Question.exam_type   == exam_type,
            Question.is_active   == True,
            Question.is_verified == True,
        )
        if topic_id:
            q = q.where(Question.topic_id == topic_id)
        if exclude_ids:
            q = q.where(not_(Question.id.in_(exclude_ids)))
      
        q = q.order_by(Question.success_rate.asc()).limit(limit)
        return (await self.db.execute(q)).scalars().all()

    async def fetch_for_practice(
        self,
        subject_id: int,
        topic_id:   Optional[int] = None,
        limit:      int = 20,
    ) -> List[Question]:
        """Fetch questions for a practice session (any exam_type)."""
        q = select(Question).where(
            Question.subject_id  == subject_id,
            Question.is_active   == True,
            Question.is_verified == True,
        )
        if topic_id:
            q = q.where(Question.topic_id == topic_id)
        q = q.limit(limit)
        return (await self.db.execute(q)).scalars().all()

    async def update_analytics(self, question_id: int, is_correct: bool):
        """Increment attempt/correct counters and recalculate success_rate."""
        result = await self.db.execute(select(Question).where(Question.id == question_id))
        q = result.scalars().first()
        if q:
            q.times_attempted += 1
            if is_correct:
                q.times_correct += 1
            q.success_rate = q.times_correct / q.times_attempted

    async def get_or_create_subject(self, name: str) -> Subject:
        result = (await self.db.execute(
            select(Subject).where(Subject.name == name)
        )).scalars().first()
        if not result:
            result = Subject(name=name)
            self.db.add(result)
            await self.db.flush()
        return result

    async def get_or_create_topic(self, name: str, subject_id: int) -> Topic:
        result = (await self.db.execute(
            select(Topic).where(Topic.name == name, Topic.subject_id == subject_id)
        )).scalars().first()
        if not result:
            result = Topic(name=name, subject_id=subject_id)
            self.db.add(result)
            await self.db.flush()
        return result
