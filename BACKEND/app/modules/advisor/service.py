from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.modules.advisor.model   import AdvisorConversation, AdvisorMessage, CareerAssessment
from app.modules.advisor.schema  import (
    ChatResponse, CareerAssessmentResponse,
    ConversationDetailResponse, ConversationListResponse,
)
from app.modules.advisor.context_builder import build_student_context, build_system_prompt
from app.modules.advisor.ai_client       import call_ai


class AdvisorService:
    def __init__(self, db: AsyncSession):
        self.db = db


    async def chat(
        self,
        user_id:         int,
        message:         str,
        context:         str = "general",
        conversation_id: Optional[int] = None,
    ) -> ChatResponse:
        """
        Single entry point for all AI advisor interactions.
        1. Load or create conversation
        2. Build student context snapshot
        3. Load recent conversation history (last 10 turns)
        4. Call AI
        5. Save both turns to DB
        """
   
        conv = await self._get_or_create_conversation(user_id, context, conversation_id)

     
        student_ctx  = await build_student_context(user_id, self.db)
        system_prompt = build_system_prompt(student_ctx, context)

      
        history = await self._load_history(conv.id, limit=10)

     
        ai_response = await call_ai(
            system_prompt=system_prompt,
            messages=history + [{"role": "user", "content": message}],
        )

     
        user_msg = AdvisorMessage(
            conversation_id=conv.id, role="user", content=message
        )
        self.db.add(user_msg)
        await self.db.flush()

      
        ai_msg = AdvisorMessage(
            conversation_id=conv.id, role="assistant", content=ai_response
        )
        self.db.add(ai_msg)

       
        if not conv.title:
            conv.title = message[:60] + ("..." if len(message) > 60 else "")

        await self.db.commit()
        await self.db.refresh(ai_msg)

        return ChatResponse(
            conversation_id=conv.id,
            message_id=ai_msg.id,
            response=ai_response,
            context_used={
                "journey_stage":     student_ctx.get("journey_stage"),
                "jamb_score":        student_ctx.get("jamb_score"),
                "weak_topics":       student_ctx.get("latest_weak_topics"),
                "career_interests":  student_ctx.get("career_interests"),
            },
        )

   
    async def analyze_performance(self, user_id: int, attempt_id: int) -> ChatResponse:
        """
        Fetch the exam attempt, build a detailed analysis prompt,
        then call the AI advisor to produce a personalised analysis.
        """
        from app.modules.exams.model import ExamAttempt
        attempt = (await self.db.execute(
            select(ExamAttempt).where(
                ExamAttempt.id         == attempt_id,
                ExamAttempt.student_id == user_id,
            )
        )).scalars().first()

        if not attempt:
            raise HTTPException(status_code=404, detail="Exam attempt not found")

        topic_breakdown = attempt.topic_scores or {}
        weak_topics     = attempt.weak_topics or []

        topic_lines = "\n".join([
            f"  • {topic}: {data['percentage'] if isinstance(data, dict) else data}%"
            for topic, data in topic_breakdown.items()
        ]) or "  • No topic breakdown available"

        analysis_message = (
            f"Please analyse my {attempt.exam_type.upper()} performance:\n"
            f"Score: {attempt.score} ({attempt.percentage:.1f}%)\n"
            f"Grade: {attempt.grade or 'N/A'}\n"
            f"Topic Breakdown:\n{topic_lines}\n"
            f"Weak Topics: {', '.join(weak_topics) or 'None identified'}\n\n"
            f"Please give me: (1) what my score means, "
            f"(2) which topics I must prioritise, "
            f"(3) a 2-week study plan to improve."
        )

        return await self.chat(user_id, analysis_message, context="performance")

  
    async def submit_career_assessment(
        self, user_id: int, responses: list
    ) -> CareerAssessmentResponse:
        """
        Process the 50-response career survey.
        Calls AI to derive recommended careers, courses, and subject requirements.
        Saves result to career_assessments table.
        """
 
        existing = (await self.db.execute(
            select(CareerAssessment).where(CareerAssessment.user_id == user_id)
        )).scalars().first()

    
        resp_summary = "\n".join([
            f"Response {i+1}: {r}"
            for i, r in enumerate(responses[:50])
        ])

        student_ctx   = await build_student_context(user_id, self.db)
        system_prompt = build_system_prompt(student_ctx, "career")

        assessment_prompt = f"""
Based on this student's survey responses, provide a structured career assessment.

SURVEY RESPONSES ({len(responses)} responses):
{resp_summary}

Respond ONLY in this JSON format (no markdown, no extra text):
{{
  "recommended_careers": ["Career1", "Career2", "Career3"],
  "recommended_courses": [
    {{"course": "CourseName", "university_example": "UniversityName", "duration": "5 years"}},
    {{"course": "CourseName2", "university_example": "UniversityName2", "duration": "4 years"}}
  ],
  "waec_subjects_needed": ["Subject1", "Subject2", "Subject3", "Subject4", "Subject5"],
  "jamb_subjects_needed": ["Subject1", "Subject2", "Subject3", "Subject4"],
  "summary": "A 2-3 sentence encouraging summary of the student's career fit."
}}
"""
        import json
        raw = await call_ai(
            system_prompt=system_prompt,
            messages=[{"role": "user", "content": assessment_prompt}],
            max_tokens=600,
        )

    
        try:
         
            clean = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
            data  = json.loads(clean)
        except Exception:
            data = {
                "recommended_careers":  ["To be determined"],
                "recommended_courses":  [],
                "waec_subjects_needed": ["English Language", "Mathematics"],
                "jamb_subjects_needed": ["English Language", "Mathematics"],
                "summary": raw[:500],
            }

       
        if existing:
            existing.raw_responses        = responses
            existing.recommended_careers  = data.get("recommended_careers", [])
            existing.recommended_courses  = data.get("recommended_courses", [])
            existing.waec_subjects_needed = data.get("waec_subjects_needed", [])
            existing.jamb_subjects_needed = data.get("jamb_subjects_needed", [])
            existing.summary              = data.get("summary", "")
            assessment = existing
        else:
            assessment = CareerAssessment(
                user_id=user_id,
                raw_responses=responses,
                recommended_careers=data.get("recommended_careers", []),
                recommended_courses=data.get("recommended_courses", []),
                waec_subjects_needed=data.get("waec_subjects_needed", []),
                jamb_subjects_needed=data.get("jamb_subjects_needed", []),
                summary=data.get("summary", ""),
            )
            self.db.add(assessment)

        await self.db.commit()
        await self.db.refresh(assessment)

        return CareerAssessmentResponse(
            assessment_id=assessment.id,
            recommended_careers=assessment.recommended_careers or [],
            recommended_courses=assessment.recommended_courses or [],
            waec_subjects_needed=assessment.waec_subjects_needed or [],
            jamb_subjects_needed=assessment.jamb_subjects_needed or [],
            summary=assessment.summary or "",
        )

    async def get_career_assessment(self, user_id: int) -> Optional[CareerAssessmentResponse]:
        assessment = (await self.db.execute(
            select(CareerAssessment).where(CareerAssessment.user_id == user_id)
        )).scalars().first()
        if not assessment:
            return None
        return CareerAssessmentResponse(
            assessment_id=assessment.id,
            recommended_careers=assessment.recommended_careers or [],
            recommended_courses=assessment.recommended_courses or [],
            waec_subjects_needed=assessment.waec_subjects_needed or [],
            jamb_subjects_needed=assessment.jamb_subjects_needed or [],
            summary=assessment.summary or "",
        )

   
    async def list_conversations(self, user_id: int) -> List[AdvisorConversation]:
        return (await self.db.execute(
            select(AdvisorConversation).where(
                AdvisorConversation.user_id   == user_id,
                AdvisorConversation.is_active == True,
            ).order_by(AdvisorConversation.updated_at.desc())
        )).scalars().all()

    async def get_conversation(
        self, user_id: int, conversation_id: int
    ) -> "AdvisorConversation":
        from sqlalchemy.orm import selectinload
        conv = (await self.db.execute(
            select(AdvisorConversation)
            .options(selectinload(AdvisorConversation.messages))
            .where(
                AdvisorConversation.id      == conversation_id,
                AdvisorConversation.user_id == user_id,
            )
        )).scalars().first()
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return conv

        
    async def delete_conversation(self, user_id: int, conversation_id: int):
        conv = await self.get_conversation(user_id, conversation_id)
        conv.is_active = False
        await self.db.commit()

   
    async def _get_or_create_conversation(
        self,
        user_id:         int,
        context:         str,
        conversation_id: Optional[int],
    ) -> AdvisorConversation:
        if conversation_id:
            result = await self.db.execute(
                select(AdvisorConversation).where(
                    AdvisorConversation.id      == conversation_id,
                    AdvisorConversation.user_id == user_id,
                )
            )
            conv = result.scalars().first()
            if conv:
                return conv

 
        conv = AdvisorConversation(user_id=user_id, context=context)
        self.db.add(conv)
        await self.db.flush()
        return conv

    async def _load_history(
        self, conversation_id: int, limit: int = 10
    ) -> List[dict]:
        """Load the N most recent messages as dicts for the AI API."""
        messages = (await self.db.execute(
            select(AdvisorMessage).where(
                AdvisorMessage.conversation_id == conversation_id
            ).order_by(AdvisorMessage.created_at.desc()).limit(limit)
        )).scalars().all()

      
        return [
            {"role": m.role, "content": m.content}
            for m in reversed(messages)
        ]