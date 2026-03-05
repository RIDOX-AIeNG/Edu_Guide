from pydantic import BaseModel
from typing import List, Optional


class WAECEntry(BaseModel):
    subject: str
    grade:   str   


class AdmissionGuideRequest(BaseModel):
    waec_results:      List[WAECEntry]         
    jamb_score:        int                      
    university_id:     Optional[int] = None      
    course_id:         Optional[int] = None     
    post_utme_score:   Optional[float] = None   


class AdmissionVerdict(BaseModel):
    status:             str    
    status_color:       str   
    target_label:       str   
    ai_explanation:     str   
    waec_credits:       int
    waec_passed:        bool
    jamb_meets_cutoff:  bool
    jamb_cutoff:        Optional[int]
    recommendations:    List[str]  
