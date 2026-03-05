from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.core.dependencies import get_current_student
from app.modules.exams.schema import (
    StartWAECRequest, StartJAMBRequest, StartPOSTUTMERequest,
    SubmitExamRequest, ExamAttemptResponse,
    WAECOverallResult, JAMBResultResponse,
    PostUTMEResultResponse, AvailableExamsResponse,
)
from app.modules.exams.service import ExamService

router = APIRouter()


@router.get("/available", response_model=AvailableExamsResponse)
async def available_exams(
    user=Depends(get_current_student),
    db:  AsyncSession = Depends(get_db),
):
    """
    Returns which exams the student can take right now, based on journey_stage.
    Use this to power the dashboard exam cards (locked/unlocked/passed/failed).
    """
    return await ExamService(db).get_available(user.id)




@router.post("/waec/start")
async def start_waec(
    payload: StartWAECRequest,
    user=Depends(get_current_student),
    db:  AsyncSession = Depends(get_db),
):
    """
    Start a WAEC exam for one subject.
    Returns: attempt_id + questions (without correct answers).
    """
    return await ExamService(db).start_waec(user.id, payload.subject_id)


@router.post("/waec/{attempt_id}/submit", response_model=ExamAttemptResponse)
async def submit_waec(
    attempt_id: int,
    payload:    SubmitExamRequest,
    user=Depends(get_current_student),
    db:  AsyncSession = Depends(get_db),
):
    """Submit WAEC answers. Returns grade (A1-F9), percentage, topic breakdown."""
    return await ExamService(db).submit_waec(attempt_id, user.id, payload)


@router.get("/waec/overall", response_model=WAECOverallResult)
async def waec_overall(
    user=Depends(get_current_student),
    db:  AsyncSession = Depends(get_db),
):
    """
    Phase gate: checks if student has earned 5+ credits (including English & Maths).
    If yes, automatically unlocks JAMB (advances journey_stage).
    Call this after completing all WAEC subjects.
    """
    return await ExamService(db).get_waec_overall(user.id)


@router.get("/waec/results/{attempt_id}", response_model=ExamAttemptResponse)
async def waec_results(
    attempt_id: int,
    user=Depends(get_current_student),
    db:  AsyncSession = Depends(get_db),
):
    """Get results for a specific WAEC attempt (grade, topic breakdown, weak topics)."""
    return await ExamService(db).get_waec_results(attempt_id, user.id)




@router.post("/jamb/start")
async def start_jamb(
    payload: StartJAMBRequest,
    user=Depends(get_current_student),
    db:  AsyncSession = Depends(get_db),
):
    """
    Start JAMB exam. Requires university + course selection.
    Returns 180 questions (45 per subject from course's jamb_subjects).
    """
    return await ExamService(db).start_jamb(user.id, payload.university_id, payload.course_id)


@router.post("/jamb/{attempt_id}/submit", response_model=ExamAttemptResponse)
async def submit_jamb(
    attempt_id: int,
    payload:    SubmitExamRequest,
    user=Depends(get_current_student),
    db:  AsyncSession = Depends(get_db),
):
    """Submit JAMB answers. Returns score out of 400."""
    return await ExamService(db).submit_jamb(attempt_id, user.id, payload)


@router.get("/jamb/results/{attempt_id}", response_model=JAMBResultResponse)
async def jamb_results(
    attempt_id: int,
    user=Depends(get_current_student),
    db:  AsyncSession = Depends(get_db),
):
    """
    Full JAMB result:
    - Score meets cutoff  → POST-UTME unlocked
    - Score < cutoff      → alternative universities listed
    - Score < 200         → fail with study recommendations
    """
    return await ExamService(db).get_jamb_result(attempt_id, user.id)




@router.post("/post-utme/start")
async def start_post_utme(
    payload: StartPOSTUTMERequest,
    user=Depends(get_current_student),
    db:  AsyncSession = Depends(get_db),
):
    """Start POST-UTME for selected university/course."""
    return await ExamService(db).start_post_utme(user.id, payload.university_id, payload.course_id)


@router.post("/post-utme/{attempt_id}/submit", response_model=ExamAttemptResponse)
async def submit_post_utme(
    attempt_id: int,
    payload:    SubmitExamRequest,
    user=Depends(get_current_student),
    db:  AsyncSession = Depends(get_db),
):
    """Submit POST-UTME answers."""
    return await ExamService(db).submit_post_utme(attempt_id, user.id, payload)


@router.get("/post-utme/results/{attempt_id}", response_model=PostUTMEResultResponse)
async def post_utme_results(
    attempt_id: int,
    user=Depends(get_current_student),
    db:  AsyncSession = Depends(get_db),
):
    """
    POST-UTME result:
    - PASS → ADMITTED! (with simulated matric number)
    - FAIL → alternatives + recommendations
    """
    return await ExamService(db).get_post_utme_result(attempt_id, user.id)



@router.get("/history", response_model=List[ExamAttemptResponse])
async def exam_history(
    user=Depends(get_current_student),
    db:  AsyncSession = Depends(get_db),
):
    """All exam attempts for the current student."""
    return await ExamService(db).get_exam_history(user.id)

from app.modules.exams.model import ExamAttempt


async def _get_waec_results_helper(attempt_id: int, user_id: int, db: AsyncSession) -> ExamAttempt:
   
    from sqlalchemy import select
    result = await db.execute(
        select(ExamAttempt).where(
            ExamAttempt.id == attempt_id,
            ExamAttempt.student_id == user_id,
        )
    )
    a = result.scalars().first()
    if not a:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Attempt not found")
    return a
