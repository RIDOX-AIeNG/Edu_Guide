"""
Core seeding functions used by admin endpoints.
Can also be called directly from scripts.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.modules.question.model   import Subject, Topic, Question
from app.modules.universities.model import University, Course
from app.modules.admin.seeder_data  import UNIVERSITIES_DATA, SAMPLE_QUESTIONS
from app.modules.question.service  import QuestionService


async def seed_universities(db: AsyncSession) -> dict:
    """Seed universities + courses. Skips duplicates."""
    created_unis    = 0
    created_courses = 0
    skipped         = 0

    for uni_data in UNIVERSITIES_DATA:
        existing = (await db.execute(
            select(University).where(University.short_name == uni_data["short_name"])
        )).scalars().first()

        if existing:
            skipped += 1
            uni = existing
        else:
            uni = University(
                name=uni_data["name"],
                short_name=uni_data["short_name"],
                state=uni_data["state"],
                type=uni_data["type"],
                jamb_cutoff=uni_data["jamb_cutoff"],
                description=uni_data.get("description"),
            )
            db.add(uni)
            await db.flush()
            created_unis += 1

        for course_data in uni_data.get("courses", []):
            existing_course = (await db.execute(
                select(Course).where(
                    Course.university_id == uni.id,
                    Course.name          == course_data["name"],
                )
            )).scalars().first()
            if not existing_course:
                course = Course(
                    university_id=uni.id,
                    name=course_data["name"],
                    code=course_data.get("code"),
                    faculty=course_data.get("faculty"),
                    jamb_cutoff=course_data.get("jamb_cutoff"),
                    post_utme_cutoff=course_data.get("post_utme_cutoff"),
                    jamb_subjects=course_data.get("jamb_subjects"),
                    waec_subjects=course_data.get("waec_subjects"),
                )
                db.add(course)
                created_courses += 1

    await db.commit()
    return {
        "universities_created": created_unis,
        "universities_skipped": skipped,
        "courses_created":      created_courses,
    }


async def seed_questions(db: AsyncSession, questions: list = None) -> dict:
    """
    Seed questions. If questions=None, uses SAMPLE_QUESTIONS.
    Accepts any list of dicts with the BulkImportQuestion shape.
    """
    if questions is None:
        questions = SAMPLE_QUESTIONS

    qs_svc = QuestionService(db)
    created = 0
    skipped = 0

    for q_data in questions:
        subj = await qs_svc.get_or_create_subject(q_data["subject"])
        topic = None
        if q_data.get("topic"):
            topic = await qs_svc.get_or_create_topic(q_data["topic"], subj.id)

        existing = (await db.execute(
            select(Question).where(
                Question.question_text == q_data["question_text"],
                Question.subject_id    == subj.id,
            )
        )).scalars().first()

        if existing:
            skipped += 1
            continue

        question = Question(
            subject_id=subj.id,
            topic_id=topic.id if topic else None,
            question_text=q_data["question_text"],
            option_a=q_data["option_a"],
            option_b=q_data["option_b"],
            option_c=q_data["option_c"],
            option_d=q_data["option_d"],
            correct_answer=q_data["correct_answer"].upper(),
            explanation=q_data.get("explanation"),
            exam_type=q_data["exam_type"],
            difficulty=q_data.get("difficulty", "medium"),
            year=q_data.get("year"),
            is_verified=True,  
            is_active=True,
        )
        db.add(question)
        created += 1

    await db.commit()
    return {"questions_created": created, "questions_skipped": skipped}


async def seed_career_responses(db: AsyncSession, responses: list = None) -> dict:
    """
    Seed career assessment responses.
    Creates a placeholder system user (id=1 if not exists) to own the assessment.
    """
    
    try:
        from app.modules.admin.seeder_data import CAREER_ASSESSMENT_RESPONSES as R
        responses = R
    except ImportError:
            responses = []

    return {"responses_available": len(responses), "note": "Use POST /advisor/career-assessment to process"}

