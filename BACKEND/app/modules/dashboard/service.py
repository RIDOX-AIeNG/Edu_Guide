from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.modules.dashboard.schema import (
    StudentDashboard, StudentAnalytics,AdmissionReadiness, WAECSubjectSummary,
    LiveUniversityUpdate,
)
from app.modules.auth.model     import User
from app.modules.exams.model    import ExamAttempt
from app.modules.practice.model import PracticeSession
from app.shared.enums            import AttemptStatus
from app.shared.grading          import get_waec_grade



CREDIT_GRADES = {"A1", "B2", "B3", "C4", "C5", "C6"}


class DashboardService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _get_live_updates(self) -> list:
        """Fetch live university updates from database.
        Falls back to static data if table is empty.
        """
        from app.modules.universities.model import UniversityNews, University
        from app.modules.dashboard.schema import LiveUniversityUpdate

        rows = (await self.db.execute(
            select(UniversityNews, University)
            .join(University, University.id == UniversityNews.university_id)
            .where(UniversityNews.is_active == True)
            .order_by(UniversityNews.updated_at.desc())
            .limit(6)
        )).all()

        if not rows:
    
            return [
                LiveUniversityUpdate(university_name="University of Lagos",    short_name="UNILAG",
                    status="live",         status_label="LIVE",   message="Admitting Now",       deadline="Closes Oct 30"),
                LiveUniversityUpdate(university_name="Obafemi Awolowo University", short_name="OAU",
                    status="live",         status_label="LIVE",   message="Post-UTME Forms Out", deadline="Closes Nov 15"),
                LiveUniversityUpdate(university_name="University of Ibadan",   short_name="UI",
                    status="closed",       status_label="CLOSED", message="Admission Closed",    deadline="Awaiting List"),
                LiveUniversityUpdate(university_name="University of Nigeria",  short_name="UNN",
                    status="opening_soon", status_label="SOON",   message="Forms Opening Soon",  deadline="Est. Nov 20"),
            ]

        return [
            LiveUniversityUpdate(
                university_name=uni.name,
                short_name=uni.short_name or uni.name[:6].upper(),
                status=news.status,
                status_label=news.status_label,
                message=news.message,
                deadline=news.deadline,
            )
            for news, uni in rows
        ]

    async def get_dashboard(self, user_id: int) -> StudentDashboard:
        user = (await self.db.execute(
            select(User).where(User.id == user_id)
        )).scalars().first()

    
        all_attempts = (await self.db.execute(
            select(ExamAttempt).where(
                ExamAttempt.student_id == user_id,
                ExamAttempt.status == AttemptStatus.completed.value,
            ).order_by(ExamAttempt.started_at.asc())
        )).scalars().all()

        waec_attempts  = [a for a in all_attempts if a.exam_type == "waec"]
        jamb_attempts  = [a for a in all_attempts if a.exam_type == "jamb"]
        putme_attempts = [a for a in all_attempts if a.exam_type == "post_utme"]

        practice_count = (await self.db.execute(
            select(func.count(PracticeSession.id)).where(
                PracticeSession.student_id == user_id
            )
        )).scalar() or 0

   
        waec_summary = await self._build_waec_summary(user_id, waec_attempts)

   
        readiness = self._build_readiness(
            user, waec_summary, waec_attempts, jamb_attempts, putme_attempts
        )
        

        return StudentDashboard(
            student_name=user.full_name,
            class_level=user.class_level,
            journey_stage=user.journey_stage,
            admission_readiness=readiness,
            live_updates=await self._get_live_updates(),
            has_admission_guide=bool(user.selected_university_id),
            quick_stats={
                "total_exams":        len(all_attempts),
                "practice_sessions":  practice_count,
                "waec_attempts":      len(waec_attempts),
                "jamb_attempts":      len(jamb_attempts),
            },
        )

    async def _build_waec_summary(
        self, user_id: int, waec_attempts: list
    ) -> dict:
        """
        Returns:
          subjects:     List[WAECSubjectSummary]
          credits:      int
          has_english:  bool
          has_maths:    bool
          passed:       bool  (≥5 credits + english + maths)
        """
        from app.modules.question.model import Subject
        from sqlalchemy import select

        best: dict = {}  
        for a in waec_attempts:
            sid = a.subject_id
            if sid is None:
                continue
            if sid not in best or (a.percentage or 0) > (best[sid].percentage or 0):
                best[sid] = a

        subjects: List[WAECSubjectSummary] = []
        credits   = 0
        has_eng   = False
        has_math  = False

        for sid, attempt in best.items():
            subj = (await self.db.execute(
                select(Subject).where(Subject.id == sid)
            )).scalars().first()
            name  = subj.name if subj else f"Subject {sid}"
            grade = get_waec_grade(attempt.percentage or 0)
            is_cr = grade in CREDIT_GRADES

            if is_cr:
                credits += 1
                if "english" in name.lower():
                    has_eng  = True
                if "math" in name.lower():
                    has_math = True

            subjects.append(WAECSubjectSummary(
                subject_name=name,
                grade=grade,
                percentage=attempt.percentage,
                is_credit=is_cr,
                is_taken=True,
            ))

        return {
            "subjects":    subjects,
            "credits":     credits,
            "has_english": has_eng,
            "has_maths":   has_math,
            "passed":      credits >= 5 and has_eng and has_math,
        }

 
    def _build_readiness(
        self,
        user,
        waec_summary: dict,
        waec_attempts: list,
        jamb_attempts: list,
        putme_attempts: list,
    ) -> AdmissionReadiness:

        wc       = waec_summary["credits"]
        w_passed = waec_summary["passed"]
        subjects = waec_summary["subjects"]

        best_jamb  = max(jamb_attempts,  key=lambda a: a.score or 0) if jamb_attempts  else None
        best_putme = max(putme_attempts, key=lambda a: a.percentage or 0) if putme_attempts else None

  
        if not waec_attempts:
      
            waec_status  = "not_started"
            waec_display = "Not Started"
            waec_color   = "gray"
        elif w_passed:
          
            best_pct     = max((a.percentage or 0) for a in waec_attempts)
            waec_status  = "passed"
            waec_display = f"{best_pct:.0f}%"
            waec_color   = "green"
        elif wc > 0:
       
            waec_status  = "in_progress"
            waec_display = f"{wc}/5 Credits"
            waec_color   = "amber"
        else:
       
            waec_status  = "failed"
            waec_display = "0/5 Credits"
            waec_color   = "red"

    
        if not w_passed:
            jamb_status  = "locked"
            jamb_display = "Locked"
            jamb_color   = "gray"
        elif not jamb_attempts:
            jamb_status  = "pending"
            jamb_display = "Pending"
            jamb_color   = "amber"
        elif best_jamb and best_jamb.passed:
            jamb_status  = "passed"
            jamb_display = f"{best_jamb.score}/400"
            jamb_color   = "green"
        else:
            jamb_status  = "failed"
            jamb_display = f"{best_jamb.score if best_jamb else 0}/400"
            jamb_color   = "red"

  
        jamb_passed = jamb_status == "passed"
        if not jamb_passed:
            putme_status  = "locked"
            putme_display = "Locked"
            putme_color   = "gray"
        elif not putme_attempts:
            putme_status  = "pending"
            putme_display = "Pending"
            putme_color   = "amber"
        elif best_putme and best_putme.passed:
            putme_status  = "admitted"
            putme_display = "Admitted!"
            putme_color   = "green"
        else:
            putme_status  = "failed"
            putme_display = f"{best_putme.percentage:.0f}%" if best_putme else "Failed"
            putme_color   = "red"

       
        if putme_status == "admitted":
            next_action = "admitted"
            cta_label   = "View Admission Letter"
            cta_route   = "/admitted"
        elif jamb_passed and putme_status == "pending":
            next_action = "post_utme"
            cta_label   = "Start POST-UTME"
            cta_route   = "/exams/post-utme"
        elif w_passed and jamb_status == "pending":
            next_action = "jamb"
            cta_label   = "Start JAMB Exam"
            cta_route   = "/exams/jamb"
        elif w_passed and jamb_status == "failed":
            next_action = "jamb"
            cta_label   = "Retake JAMB"
            cta_route   = "/exams/jamb"
        else:
            next_action = "waec"
            cta_label   = "Continue Mock Journey"
            cta_route   = "/exams/waec"

        return AdmissionReadiness(
            waec_status=waec_status,
            waec_display=waec_display,
            waec_color=waec_color,
            jamb_status=jamb_status,
            jamb_display=jamb_display,
            jamb_color=jamb_color,
            post_utme_status=putme_status,
            post_utme_display=putme_display,
            post_utme_color=putme_color,
            waec_subjects=subjects,
            waec_credits=wc,
            next_action=next_action,
            cta_label=cta_label,
            cta_route=cta_route,
        )

    async def get_analytics(self, user_id: int) -> "StudentAnalytics":
            from app.modules.dashboard.schema import (
                StudentAnalytics, SubjectStat, WeakTopicStat, ExamHistoryItem
            )
            from app.modules.question.model  import Subject
            from app.shared.grading            import get_waec_grade
            from collections import defaultdict
            from sqlalchemy import select, func

        
            attempts = (await self.db.execute(
                select(ExamAttempt).where(
                    ExamAttempt.student_id == user_id,
                    ExamAttempt.status     == "completed",
                ).order_by(ExamAttempt.started_at.asc())
            )).scalars().all()

            practice_count = (await self.db.execute(
                select(func.count(PracticeSession.id)).where(
                    PracticeSession.student_id == user_id
                )
            )).scalar() or 0

            waec_a   = [a for a in attempts if a.exam_type == "waec"]
            jamb_a   = [a for a in attempts if a.exam_type == "jamb"]
            putme_a  = [a for a in attempts if a.exam_type == "post_utme"]

        
            passed       = [a for a in attempts if a.passed]
            pass_rate    = round(len(passed) / len(attempts) * 100, 1) if attempts else 0.0
            best_jamb    = max((a.score or 0) for a in jamb_a) if jamb_a else None

      
            best_waec: dict = {}
            for a in waec_a:
                if a.subject_id and (
                    a.subject_id not in best_waec or
                    (a.percentage or 0) > (best_waec[a.subject_id].percentage or 0)
                ):
                    best_waec[a.subject_id] = a
            CREDITS = {"A1","B2","B3","C4","C5","C6"}
            waec_credits = sum(
                1 for a in best_waec.values()
                if get_waec_grade(a.percentage or 0) in CREDITS
            )

        
            by_subject: dict = defaultdict(list)
            for a in attempts:
                if a.subject_id:
                    by_subject[(a.subject_id, a.exam_type)].append(a)

            subject_stats = []
            for (sid, etype), atts in by_subject.items():
                subj = (await self.db.execute(
                    select(Subject).where(Subject.id == sid)
                )).scalars().first()
                sname = subj.name if subj else f"Subject {sid}"

                pcts  = [a.percentage or 0 for a in atts]
                best  = max(pcts)
                avg   = sum(pcts) / len(pcts)
                grade = get_waec_grade(best) if etype == "waec" else None
                improving = pcts[-1] >= pcts[0] if len(pcts) > 1 else True

                subject_stats.append(SubjectStat(
                    subject_name=sname,
                    exam_type=etype,
                    attempts=len(atts),
                    best_score=round(best, 1),
                    avg_score=round(avg, 1),
                    latest_grade=grade,
                    is_improving=improving,
                ))

       
            topic_freq: dict = defaultdict(int)
            topic_subj: dict = {}
            for a in attempts:
                if a.weak_topics and isinstance(a.weak_topics, list):
                    for t in a.weak_topics:
                        topic_freq[t] += 1
                        if a.subject_id and t not in topic_subj:
                            topic_subj[t] = a.subject_id

            weak_topics = []
            for topic, freq in sorted(topic_freq.items(), key=lambda x: -x[1])[:10]:
                sid   = topic_subj.get(topic)
                subj_name = ""
                if sid:
                    s = (await self.db.execute(
                        select(Subject).where(Subject.id == sid)
                    )).scalars().first()
                    subj_name = s.name if s else ""
                weak_topics.append(WeakTopicStat(
                    topic_name=topic, subject=subj_name, frequency=freq
                ))

        
            score_trend = [
                {
                    "date":      a.started_at.strftime("%d %b"),
                    "score":     round(a.percentage or (a.score / 4 if a.score else 0), 1),
                    "exam_type": a.exam_type,
                    "label":     f"{a.exam_type.upper()} {'(' + str(a.score) + '/400)' if a.exam_type == 'jamb' else ''}",
                }
                for a in attempts if a.percentage or a.score
            ]

           
            waec_chart = []
            for sid, a in best_waec.items():
                subj = (await self.db.execute(
                    select(Subject).where(Subject.id == sid)
                )).scalars().first()
                waec_chart.append({
                    "subject":    (subj.name if subj else f"Subj {sid}")[:12],
                    "grade":      get_waec_grade(a.percentage or 0),
                    "percentage": round(a.percentage or 0, 1),
                })

          
            recent = sorted(attempts, key=lambda a: a.started_at, reverse=True)[:10]
            recent_exams = []
            for a in recent:
                subj_name = None
                if a.subject_id:
                    s = (await self.db.execute(
                        select(Subject).where(Subject.id == a.subject_id)
                    )).scalars().first()
                    subj_name = s.name if s else None
                recent_exams.append(ExamHistoryItem(
                    id=a.id,
                    exam_type=a.exam_type,
                    subject=subj_name,
                    score=a.score,
                    percentage=round(a.percentage or 0, 1),
                    grade=a.grade,
                    passed=a.passed,
                    attempted_at=a.started_at,
                ))

            return StudentAnalytics(
                total_exams=len(attempts),
                total_practice=practice_count,
                waec_credits=waec_credits,
                best_jamb_score=best_jamb,
                overall_pass_rate=pass_rate,
                study_streak=min(len(attempts), 7),  
                subject_stats=subject_stats,
                weak_topics=weak_topics,
                score_trend=score_trend,
                waec_subject_chart=waec_chart,
                recent_exams=recent_exams,
            )



