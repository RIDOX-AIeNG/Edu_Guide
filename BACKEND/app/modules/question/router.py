from a import Question, Subject
from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
import select

from app.core.dependencies import get_db
from app.modules.question.schema import SubjectResponse, TopicResponse
from app.modules.question.service import QuestionService

router = APIRouter()


@router.get("/subjects", response_model=List[SubjectResponse])
async def list_subjects(db: AsyncSession = Depends(get_db)):
    """All subjects available in the question bank."""
    return await QuestionService(db).list_subjects()



from sqlalchemy import func

@router.get("/waec-subjects", response_model=List[SubjectResponse])
async def list_waec_subjects(
    min_questions: int = 10,
    db: AsyncSession = Depends(get_db),
):
    """
    Return only subjects that have >= min_questions verified WAEC questions.
    Used by the WAEC exam setup page so students only see subjects they can actually sit.
    """
   
    subq = (
        select(Question.subject_id)
        .where(
            Question.exam_type   == "waec",
            Question.is_verified == True,
            Question.is_active   == True,
        )
        .group_by(Question.subject_id)
        .having(func.count(Question.id) >= min_questions)
    ).scalar_subquery()

    subjects = (await db.execute(
        select(Subject)
        .where(Subject.id.in_(subq), Subject.is_active == True)
        .order_by(Subject.name)
    )).scalars().all()

    return subjects


@router.get("/subjects/{subject_id}/topics", response_model=List[TopicResponse])
async def list_topics(subject_id: int, db: AsyncSession = Depends(get_db)):
    """All topics for a given subject."""
    return await QuestionService(db).list_topics(subject_id)
