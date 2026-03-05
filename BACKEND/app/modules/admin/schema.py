from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class BulkImportRequest(BaseModel):
    questions: List[Dict[str, Any]]


class SeedCareerRequest(BaseModel):
    responses: Optional[List[Dict[str, Any]]] = None


class SeedResult(BaseModel):
    status:  str
    details: Dict[str, Any]


class AdmissionUpdateRequest(BaseModel):
    message: str


class AdmissionUpdateResponse(BaseModel):
    status: str
    id: Optional[int] = None
    message: Optional[str] = None


class UniversityNewsRequest(BaseModel):
    university_id: int
    message: str
    status: str      
    status_label: str  
    deadline: Optional[str] = None


class UniversityNewsResponse(BaseModel):
    status: str
    id: int
    university_id: int
    message: str
    status_label: str
    deadline: Optional[str]

