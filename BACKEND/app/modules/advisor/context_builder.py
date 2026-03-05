from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from app.modules.auth.model     import User
from app.modules.exams.model    import ExamAttempt
from app.shared.enums            import AttemptStatus
from app.shared.grading          import get_waec_grade


async def build_student_context(user_id: int, db: AsyncSession) -> dict:
    from app.modules.auth.model       import User
    from app.modules.exams.model      import ExamAttempt
    from app.modules.practice.model   import PracticeSession
    from app.modules.question.model  import Subject
    from app.shared.grading            import get_waec_grade
    from app.shared.enums              import AttemptStatus
    from app.modules.universities.model import University, Course

    user = (await db.execute(select(User).where(User.id == user_id))).scalars().first()
    if not user:
        return {}

    ctx: dict = {
        "student_name":     user.full_name,
        "class_level":      user.class_level if user.class_level else "Unknown",
        "journey_stage":    user.journey_stage if user.journey_stage else "onboarding",
        "career_interests": user.career_interests or "Not specified",
    }

    waec_attempts = (await db.execute(
        select(ExamAttempt).where(
            ExamAttempt.student_id == user_id,
            ExamAttempt.exam_type  == "waec",
            ExamAttempt.status     == AttemptStatus.completed.value,
        )
    )).scalars().all()
    best_waec: dict = {}
    for a in waec_attempts:
        sid = a.subject_id
        if sid and (sid not in best_waec or (a.percentage or 0) > best_waec[sid]["pct"]):
            subj = (await db.execute(select(Subject).where(Subject.id == sid))).scalars().first()
            best_waec[sid] = {
                "subject": subj.name if subj else f"Subject {sid}",
                "pct":     round(a.percentage or 0, 1),
                "grade":   get_waec_grade(a.percentage or 0),
            }
    ctx["waec_results"]      = list(best_waec.values())
    ctx["waec_credits"]      = sum(1 for v in best_waec.values() if v["grade"] in ('A1','B2','B3','C4','C5','C6'))
    ctx["waec_total_taken"]  = len(waec_attempts)

   
    jamb_attempts = (await db.execute(
        select(ExamAttempt).where(
            ExamAttempt.student_id == user_id,
            ExamAttempt.exam_type  == "jamb",
            ExamAttempt.status     == AttemptStatus.completed.value,
        ).order_by(ExamAttempt.score.desc())
    )).scalars().all()
    
    ctx["jamb_attempts"]  = len(jamb_attempts)
    ctx["jamb_best"]      = jamb_attempts[0].score if jamb_attempts else None
    ctx["jamb_passed"]    = jamb_attempts[0].passed if jamb_attempts else False
    ctx["jamb_weak_topics"] = jamb_attempts[0].weak_topics if jamb_attempts else []

   
    practice_sessions = (await db.execute(
        select(PracticeSession).where(
            PracticeSession.student_id == user_id,
            PracticeSession.status     == "completed",
        ).order_by(PracticeSession.started_at.desc())
    )).scalars().all()

    ctx["practice_sessions_total"] = len(practice_sessions)
    ctx["practice_avg_score"]      = (
        round(sum(s.percentage or 0 for s in practice_sessions) / len(practice_sessions), 1)
        if practice_sessions else None
    )


    practice_by_subject: dict = {}
    for ps in practice_sessions:
        sid = ps.subject_id
        if not sid:
            continue
        if sid not in practice_by_subject:
            subj = (await db.execute(select(Subject).where(Subject.id == sid))).scalars().first()
            practice_by_subject[sid] = {
                "subject": subj.name if subj else f"Subject {sid}",
                "sessions": 0, "scores": []
            }
        practice_by_subject[sid]["sessions"] += 1
        if ps.percentage is not None:
            practice_by_subject[sid]["scores"].append(ps.percentage)

    ctx["practice_by_subject"] = [
        {
            "subject":    v["subject"],
            "sessions":   v["sessions"],
            "avg_score":  round(sum(v["scores"]) / len(v["scores"]), 1) if v["scores"] else None,
        }
        for v in practice_by_subject.values()
    ]

    
    all_exams = (await db.execute(
        select(ExamAttempt).where(
            ExamAttempt.student_id == user_id,
            ExamAttempt.status     == AttemptStatus.completed.value,
        ).order_by(ExamAttempt.started_at.desc()).limit(5)
    )).scalars().all()

    all_weak = []
    for a in all_exams:
        if a.weak_topics:
            all_weak.extend(a.weak_topics)
   
    from collections import Counter
    weak_counts    = Counter(all_weak)
    ctx["top_weak_topics"] = [t for t, _ in weak_counts.most_common(8)]

    ctx["selected_university"] = None
    ctx["selected_course"]     = None
    if user.selected_university_id:
        uni = (await db.execute(select(University).where(University.id == user.selected_university_id))).scalars().first()
        ctx["selected_university"] = uni.name if uni else None
    if user.selected_course_id:
        crs = (await db.execute(select(Course).where(Course.id == user.selected_course_id))).scalars().first()
        ctx["selected_course"] = crs.name if crs else None

    return ctx


def build_system_prompt(student_ctx: dict, advisor_context: str = "general") -> str:
    name     = student_ctx.get("student_name",   "Student")
    level    = student_ctx.get("class_level",     "Unknown")
    stage    = student_ctx.get("journey_stage",   "onboarding")
    interests= student_ctx.get("career_interests","Not specified")

    waec_lines = "\n".join(
        f"  • {w['subject']}: {w['grade']} ({w['pct']}%)"
        for w in student_ctx.get("waec_results", [])
    ) or "  No WAEC results yet"

    practice_lines = "\n".join(
        f"  • {p['subject']}: {p['sessions']} sessions, avg {p['avg_score']}%"
        for p in student_ctx.get("practice_by_subject", [])
    ) or "  No practice sessions yet"

    weak_topics = ", ".join(student_ctx.get("top_weak_topics", [])) or "None identified yet"

    jamb_info = (
        f"Best score: {student_ctx.get('jamb_best')} "
        f"({'passed' if student_ctx.get('jamb_passed') else 'not passed'})"
        if student_ctx.get("jamb_best")
        else "Not taken yet"
    )

    uni  = student_ctx.get("selected_university") or "Not selected"
    crs  = student_ctx.get("selected_course")     or "Not selected"

    return f"""You are EduGuide AI, a Nigerian university admission advisor helping {name}.

STUDENT PROFILE:
  Name: {name} | Level: {level} | Stage: {stage}
  Career Interests: {interests}
  Target University: {uni}
  Target Course: {crs}

WAEC RESULTS ({student_ctx.get('waec_credits', 0)} credits, {student_ctx.get('waec_total_taken', 0)} exams taken):
{waec_lines}

JAMB: {jamb_info}
JAMB attempts: {student_ctx.get('jamb_attempts', 0)}

PRACTICE ANALYTICS ({student_ctx.get('practice_sessions_total', 0)} sessions, avg {student_ctx.get('practice_avg_score', 'N/A')}%):
{practice_lines}

TOP WEAK TOPICS (needs most work): {weak_topics}

ADVISOR ROLE: {advisor_context}

Use this data to give specific, personalised advice. Reference their actual scores and weak topics.
Do not make up data — only reference what is shown above. Be encouraging but honest.
Always align advice with Nigerian university admission requirements (JAMB, WAEC, Post-UTME).
"""



