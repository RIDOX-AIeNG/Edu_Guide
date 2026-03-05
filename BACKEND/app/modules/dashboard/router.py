from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database     import get_db
from app.core.dependencies import get_current_student
from app.modules.dashboard.schema import StudentDashboard
from app.modules.dashboard.service import DashboardService
from app.modules.dashboard.schema import StudentAnalytics


router = APIRouter()


@router.get("/dashboard", response_model=StudentDashboard)
async def get_dashboard(
    user=Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
):
    """
    Full dashboard matching the EduGuide screenshot design.

    Returns:
    - admission_readiness:  3 status cards (WAEC / JAMB / POST-UTME)
    - live_updates:         Right panel university news
    - has_admission_guide:  Whether to show "Admission Guide" card
    - quick_stats:          Counters for exams + practice

    Phase gate logic:
      No WAEC attempts        → WAEC = "Not Started", JAMB locked, POST-UTME locked
      WAEC taken, <5 credits  → WAEC = "X/5 Credits" (amber), JAMB locked
      WAEC passed (5 credits) → WAEC = "75%" (green), JAMB = "Pending"
      JAMB passed + meets cutoff → JAMB = "240/400" (green), POST-UTME = "Pending"
      POST-UTME passed        → POST-UTME = "Admitted!" (green)
    """
    return await DashboardService(db).get_dashboard(user.id)


@router.get("/analytics", response_model=StudentAnalytics)
async def get_analytics(
    user=Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
):
    """
    Full analytics page data:
    - Summary cards (total exams, credits, JAMB score, pass rate)
    - Per-subject performance stats
    - Top weak topics
    - Score trend chart data
    - WAEC subject chart data
    - Recent exam history table
    """
    return await DashboardService(db).get_analytics(user.id)
