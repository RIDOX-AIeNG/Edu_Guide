from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class ChatRequest(BaseModel):
    message:  str
    context:  Optional[str] = "general"   
    conversation_id: Optional[int] = None 


class ChatResponse(BaseModel):
    conversation_id: int
    message_id:      int
    response:        str
    context_used:    Optional[Dict[str, Any]] = None


class AnalyzePerformanceRequest(BaseModel):
    attempt_id: int


class ConversationListResponse(BaseModel):
    id:         int
    title:      Optional[str]
    context:    Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    id:         int
    role:       str
    content:    str
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationDetailResponse(BaseModel):
    id:       int
    title:    Optional[str]
    context:  Optional[str]
    messages: List[MessageResponse]

    class Config:
        from_attributes = True


class CareerAssessmentRequest(BaseModel):
    """
    Submit the 50-response career survey.
    Each response is a dict with keys like:
      study_hours, last_exam_score, subjects_confidence, math_interest,
      science_interest, arts_interest, business_interest, helping_others, etc.
    """
    responses: List[Dict[str, Any]]


class CareerAssessmentResponse(BaseModel):
    assessment_id:        int
    recommended_careers:  List[str]
    recommended_courses:  List[Dict]
    waec_subjects_needed: List[str]
    jamb_subjects_needed: List[str]
    summary:              str

