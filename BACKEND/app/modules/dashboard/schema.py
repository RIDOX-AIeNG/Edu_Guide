from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class WAECSubjectSummary(BaseModel):
    """Per-subject summary shown in the WAEC detail breakdown."""
    subject_name: str
    grade:        Optional[str]  
    percentage:   Optional[float]
    is_credit:    bool   
    is_taken:     bool   


class AdmissionReadiness(BaseModel):
    """
    Powers the 3 status cards at the top of the dashboard.
    waec_status:     'not_started' | 'in_progress' | 'passed' | 'failed'
    jamb_status:     'locked' | 'pending' | 'passed' | 'failed'
    post_utme_status:'locked' | 'pending' | 'passed' | 'admitted'
    """
    waec_status:       str
    waec_display:      str       
    waec_color:        str   
    jamb_status:       str
    jamb_display:      str    
    jamb_color:        str
    post_utme_status:  str
    post_utme_display: str     
    post_utme_color:   str

 
    waec_subjects:     List[WAECSubjectSummary]
    waec_credits:      int     
    waec_credits_needed: int = 5  


    next_action:       str      
    cta_label:         str      
    cta_route:         str   


class LiveUniversityUpdate(BaseModel):
    """One entry in the Live Updates panel (right sidebar)."""
    university_name:  str
    short_name:       str
    status:           str      
    status_label:     str    
    message:          str     
    deadline:         Optional[str] 


class StudentDashboard(BaseModel):
    """Complete dashboard payload — matches the screenshot layout."""
    student_name:      str
    class_level:       Optional[str]
    journey_stage:     str

   
    admission_readiness: AdmissionReadiness

  
    live_updates: List[LiveUniversityUpdate]

  
    has_admission_guide: bool 
    quick_stats: Dict[str, Any] 




class SubjectStat(BaseModel):
    subject_name:   str
    exam_type:      str   
    attempts:       int
    best_score:     float 
    avg_score:      float
    latest_grade:   Optional[str] 
    is_improving:   bool   


class WeakTopicStat(BaseModel):
    topic_name:  str
    subject:     str
    frequency:   int    


class ExamHistoryItem(BaseModel):
    id:           int
    exam_type:    str
    subject:      Optional[str]
    score:        Optional[float]
    percentage:   Optional[float]
    grade:        Optional[str]
    passed:       Optional[bool]
    attempted_at: datetime


class StudentAnalytics(BaseModel):
    """Full analytics payload for the Analytics page."""

    total_exams:        int
    total_practice:     int
    waec_credits:       int
    best_jamb_score:    Optional[int]
    overall_pass_rate:  float 
    study_streak:       int     

 
    subject_stats:      List[SubjectStat]

 
    weak_topics:        List[WeakTopicStat]

  
    score_trend:        List[Dict[str, Any]] 
    waec_subject_chart: List[Dict[str, Any]]  

 
    recent_exams:       List[ExamHistoryItem]
