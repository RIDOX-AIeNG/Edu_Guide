from fastapi import APIRouter, Depends, Request
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_student
from app.modules.advisor.schema import (
    ChatRequest, ChatResponse,
    AnalyzePerformanceRequest,
    ConversationListResponse, ConversationDetailResponse,
    CareerAssessmentRequest, CareerAssessmentResponse,
    MessageResponse,
)
from app.modules.advisor.service import AdvisorService
from app.core.rate_limit import limiter

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
@limiter.limit("30/minute")
async def chat(request: Request, 
    payload: ChatRequest,
    user=Depends(get_current_student),
    db:  AsyncSession = Depends(get_db),
):
    """
    Main unified AI advisor chat.

    Context values:
    - "general"     — any question
    - "career"      — career exploration & guidance
    - "exam_prep"   — study strategies & exam tips
    - "performance" — post-exam analysis

    Pass `conversation_id` to continue an existing conversation.
    Omit it to start a new one.
    """
    return await AdvisorService(db).chat(
        user_id=user.id,
        message=payload.message,
        context=payload.context or "general",
        conversation_id=payload.conversation_id,
    )


@router.post("/analyze/{attempt_id}", response_model=ChatResponse)
async def analyze_performance(
    attempt_id: int,
    user=Depends(get_current_student),
    db:  AsyncSession = Depends(get_db),
):
    """
    AI analyses a specific exam attempt.
    Returns: score interpretation + targeted improvement plan.
    Used after WAEC/JAMB/POST-UTME submission.
    """
    return await AdvisorService(db).analyze_performance(user.id, attempt_id)


@router.get("/history", response_model=List[ConversationListResponse])
async def conversation_history(
    user=Depends(get_current_student),
    db:  AsyncSession = Depends(get_db),
):
    """List all conversations for the current user."""
    return await AdvisorService(db).list_conversations(user.id)


@router.get("/history/{conversation_id}", response_model=ConversationDetailResponse)
async def get_conversation(
    conversation_id: int,
    user=Depends(get_current_student),
    db:  AsyncSession = Depends(get_db),
):
    """Get all messages in a specific conversation."""
    conv = await AdvisorService(db).get_conversation(user.id, conversation_id)
    return conv


@router.delete("/history/{conversation_id}", status_code=200)
async def delete_conversation(
    conversation_id: int,
    user=Depends(get_current_student),
    db:  AsyncSession = Depends(get_db),
):
    """Soft-delete a conversation."""
    await AdvisorService(db).delete_conversation(user.id, conversation_id)
    return {"message": "Conversation deleted"}


@router.post("/career-assessment", response_model=CareerAssessmentResponse)
async def submit_career_assessment(
    payload: CareerAssessmentRequest,
    user=Depends(get_current_student),
    db:  AsyncSession = Depends(get_db),
):
    """
    Submit the 50-response career survey.
    AI processes responses and returns:
    - Recommended career paths
    - University course recommendations
    - Required WAEC & JAMB subjects
    - Personalised summary

    Payload format:
    {
      "responses": [
        {"study_hours": 3, "math_interest": 8, "science_interest": 9, ...},
        ... (up to 50 response objects)
      ]
    }
    """
    return await AdvisorService(db).submit_career_assessment(
        user.id, payload.responses
    )


@router.get("/career-assessment", response_model=Optional[CareerAssessmentResponse])
async def get_career_assessment(
    user=Depends(get_current_student),
    db:  AsyncSession = Depends(get_db),
):
    """Get the student's existing career assessment result (if any)."""
    return await AdvisorService(db).get_career_assessment(user.id)

