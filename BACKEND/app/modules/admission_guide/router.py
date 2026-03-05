from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database              import get_db
from app.core.dependencies          import get_current_student
from app.modules.admission_guide.schemas import AdmissionGuideRequest, AdmissionVerdict
from app.modules.admission_guide.service import analyze_admission

router = APIRouter()


WAEC_SUBJECTS = [
    "English Language", "Mathematics", "Physics", "Chemistry", "Biology",
    "Agricultural Science", "Economics", "Government", "Literature in English",
    "Geography", "Further Mathematics", "Technical Drawing", "Commerce",
    "Accounting", "Civic Education", "Computer Studies", "Food and Nutrition",
    "Fine Arts", "Music", "French", "Yoruba", "Igbo", "Hausa",
    "Christian Religious Studies", "Islamic Religious Studies",
    "Health Education", "Physical Education",
]


@router.get("/subjects")
async def get_waec_subjects():
    """
    Returns the list of WAEC subjects for the Step 1 dropdown.
    Used by AdmissionGuidePage.jsx to populate subject selectors.
    """
    return {"subjects": WAEC_SUBJECTS}


@router.post("/analyze", response_model=AdmissionVerdict)
async def analyze(
    payload: AdmissionGuideRequest,
    user=Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
):
    """
    Step 4 — AI Admission Analysis.
    Receives WAEC grades, JAMB score, university/course, and optional Post-UTME score.
    Returns: AI verdict (HIGHLY LIKELY / LIKELY / UNLIKELY), explanation, recommendations.
    """
    return await analyze_admission(user.id, payload, db)

