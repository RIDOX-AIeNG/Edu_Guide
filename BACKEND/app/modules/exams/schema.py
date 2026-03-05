from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class StartWAECRequest(BaseModel):
    subject_id: int


class StartJAMBRequest(BaseModel):
    university_id: int
    course_id:     int


class StartPOSTUTMERequest(BaseModel):
    university_id: int
    course_id:     int


class AnswerItem(BaseModel):
    question_id:        int
    selected_answer:    Optional[str] = None  
    time_spent_seconds: Optional[int] = None


class SubmitExamRequest(BaseModel):
    answers: List[AnswerItem]


class ExamAttemptResponse(BaseModel):
    id:              int
    exam_type:       str
    subject_id:      Optional[int]
    university_id:   Optional[int]
    course_id:       Optional[int]
    status:          str
    total_questions: Optional[int]
    correct_answers: Optional[int]
    score:           Optional[int]
    percentage:      Optional[float]
    passed:          Optional[bool]
    grade:           Optional[str]
    topic_scores:    Optional[Dict[str, Any]]
    weak_topics:     Optional[List[str]]
    ai_feedback:     Optional[str]
    started_at:      datetime
    completed_at:    Optional[datetime]

    class Config:
        from_attributes = True


class WAECSubjectResult(BaseModel):
    subject_id:   int
    subject_name: str
    grade:        str
    percentage:   float
    is_credit:    bool


class WAECOverallResult(BaseModel):
    """Returned by GET /exams/waec/overall — the phase gate check."""
    passed:           bool 
    total_credits:    int
    has_english:      bool
    has_mathematics:  bool
    subject_results:  List[WAECSubjectResult]
    can_proceed_jamb: bool
    message:          str


class JAMBResultResponse(BaseModel):
    attempt_id:            int
    jamb_score:            int
    percentage:            float
    passed:                bool
    university_cutoff:     Optional[int]
    meets_cutoff:          bool
    can_proceed_post_utme: bool
    topic_breakdown:       Optional[Dict[str, Any]]
    weak_topics:           Optional[List[str]]
    alternative_universities: List[Dict] 
    message:               str


class PostUTMEResultResponse(BaseModel):
    attempt_id:      int
    percentage:      float
    passed:          bool
    admitted:        bool
    university_name: Optional[str]
    course_name:     Optional[str]
    matric_number:   Optional[str]  
    message:         str
    alternatives:    List[Dict]


class AvailableExamsResponse(BaseModel):
    journey_stage:       str
    waec_available:      bool
    waec_status:         str 
    waec_credits:        int
    jamb_available:      bool
    jamb_status:         str
    post_utme_available: bool
    post_utme_status:    str
    selected_university: Optional[str]
    selected_course:     Optional[str]
