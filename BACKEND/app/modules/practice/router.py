from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.core.dependencies import get_current_student
from app.modules.practice.schema import (
    StartPracticeRequest, SubmitPracticeRequest,
    PracticeResultResponse, PracticeSessionResponse,
    RecommendedPractice,
)
from app.modules.practice.service import PracticeService
from app.modules.question.service import QuestionService
from app.modules.question.schema import SubjectResponse, TopicResponse

router = APIRouter()


@router.get("/subjects", response_model=List[SubjectResponse])
async def list_subjects(db: AsyncSession = Depends(get_db)):
    """All subjects available for practice."""
    return await QuestionService(db).list_subjects()


@router.get("/topics/{subject_id}", response_model=List[TopicResponse])
async def list_topics(subject_id: int, db: AsyncSession = Depends(get_db)):
    """All topics for a subject (for topic-specific practice)."""
    return await QuestionService(db).list_topics(subject_id)


@router.post("/start")
async def start_practice(
    payload: StartPracticeRequest,
    user=Depends(get_current_student),
    db:  AsyncSession = Depends(get_db),
):
    """
    Start a practice session.
    Returns questions — unlike exams, correct answers are revealed per-question on submit.
    """
    return await PracticeService(db).start_session(user.id, payload)


@router.post("/sessions/{session_id}/submit", response_model=PracticeResultResponse)
async def submit_practice(
    session_id: int,
    payload:    SubmitPracticeRequest,
    user=Depends(get_current_student),
    db:  AsyncSession = Depends(get_db),
):
    """Submit answers. Returns immediate per-question feedback with explanations."""
    return await PracticeService(db).submit_session(session_id, user.id, payload)


@router.get("/recommended", response_model=List[RecommendedPractice])
async def recommended_practice(
    user=Depends(get_current_student),
    db:  AsyncSession = Depends(get_db),
):
    """
    AI-recommended topics to practice.
    Based on weak areas from the student's most recent exam attempt.
    """
    return await PracticeService(db).get_recommended(user.id)


@router.get("/my-sessions", response_model=List[PracticeSessionResponse])
async def my_sessions(
    user=Depends(get_current_student),
    db:  AsyncSession = Depends(get_db),
):
    """History of all practice sessions."""
    return await PracticeService(db).get_user_sessions(user.id)



from sqlalchemy import select, func
from app.modules.question.model import Question, Subject

@router.get("/waec-subjects")
async def get_waec_subjects(db: AsyncSession = Depends(get_db)):
    """
    Returns subjects that have at least 5 WAEC questions.
    Used by WAECPage.jsx SubjectSelect to show available exam subjects.
    """
    from app.core.cache import Cache, TTL_WAEC_SUBJECTS
    cached = await Cache.get("waec_subjects")
    if cached:
        return cached
    
    rows = (await db.execute(
        select(Subject)
        .join(Question, Question.subject_id == Subject.id)
        .where(Question.exam_type == "waec", Subject.is_active == True)
        .group_by(Subject.id)
        .having(func.count(Question.id) >= 5)
        .order_by(Subject.name)
    )).scalars().all()   

    result = [{"id": s.id, "name": s.name, "code": s.code} for s in rows]
    await Cache.set("waec_subjects", result, TTL_WAEC_SUBJECTS)
    return result

