from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException

from app.modules.admission_guide.schemas import AdmissionGuideRequest, AdmissionVerdict
from app.modules.universities.model     import University, Course
from app.modules.advisor.ai_client       import call_ai

CREDIT_GRADES = {"A1", "B2", "B3", "C4", "C5", "C6"}


async def analyze_admission(
    user_id: int,
    payload: AdmissionGuideRequest,
    db: AsyncSession,
) -> AdmissionVerdict:

  
    uni    = None
    course = None
    if payload.university_id:
        uni = (await db.execute(select(University).where(University.id == payload.university_id))).scalars().first()
    if payload.course_id:
        course = (await db.execute(select(Course).where(Course.id == payload.course_id))).scalars().first()

    if not uni or not course:
        raise HTTPException(status_code=404, detail="University or course not found")

 
    credits      = sum(1 for w in payload.waec_results if w.grade in CREDIT_GRADES)
    has_english  = any("english" in w.subject.lower() and w.grade in CREDIT_GRADES
                       for w in payload.waec_results)
    has_maths    = any("math" in w.subject.lower() and w.grade in CREDIT_GRADES
                       for w in payload.waec_results)
    waec_passed  = credits >= 5 and has_english and has_maths

    cutoff  = (course.jamb_cutoff if course else 180) or 180
    jamb_ok = payload.jamb_score >= cutoff
    putme_ok     = (payload.post_utme_score is None or
                   payload.post_utme_score >= (course.post_utme_cutoff or 40))

    target_label = f"{course.name} @ {uni.short_name or uni.name}"


    if not waec_passed:
        status       = "UNLIKELY"
        status_color = "red"
    elif not jamb_ok:
        status       = "UNLIKELY"
        status_color = "red"
    elif jamb_ok and waec_passed and putme_ok:
        gap = payload.jamb_score - cutoff
        if gap >= 30:
            status       = "HIGHLY LIKELY"
            status_color = "green"
        else:
            status       = "LIKELY"
            status_color = "yellow"
    else:
        status       = "UNLIKELY"
        status_color = "red"


    recs = []
    if not waec_passed:
        recs.append(f"You need at least 5 O'Level credits including English and Mathematics.")
        recs.append(f"Currently you have {credits}/5 credits.")
    if not jamb_ok:
        recs.append(f"Your JAMB score ({payload.jamb_score}) is below the cutoff ({cutoff}) for {course.name}.")
        recs.append(f"Consider retaking JAMB or choosing a university with a lower cutoff.")
    if not putme_ok and payload.post_utme_score is not None:
        recs.append(f"Your Post-UTME score ({payload.post_utme_score}%) is below the minimum requirement.")
    if status in ("HIGHLY LIKELY", "LIKELY"):
        recs.append(f"You comfortably meet the requirements for {target_label}.")
        recs.append("Ensure you accept your admission on the JAMB portal promptly.")

 
    waec_summary = ", ".join(
        f"{w.subject} ({w.grade})" for w in payload.waec_results
    )
    prompt = (
        f"A Nigerian student wants to study {course.name} at {uni.name}.\n"
        f"WAEC results: {waec_summary}. Credits: {credits}/5. "
        f"JAMB score: {payload.jamb_score}/400 (cutoff: {cutoff}). "
        f"Post-UTME score: {payload.post_utme_score or 'Not provided'}%.\n"
        f"Admission verdict: {status}.\n\n"
        f"Write a 2-3 sentence personalised explanation of this verdict. "
        f"Be direct, honest, and encouraging. Reference the actual numbers."
    )

    try:
        ai_text = await call_ai(
            system_prompt=(
                "You are EduGuide AI. Give concise, accurate Nigerian university "
                "admission analysis. No markdown, plain text only."
            ),
            messages=[{"role": "user", "content": prompt}],
            max_tokens=200,
        )
    except Exception:
        ai_text = (
            f"Based on your WAEC ({credits}/5 credits), JAMB score "
            f"({payload.jamb_score}/400), and Post-UTME performance, "
            f"your admission status is {status} for {target_label}."
        )

    return AdmissionVerdict(
        status=status,
        status_color=status_color,
        target_label=target_label,
        ai_explanation=ai_text,
        waec_credits=credits,
        waec_passed=waec_passed,
        jamb_meets_cutoff=jamb_ok,
        jamb_cutoff=cutoff,
        recommendations=recs,
    )

