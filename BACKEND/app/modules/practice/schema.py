from pydantic import BaseModel
from typing import List, Optional


class PracticeAnswerItem(BaseModel):
    question_id:     int
    selected_answer: Optional[str] = None   


class SubmitPracticeRequest(BaseModel):
    answers: List[PracticeAnswerItem]


class StartPracticeRequest(BaseModel):
    subject_id:    int
    topic_id:      Optional[int] = None
    num_questions: int = 10


class AnswerFeedback(BaseModel):
    """Full per-question feedback returned after practice submission."""
    question_id:    int
    question_text:  str         
    option_a:       str     
    option_b:       str
    option_c:       str
    option_d:       str
    is_correct:     bool
    your_answer:    Optional[str]
    correct_answer: str     
    correct_text:   str      
    explanation:    Optional[str]
    topic:          Optional[str] 


class PracticeResultResponse(BaseModel):
    session_id:      int
    subject_id:      Optional[int] = None  
    correct_count:   int
    total:           int
    percentage:      float
    answer_feedback: List[AnswerFeedback]
    

class PracticeSessionResponse(BaseModel):
    id:              int
    subject_id:      Optional[int]
    topic_id:        Optional[int]
    total_questions: int
    correct_count:   int
    percentage:      Optional[float]
    status:          str

    class Config:
        from_attributes = True


class RecommendedPractice(BaseModel):
    subject_id:   int
    subject_name: str
    topic_id:     Optional[int]
    topic_name:   Optional[str]
    reason:       str

