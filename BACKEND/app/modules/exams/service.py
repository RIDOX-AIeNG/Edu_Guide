import random
import string
from datetime import datetime
from typing import List, Optional, Dict, Tuple
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.modules.exams.model     import ExamAttempt, ExamAnswer
from app.modules.exams.schema    import (
    SubmitExamRequest, AvailableExamsResponse,
    WAECOverallResult, WAECSubjectResult,
    JAMBResultResponse, PostUTMEResultResponse,
)
from app.modules.question.model   import Question, Subject
from app.modules.question.service  import QuestionService
from app.modules.universities.service import UniversityService
from app.modules.auth.model        import User
from app.shared.enums               import JourneyStage, AttemptStatus
from app.shared.grading             import (
    get_waec_grade, is_credit, percentage_to_jamb_score,
    compute_topic_breakdown, get_weak_topics,
)
from app.core.config import settings
from app.modules.question.model import Question, Subject, Topic

class ExamService:
    def __init__(self, db: AsyncSession):
        self.db = db

  
    async def get_available(self, user_id: int) -> AvailableExamsResponse:
        user = await self._get_user(user_id)

        waec_attempts  = await self._completed_attempts(user_id, "waec")
        waec_status_map = await self._waec_summary(user_id, waec_attempts)
        waec_credits    = waec_status_map["credits"]
        waec_passed     = waec_credits >= settings.WAEC_REQUIRED_CREDITS

        jamb_attempts  = await self._completed_attempts(user_id, "jamb")
        jamb_passed    = any(a.passed for a in jamb_attempts)

        putme_attempts = await self._completed_attempts(user_id, "post_utme")
        putme_passed   = any(a.passed for a in putme_attempts)

        def exam_status(attempts, passed):
            if passed:      return "passed"
            if attempts:    return "failed"
            return "not_started"

        uni_name = None
        course_name = None
        if user.selected_university_id:
            from app.modules.universities.model import University, Course
            uni = (await self.db.execute(
                select(University).where(University.id == user.selected_university_id)
            )).scalars().first()
            if uni:
                uni_name = uni.name
        if user.selected_course_id:
            from app.modules.universities.model import Course
            course = (await self.db.execute(
                select(Course).where(Course.id == user.selected_course_id)
            )).scalars().first()
            if course:
                course_name = course.name

        return AvailableExamsResponse(
            journey_stage=user.journey_stage,
            waec_available=True,
            waec_status=exam_status(waec_attempts, waec_passed),
            waec_credits=waec_credits,
            jamb_available=waec_passed,
            jamb_status=exam_status(jamb_attempts, jamb_passed),
            post_utme_available=jamb_passed,
            post_utme_status=exam_status(putme_attempts, putme_passed),
            selected_university=uni_name,
            selected_course=course_name,
        )

 
    async def start_waec(self, user_id: int, subject_id: int) -> dict:
        """
        Fetch WAEC questions for one subject.
        Creates an in-progress ExamAttempt.
        """
        qs = await QuestionService(self.db).fetch_for_exam(
            subject_id=subject_id,
            exam_type="waec",
            limit=settings.WAEC_QUESTIONS_PER_SUBJECT,
        )
        MIN_REQUIRED = min(10, settings.WAEC_QUESTIONS_PER_SUBJECT)
        if len(qs) < 5:
            raise HTTPException(
                status_code=422,
                detail=(
                    f"Not enough WAEC questions for this subject ({len(qs)} found, need at least 5). "
                    "Please contact admin to seed more questions."
                ),
            )

        attempt = ExamAttempt(
            student_id=user_id,
            exam_type="waec",
            subject_id=subject_id,
            total_questions=len(qs),
            status=AttemptStatus.in_progress.value,
        )
        self.db.add(attempt)
        await self.db.commit()
        await self.db.refresh(attempt)
        await self._ensure_stage(user_id, JourneyStage.waec)

        from app.modules.question.schema import QuestionResponse
        return {
            "attempt_id":       attempt.id,
            "subject_id":       subject_id,
            "total_questions":  len(qs),
            "duration_minutes": settings.WAEC_DURATION_MINUTES,
            "questions":        [QuestionResponse.model_validate(q) for q in qs],
        }

    async def submit_waec(
        self, attempt_id: int, user_id: int, payload: SubmitExamRequest
    ) -> ExamAttempt:
        attempt = await self._get_attempt(attempt_id, user_id, "waec")
        return await self._process_submission(attempt, payload, "waec")

    async def get_waec_overall(self, user_id: int) -> WAECOverallResult:
        """
        Checks best grade per subject across all WAEC attempts.
        Determines if student has earned the required 5 credits.
        If yes → advances journey_stage to 'jamb'.
        """
        completed = await self._completed_attempts(user_id, "waec")
        summary   = await self._waec_summary(user_id, completed)
        credits   = summary["credits"]
        has_eng   = summary["has_english"]
        has_math  = summary["has_math"]
        results   = summary["subject_results"]

        passed = credits >= settings.WAEC_REQUIRED_CREDITS and has_eng and has_math

        if passed:
            await self._advance_stage(user_id, JourneyStage.jamb)
            message = (
                f"Congratulations! You have earned {credits} credits including English and Mathematics. "
                "JAMB is now unlocked. Select your university and course to begin."
            )
        else:
            issues = []
            if credits < settings.WAEC_REQUIRED_CREDITS:
                issues.append(f"you need {settings.WAEC_REQUIRED_CREDITS - credits} more credit(s)")
            if not has_eng:
                issues.append("English Language credit required")
            if not has_math:
                issues.append("Mathematics credit required")
            message = f"Not yet JAMB-eligible: {', '.join(issues)}. Retake weak subjects."

        return WAECOverallResult(
            passed=passed,
            total_credits=credits,
            has_english=has_eng,
            has_mathematics=has_math,
            subject_results=results,
            can_proceed_jamb=passed,
            message=message,
        )

    async def start_jamb(
        self, user_id: int, university_id: int, course_id: int
    ) -> dict:
        """
        Fetches 45 questions per JAMB subject (total ~180).
        Subjects come from the course's jamb_subjects field.
        """
        user = await self._get_user(user_id)
     
        if user.journey_stage not in (
            "waec", JourneyStage.waec,
            "jamb", JourneyStage.jamb,
            "post_utme", JourneyStage.post_utme,
            "admitted", JourneyStage.admitted,
            "completed", JourneyStage.completed,
        ):
            raise HTTPException(
                status_code=422,
                detail="WAEC with minimum 5 credits required before JAMB",
            )

       
        current_stage = user.journey_stage.value if hasattr(user.journey_stage, "value") else str(user.journey_stage)
        if current_stage == "waec":
           
            try:
                overall = await self.get_waec_overall(user_id)
                if overall.passed:
                    await self.db.refresh(user) 
            except Exception:
                pass 

        

        # Save university/course selection
        user.selected_university_id = university_id
        user.selected_course_id     = course_id

        from app.modules.universities.model import Course
        course_obj = (await self.db.execute(
            select(Course).where(Course.id == course_id)
        )).scalars().first()
        jamb_subjects = (
            course_obj.jamb_subjects
            if course_obj and course_obj.jamb_subjects
            else ["English Language", "Mathematics", "Physics", "Chemistry"]
        )

        all_questions: List[Question] = []
        qs_svc = QuestionService(self.db)

        for subj_name in jamb_subjects[:4]:
            subj = (await self.db.execute(
                select(Subject).where(Subject.name == subj_name)
            )).scalars().first()
            if not subj:
                continue
            qs = await qs_svc.fetch_for_exam(
                subject_id=subj.id,
                exam_type="jamb",
                limit=settings.JAMB_QUESTIONS_PER_SUBJECT,
            )
            all_questions.extend(qs)

        if len(all_questions) < 40:
            raise HTTPException(
                status_code=422,
                detail=(
                    f"Not enough JAMB questions ({len(all_questions)} found). "
                    "Admin must seed more questions for these subjects."
                ),
            )

        attempt = ExamAttempt(
            student_id=user_id,
            exam_type="jamb",
            university_id=university_id,
            course_id=course_id,
            total_questions=len(all_questions),
            status=AttemptStatus.in_progress.value,
        )
        self.db.add(attempt)
        await self.db.commit()
        await self.db.refresh(attempt)

        from app.modules.question.schema import QuestionResponse
        return {
            "attempt_id":       attempt.id,
            "university_id":    university_id,
            "course_id":        course_id,
            "total_questions":  len(all_questions),
            "duration_minutes": settings.JAMB_DURATION_MINUTES,
            "jamb_subjects":    jamb_subjects[:4],
            "questions":        [QuestionResponse.model_validate(q) for q in all_questions],
        }

    async def submit_jamb(
        self, attempt_id: int, user_id: int, payload: SubmitExamRequest
    ) -> ExamAttempt:
        attempt = await self._get_attempt(attempt_id, user_id, "jamb")
        return await self._process_submission(attempt, payload, "jamb")

    async def get_jamb_result(
        self, attempt_id: int, user_id: int
    ) -> JAMBResultResponse:
        attempt = await self._get_attempt(attempt_id, user_id, "jamb")
        if attempt.status != AttemptStatus.completed.value:
            raise HTTPException(status_code=422, detail="Exam not yet completed")

        jamb_score   = attempt.score or 0
        passed       = jamb_score >= settings.JAMB_MIN_PASS_SCORE

        # Get the course cutoff
        university_cutoff: Optional[int] = None
        meets_cutoff = False
        alternatives: List[Dict] = []

        if attempt.course_id:
            from app.modules.universities.model import Course
            course = (await self.db.execute(
                select(Course).where(Course.id == attempt.course_id)
            )).scalars().first()
            university_cutoff = course.jamb_cutoff if course else None

        if university_cutoff is not None:
            meets_cutoff = jamb_score >= university_cutoff
        elif passed:
            meets_cutoff = True 

        if passed and meets_cutoff:
            await self._advance_stage(user_id, JourneyStage.post_utme)
            message = (
                f"Excellent! Your JAMB score of {jamb_score}/400 meets the cutoff "
                f"of {university_cutoff or 'N/A'}. POST-UTME is now unlocked!"
            )
        elif passed and not meets_cutoff:
         
            recs = await UniversityService(self.db).recommend_by_score(jamb_score)
            alternatives = [r.model_dump() for r in recs[:8]]
            message = (
                f"Your JAMB score of {jamb_score}/400 is below your chosen university's "
                f"cutoff of {university_cutoff}. "
                f"Below are universities where your score qualifies."
            )
        else:
            message = (
                f"Your JAMB score of {jamb_score}/400 is below the national minimum of "
                f"{settings.JAMB_MIN_PASS_SCORE}. Review weak topics and retake."
            )

        return JAMBResultResponse(
            attempt_id=attempt.id,
            jamb_score=jamb_score,
            percentage=attempt.percentage or 0,
            passed=passed,
            university_cutoff=university_cutoff,
            meets_cutoff=meets_cutoff,
            can_proceed_post_utme=meets_cutoff,
            topic_breakdown=attempt.topic_scores,
            weak_topics=attempt.weak_topics,
            alternative_universities=alternatives,
            message=message,
        )

  
    async def start_post_utme(
        self, user_id: int, university_id: int, course_id: int
    ) -> dict:
        user = await self._get_user(user_id)
        if user.journey_stage not in (
            "waec", JourneyStage.waec,
            "jamb", JourneyStage.jamb,
            "post_utme", JourneyStage.post_utme,
            "admitted", JourneyStage.admitted,
            "completed", JourneyStage.completed,
        ):
            raise HTTPException(
                status_code=422,
                detail="Complete WAEC and JAMB before POST-UTME",
            )

        from app.modules.universities.model import Course
        course_obj = (await self.db.execute(
            select(Course).where(Course.id == course_id)
        )).scalars().first()
        jamb_subjects = (
            course_obj.jamb_subjects[:2]
            if course_obj and course_obj.jamb_subjects
            else ["English Language", "Mathematics"]
        )

        qs_svc = QuestionService(self.db)
        all_questions: List[Question] = []

        for subj_name in jamb_subjects:
            subj = (await self.db.execute(
                select(Subject).where(Subject.name == subj_name)
            )).scalars().first()
            if subj:
                qs = await qs_svc.fetch_for_exam(
                    subject_id=subj.id, exam_type="post_utme", limit=25
                )
                if not qs:
                 
                    qs = await qs_svc.fetch_for_exam(
                        subject_id=subj.id, exam_type="jamb", limit=25
                    )
                all_questions.extend(qs)

        if not all_questions:
            raise HTTPException(
                status_code=422,
                detail="No POST-UTME questions found. Admin must seed post_utme questions.",
            )

        attempt = ExamAttempt(
            student_id=user_id,
            exam_type="post_utme",
            university_id=university_id,
            course_id=course_id,
            total_questions=len(all_questions),
            status=AttemptStatus.in_progress.value,
        )
        self.db.add(attempt)
        await self.db.commit()
        await self.db.refresh(attempt)

        from app.modules.question.schema import QuestionResponse
        return {
            "attempt_id":       attempt.id,
            "university_id":    university_id,
            "course_id":        course_id,
            "total_questions":  len(all_questions),
            "duration_minutes": settings.POST_UTME_DURATION_MINUTES,
            "questions":        [QuestionResponse.model_validate(q) for q in all_questions],
        }

    async def submit_post_utme(
        self, attempt_id: int, user_id: int, payload: SubmitExamRequest
    ) -> ExamAttempt:
        attempt = await self._get_attempt(attempt_id, user_id, "post_utme")
        return await self._process_submission(attempt, payload, "post_utme")

    async def get_post_utme_result(
        self, attempt_id: int, user_id: int
    ) -> PostUTMEResultResponse:
        attempt = await self._get_attempt(attempt_id, user_id, "post_utme")
        pct     = attempt.percentage or 0
        admitted = pct >= settings.POST_UTME_PASS_PERCENTAGE

        uni_name    = None
        course_name = None
        alternatives: List[Dict] = []

        from app.modules.universities.model import University, Course
        if attempt.university_id:
            uni = (await self.db.execute(
                select(University).where(University.id == attempt.university_id)
            )).scalars().first()
            uni_name = uni.name if uni else None

        if attempt.course_id:
            course = (await self.db.execute(
                select(Course).where(Course.id == attempt.course_id)
            )).scalars().first()
            course_name = course.name if course else None

        matric = None
        if admitted:
            await self._advance_stage(user_id, JourneyStage.admitted)
            year_prefix = datetime.utcnow().year
            rand_id     = ''.join(random.choices(string.digits, k=6))
            code        = course_name[:3].upper() if course_name else "GEN"
            matric      = f"{year_prefix}/{code}/{rand_id}"
            message     = (
                f" CONGRATULATIONS! You have been ADMITTED to study "
                f"{course_name} at {uni_name}! "
                f"Your simulated matric number is {matric}. "
                "Await your official offer letter and next steps from the university."
            )
        else:
         
            last_jamb = (await self.db.execute(
                select(ExamAttempt).where(
                    ExamAttempt.student_id == user_id,
                    ExamAttempt.exam_type  == "jamb",
                    ExamAttempt.status     == AttemptStatus.completed.value,
                ).order_by(ExamAttempt.score.desc())
            )).scalars().first()

            if last_jamb and last_jamb.score:
                recs = await UniversityService(self.db).recommend_by_score(
                    last_jamb.score, course_name
                )
                alternatives = [r.model_dump() for r in recs[:5]]

            message = (
                f"You scored {pct:.1f}% in POST-UTME — below the required pass mark. "
                "Do not be discouraged. Explore alternative universities below, "
                "or retake after focused practice."
            )

        return PostUTMEResultResponse(
            attempt_id=attempt.id,
            percentage=pct,
            passed=admitted,
            admitted=admitted,
            university_name=uni_name,
            course_name=course_name,
            matric_number=matric,
            message=message,
            alternatives=alternatives,
        )

    async def get_exam_history(self, user_id: int) -> List[ExamAttempt]:
        return (await self.db.execute(
            select(ExamAttempt).where(ExamAttempt.student_id == user_id)
            .order_by(ExamAttempt.started_at.desc())
        )).scalars().all()


    async def _process_submission(
        self,
        attempt: "ExamAttempt",
        payload: "SubmitExamRequest",
        exam_type: str,
    ) -> "ExamAttempt":
        """
        Score each answer, update question analytics, compute topic breakdown.
        FIX: pre-loads all topic names in one async query before calling
             compute_topic_breakdown — avoids lazy relationship MissingGreenlet.
        """
        if attempt.status == AttemptStatus.completed.value:
            return attempt  

        qs_svc  = QuestionService(self.db)
        correct = 0
        total   = len(payload.answers)
        answer_question_pairs = []

     
        question_ids = [a.question_id for a in payload.answers]
        questions_result = await self.db.execute(
            select(Question).where(Question.id.in_(question_ids))
        )
        questions_by_id = {q.id: q for q in questions_result.scalars().all()}

     
        topic_ids = list({q.topic_id for q in questions_by_id.values() if q.topic_id})
        topic_names_by_id: dict = {}
        if topic_ids:
            topics_result = await self.db.execute(
                select(Topic).where(Topic.id.in_(topic_ids))
            )
            topic_names_by_id = {t.id: t.name for t in topics_result.scalars().all()}

     
        for ans_item in payload.answers:
            question = questions_by_id.get(ans_item.question_id)
            if not question:
                continue

            is_correct = (
                ans_item.selected_answer is not None
                and question.correct_answer.upper() == ans_item.selected_answer.upper()
            )
            if is_correct:
                correct += 1

            answer_orm = ExamAnswer(
                attempt_id=attempt.id,
                question_id=ans_item.question_id,
                selected_answer=ans_item.selected_answer,
                is_correct=is_correct,
                time_spent_seconds=ans_item.time_spent_seconds,
            )
            self.db.add(answer_orm)

     
            topic_name = topic_names_by_id.get(question.topic_id, "General") if question.topic_id else "General"
            answer_question_pairs.append((answer_orm, question, topic_name))

            await qs_svc.update_analytics(question.id, is_correct)

  
        pct             = round((correct / total * 100), 2) if total > 0 else 0.0
        topic_breakdown = compute_topic_breakdown(answer_question_pairs)
        weak            = get_weak_topics(topic_breakdown)

        attempt.correct_answers = correct
        attempt.total_questions = total
        attempt.percentage      = pct
        attempt.status          = AttemptStatus.completed.value
        attempt.completed_at    = datetime.utcnow()
        attempt.topic_scores    = topic_breakdown
        attempt.weak_topics     = weak

        if exam_type == "waec":
            grade         = get_waec_grade(pct)
            attempt.grade = grade
            attempt.score = round(pct)
            attempt.passed = is_credit(grade)

        elif exam_type == "jamb":
            jamb_score     = percentage_to_jamb_score(correct, total)
            attempt.score  = jamb_score
            attempt.passed = jamb_score >= settings.JAMB_MIN_PASS_SCORE

        elif exam_type == "post_utme":
            attempt.score  = round(pct)
            attempt.passed = pct >= settings.POST_UTME_PASS_PERCENTAGE

        await self.db.commit()
        await self.db.refresh(attempt)
        return attempt


  
    async def _waec_summary(self, user_id: int, completed: List[ExamAttempt]) -> dict:
        """Compute best grade per subject and count credits."""
        best_per_subject: Dict[int, ExamAttempt] = {}
        for a in completed:
            if a.subject_id not in best_per_subject:
                best_per_subject[a.subject_id] = a
            elif (a.percentage or 0) > (best_per_subject[a.subject_id].percentage or 0):
                best_per_subject[a.subject_id] = a

        results:  List[WAECSubjectResult] = []
        credits   = 0
        has_eng   = False
        has_math  = False

        for sid, attempt in best_per_subject.items():
            subj = (await self.db.execute(
                select(Subject).where(Subject.id == sid)
            )).scalars().first()
            name  = subj.name if subj else f"Subject {sid}"
            pct   = attempt.percentage or 0
            grade = get_waec_grade(pct)
            credit = is_credit(grade)
            if credit:
                credits += 1
                if "english" in name.lower():
                    has_eng = True
                if "math" in name.lower():
                    has_math = True

            results.append(WAECSubjectResult(
                subject_id=sid,
                subject_name=name,
                grade=grade,
                percentage=pct,
                is_credit=credit,
            ))

        return {
            "credits": credits,
            "has_english": has_eng,
            "has_math": has_math,
            "subject_results": results,
        }

  
    async def _get_user(self, user_id: int) -> User:
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    async def _get_attempt(
        self, attempt_id: int, user_id: int, expected_type: Optional[str] = None
    ) -> ExamAttempt:
        result = await self.db.execute(
            select(ExamAttempt).where(
                ExamAttempt.id         == attempt_id,
                ExamAttempt.student_id == user_id,
            )
        )
        attempt = result.scalars().first()
        if not attempt:
            raise HTTPException(status_code=404, detail="Exam attempt not found")
        if expected_type and attempt.exam_type != expected_type:
            raise HTTPException(status_code=422, detail=f"This attempt is not a {expected_type} exam")
        return attempt

    async def _completed_attempts(
        self, user_id: int, exam_type: str
    ) -> List[ExamAttempt]:
        return (await self.db.execute(
            select(ExamAttempt).where(
                ExamAttempt.student_id == user_id,
                ExamAttempt.exam_type  == exam_type,
                ExamAttempt.status     == AttemptStatus.completed.value,
            ).order_by(ExamAttempt.started_at.desc())
        )).scalars().all()

    async def _ensure_stage(self, user_id: int, stage: JourneyStage):
        """Set stage if still on onboarding."""
        user = await self._get_user(user_id)
        if user.journey_stage == JourneyStage.onboarding.value:  
           user.journey_stage = stage.value if hasattr(stage, 'value') else str(stage)
           await self.db.commit()

    async def _advance_stage(self, user_id: int, new_stage: JourneyStage):
        """Advance stage only if new_stage is later in the sequence."""
        stage_order = [
            JourneyStage.onboarding.value, 
            JourneyStage.waec.value,         
            JourneyStage.jamb.value,       
            JourneyStage.post_utme.value,   
            JourneyStage.admitted.value,    
            JourneyStage.completed.value,   
        ]
        user    = await self._get_user(user_id)
        new_val = new_stage.value if hasattr(new_stage, 'value') else new_stage

       
        current = user.journey_stage if user.journey_stage in stage_order else "onboarding"

        if stage_order.index(new_val) > stage_order.index(current):
            user.journey_stage = new_val
            await self.db.commit()


