
from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.modules.practice.model   import PracticeSession
from app.modules.practice.schema  import (
    StartPracticeRequest, SubmitPracticeRequest,
    AnswerFeedback, PracticeResultResponse, RecommendedPractice,
)
from app.modules.question.model   import Question, Subject, Topic
from app.modules.question.service  import QuestionService
from app.modules.exams.model       import ExamAttempt
from app.shared.enums               import AttemptStatus


class PracticeService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def start_session(self, user_id: int, payload: StartPracticeRequest) -> dict:
        qs = await QuestionService(self.db).fetch_for_practice(
            subject_id=payload.subject_id,
            topic_id=payload.topic_id,
            limit=payload.num_questions,
        )
        if not qs:
            raise HTTPException(
                status_code=422,
                detail="No questions found for this subject/topic. Ask admin to seed questions."
            )

        session = PracticeSession(
            student_id=user_id,
            subject_id=payload.subject_id,
            topic_id=payload.topic_id,
            total_questions=len(qs),
        )
        self.db.add(session)
        await self.db.commit()
        await self.db.refresh(session)

        from app.modules.question.schema import QuestionResponse
        return {
            "session_id": session.id,
            "total":      len(qs),
            "questions":  [QuestionResponse.model_validate(q) for q in qs],
        }

    async def submit_session(
        self, session_id: int, user_id: int, payload: "SubmitPracticeRequest"
    ) -> "PracticeResultResponse":
        from app.modules.question.model import Question, Topic

        result = await self.db.execute(
            select(PracticeSession).where(
                PracticeSession.id         == session_id,
                PracticeSession.student_id == user_id,
            )
        )
        session = result.scalars().first()
        if not session:
            raise HTTPException(status_code=404, detail="Practice session not found")

        feedback_list = []
        correct = 0

        def get_option_text(q, letter: str) -> str:
            """Return the text for option A/B/C/D."""
            return {
                "A": q.option_a, "B": q.option_b,
                "C": q.option_c, "D": q.option_d,
            }.get(letter.upper(), "") if letter else ""

        for ans in payload.answers:
            q = (await self.db.execute(
                select(Question).where(Question.id == ans.question_id)
            )).scalars().first()
            if not q:
                continue

            is_correct = (
                ans.selected_answer is not None
                and q.correct_answer.upper() == ans.selected_answer.upper()
            )
            if is_correct:
                correct += 1

         
            topic_name = None
            if q.topic_id:
                t = (await self.db.execute(
                    select(Topic).where(Topic.id == q.topic_id)
                )).scalars().first()
                topic_name = t.name if t else None

            feedback_list.append(AnswerFeedback(
                question_id=ans.question_id,
                question_text=q.question_text or "Question text unavailable",
                option_a=q.option_a or "",
                option_b=q.option_b or "",
                option_c=q.option_c or "",
                option_d=q.option_d or "",
                is_correct=is_correct,
                your_answer=ans.selected_answer,
                correct_answer=q.correct_answer or "",
                correct_text=get_option_text(q, q.correct_answer) or "",
                explanation=q.explanation,
                topic=topic_name,
            ))

            await QuestionService(self.db).update_analytics(q.id, is_correct)

        total = len(payload.answers) or 1
        pct   = round(correct / total * 100, 2)

        session.correct_count = correct
        session.percentage    = pct
        session.status        = "completed"
        session.completed_at  = datetime.utcnow()
        await self.db.commit()

        return PracticeResultResponse(
            session_id=session_id,
            correct_count=correct, 
            total=total,
            percentage=pct,
            answer_feedback=feedback_list,
        )


    async def get_user_sessions(self, user_id: int) -> List[PracticeSession]:
        return (await self.db.execute(
            select(PracticeSession).where(PracticeSession.student_id == user_id)
            .order_by(PracticeSession.started_at.desc())
        )).scalars().all()

    async def get_recommended(self, user_id: int) -> List["RecommendedPractice"]:
        """
        Recommend practice topics based on weak areas from latest exam attempt.
        FIX: uses weak_topics JSON column only — never touches .answers relationship.
        """
        from app.modules.question.model import Topic, Subject
        from app.modules.exams.model     import ExamAttempt
        from app.shared.enums             import AttemptStatus

    
        last_exam = (await self.db.execute(
            select(ExamAttempt)
            .where(
                ExamAttempt.student_id == user_id,
                ExamAttempt.status     == AttemptStatus.completed.value,
            )
            .order_by(ExamAttempt.started_at.desc())
        )).scalars().first()

        recs = []
        if not last_exam or not last_exam.weak_topics:
          
            subjects_result = await self.db.execute(
                select(Subject).where(Subject.is_active == True).limit(5)
            )
            for subj in subjects_result.scalars().all():
                recs.append(RecommendedPractice(
                    subject_id=subj.id,
                    subject_name=subj.name,
                    topic_id=None,
                    topic_name=None,
                    reason="Start practising to build your foundation",
                ))
            return recs

        exam_label = last_exam.exam_type.upper()
        for topic_name in last_exam.weak_topics[:5]:
            topic = (await self.db.execute(
                select(Topic).where(Topic.name == topic_name)
            )).scalars().first()
            if topic:
                subj = (await self.db.execute(
                    select(Subject).where(Subject.id == topic.subject_id)
                )).scalars().first()
                recs.append(RecommendedPractice(
                    subject_id=topic.subject_id,
                    subject_name=subj.name if subj else "Unknown",
                    topic_id=topic.id,
                    topic_name=topic.name,
                    reason=f"Weak area from your last {exam_label} attempt",
                ))

        return recs
