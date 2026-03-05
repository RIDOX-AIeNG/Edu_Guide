from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime


class CourseResponse(BaseModel):
    id:               int
    university_id:    int
    name:             str
    code:             Optional[str]
    faculty:          Optional[str]
    department:       Optional[str]
    jamb_subjects:    Optional[List[str]]
    waec_subjects:    Optional[Dict[str, str]]
    jamb_cutoff:      Optional[int]
    post_utme_cutoff: Optional[int]
    description:      Optional[str]

    class Config:
        from_attributes = True


class UniversityListResponse(BaseModel):
    id:          int
    name:        str
    short_name:  Optional[str]
    state:       Optional[str]
    type:        Optional[str]
    jamb_cutoff: Optional[int]

    class Config:
        from_attributes = True


class UniversityDetailResponse(UniversityListResponse):
    description: Optional[str]
    website:     Optional[str]
    courses:     List[CourseResponse] = []

    class Config:
        from_attributes = True


class CutoffMarkResponse(BaseModel):
    id:              int
    year:            int
    jamb_score:      int
    post_utme_score: Optional[int]
    aggregate_score: Optional[float]
    notes:           Optional[str]

    class Config:
        from_attributes = True


class RecommendRequest(BaseModel):
    jamb_score:      int
    course_interest: Optional[str] = None 


class RecommendedOption(BaseModel):
    university_id:   int
    university_name: str
    short_name:      Optional[str]
    state:           Optional[str]
    course_id:       int
    course_name:     str
    jamb_cutoff:     int
    score_above_cutoff: int    
    jamb_subjects:   Optional[List[str]]


class SelectUniversityRequest(BaseModel):
    university_id: int
    course_id:     int

