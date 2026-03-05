from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class SubjectResponse(BaseModel):
    id:          int
    name:        str
    code:        Optional[str]
    category:    Optional[str]
    description: Optional[str]

    class Config:
        from_attributes = True


class TopicResponse(BaseModel):
    id:          int
    subject_id:  int
    name:        str
    description: Optional[str]
    order_index: int

    class Config:
        from_attributes = True


class QuestionResponse(BaseModel):
    """Sent to student during exam — correct_answer intentionally omitted."""
    id:            int
    subject_id:    int
    topic_id:      Optional[int]
    question_text: str
    option_a:      str
    option_b:      str
    option_c:      str
    option_d:      str
    difficulty:    Optional[str]
    year:          Optional[int]
    image_url:     Optional[str]

    class Config:
        from_attributes = True


class QuestionWithAnswer(QuestionResponse):
    """Sent after exam submission (review) — includes correct answer."""
    correct_answer: str
    explanation:    Optional[str]


class BulkImportQuestion(BaseModel):
    """Shape of each question in a bulk JSON import."""
    subject:        str
    topic:          Optional[str]
    question_text:  str
    option_a:       str
    option_b:       str
    option_c:       str
    option_d:       str
    correct_answer: str  
    explanation:    Optional[str]
    exam_type:      str  
    difficulty:     Optional[str] = "medium"
    year:           Optional[int] = None


class BulkImportRequest(BaseModel):
    questions: List[BulkImportQuestion]
