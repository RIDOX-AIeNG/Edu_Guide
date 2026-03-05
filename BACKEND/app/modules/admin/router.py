import io
import csv
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.dependencies import require_admin_key
from app.modules.admin.schema  import BulkImportRequest, SeedCareerRequest, SeedResult, AdmissionUpdateRequest, AdmissionUpdateResponse, UniversityNewsRequest, UniversityNewsResponse
from app.modules.admin.seeder   import seed_universities, seed_questions, seed_career_responses

router = APIRouter()


@router.post("/seed/all", response_model=SeedResult)
async def seed_everything(
    _=Depends(require_admin_key),
    db: AsyncSession = Depends(get_db),
):
    """
    Seed the complete database:
    1. Universities + courses
    2. Sample questions (marked is_verified=True)

    Call this once after running Alembic migrations.
    Add X-Admin-Key header.
    """
    uni_result = await seed_universities(db)
    q_result   = await seed_questions(db)
    return SeedResult(
        status="success",
        details={"universities": uni_result, "questions": q_result},
    )


@router.post("/seed/universities", response_model=SeedResult)
async def seed_unis(
    _=Depends(require_admin_key),
    db: AsyncSession = Depends(get_db),
):
    """Seed universities and courses only."""
    result = await seed_universities(db)
    return SeedResult(status="success", details=result)


@router.post("/seed/questions", response_model=SeedResult)
async def seed_sample_questions(
    _=Depends(require_admin_key),
    db: AsyncSession = Depends(get_db),
):
    """Seed built-in sample questions."""
    result = await seed_questions(db)
    return SeedResult(status="success", details=result)


@router.post("/questions/bulk-import", response_model=SeedResult)
async def bulk_import_json(
    payload: BulkImportRequest,
    _=Depends(require_admin_key),
    db: AsyncSession = Depends(get_db),
):
    """
    Import questions from a JSON array.
    Each question object must have:
      subject, topic (optional), question_text, option_a-d,
      correct_answer (A/B/C/D), explanation (optional),
      exam_type (waec|jamb|post_utme|practice),
      difficulty (easy|medium|hard), year (optional)
    """
    result = await seed_questions(db, [q.model_dump() if hasattr(q, 'model_dump') else q
                                       for q in payload.questions])
    return SeedResult(status="success", details=result)


@router.post("/questions/upload-csv", response_model=SeedResult)
async def upload_csv(
    file: UploadFile = File(...),
    _=Depends(require_admin_key),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload a CSV file of questions.

    Required CSV columns:
      subject, topic, question_text, option_a, option_b, option_c, option_d,
      correct_answer, explanation, exam_type, difficulty, year

    Example row:
      Mathematics,Algebra,"Solve 2x+5=15","x=5","x=10","x=7","x=3",A,
      "Subtract 5: 2x=10, divide by 2: x=5",waec,easy,2024
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a .csv")

    contents = await file.read()
    text     = contents.decode("utf-8")
    reader   = csv.DictReader(io.StringIO(text))
    questions = []

    required_cols = {
        "subject", "question_text", "option_a", "option_b",
        "option_c", "option_d", "correct_answer", "exam_type",
    }

    for i, row in enumerate(reader):
        if i == 0:
            missing = required_cols - set(row.keys())
            if missing:
                raise HTTPException(
                    status_code=422,
                    detail=f"CSV missing required columns: {', '.join(missing)}"
                )
        questions.append({
            "subject":        row.get("subject", "").strip(),
            "topic":          row.get("topic", "").strip() or None,
            "question_text":  row.get("question_text", "").strip(),
            "option_a":       row.get("option_a", "").strip(),
            "option_b":       row.get("option_b", "").strip(),
            "option_c":       row.get("option_c", "").strip(),
            "option_d":       row.get("option_d", "").strip(),
            "correct_answer": row.get("correct_answer", "").strip().upper(),
            "explanation":    row.get("explanation", "").strip() or None,
            "exam_type":      row.get("exam_type", "waec").strip().lower(),
            "difficulty":     row.get("difficulty", "medium").strip().lower() or "medium",
            "year":           int(row["year"]) if row.get("year", "").strip().isdigit() else None,
        })

    result = await seed_questions(db, questions)
    return SeedResult(status="success", details={**result, "rows_parsed": len(questions)})


@router.post("/career-assessment/seed", response_model=SeedResult)
async def seed_career(
    payload: SeedCareerRequest,
    _=Depends(require_admin_key),
    db: AsyncSession = Depends(get_db),
):
    """
    Seed career assessment responses.
    Pass responses in the payload or leave empty to use built-in sample data.
    """
    result = await seed_career_responses(db, payload.responses)
    return SeedResult(status="success", details=result)


@router.get("/admission-update", response_model=AdmissionUpdateResponse)
async def fetch_admission_update(
    _=Depends(require_admin_key),
    db: AsyncSession = Depends(get_db),
):
    """Return the latest global admission update notice (if any)."""
    from app.modules.dashboard.model import AdmissionUpdate
    from sqlalchemy import select

    q = select(AdmissionUpdate).order_by(AdmissionUpdate.created_at.desc()).limit(1)
    result = await db.execute(q)
    upd: AdmissionUpdate | None = result.scalar_one_or_none()
    if upd:
        return {"status": "success", "id": upd.id, "message": upd.message}
    return {"status": "success", "message": None}


@router.post("/admission-update", response_model=AdmissionUpdateResponse)
async def create_admission_update(
    payload: AdmissionUpdateRequest,
    _=Depends(require_admin_key),
    db: AsyncSession = Depends(get_db),
):
    """Create a new global admission update notice."""
    from app.modules.dashboard.model import AdmissionUpdate

    upd = AdmissionUpdate(message=payload.message)
    db.add(upd)
    await db.commit()
    await db.refresh(upd)
    return {"status": "success", "id": upd.id, "message": upd.message}


@router.post("/news", response_model=UniversityNewsResponse)
async def create_or_update_news(
    payload: UniversityNewsRequest,
    _=Depends(require_admin_key),
    db: AsyncSession = Depends(get_db),
):
    """
    Create or update live university news.
    Admin can quickly update admission status without restarting server.
    """
    from app.modules.universities.model import UniversityNews, University

   
    uni = (await db.execute(
        select(University).where(University.id == payload.university_id)
    )).scalars().first()
    
    if not uni:
        raise HTTPException(status_code=404, detail="University not found")

   
    existing = (await db.execute(
        select(UniversityNews).where(UniversityNews.university_id == payload.university_id)
    )).scalars().first()

    if existing:
        existing.message = payload.message
        existing.status = payload.status
        existing.status_label = payload.status_label
        existing.deadline = payload.deadline
        await db.commit()
        await db.refresh(existing)
        news = existing
    else:
        news = UniversityNews(
            university_id=payload.university_id,
            message=payload.message,
            status=payload.status,
            status_label=payload.status_label,
            deadline=payload.deadline,
            is_active=True,
        )
        db.add(news)
        await db.commit()
        await db.refresh(news)

    return {
        "status": "success",
        "id": news.id,
        "university_id": news.university_id,
        "message": news.message,
        "status_label": news.status_label,
        "deadline": news.deadline,
    }

