from typing import List, Optional
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import json
import re
import logging
import hashlib

from app.core.cache import Cache
from app.modules.advisor.model import AdvisorConversation, AdvisorMessage, CareerAssessment
from app.modules.advisor.schema import ChatResponse, CareerAssessmentResponse
from app.modules.advisor.context_builder import build_student_context, build_system_prompt
from app.modules.advisor.ai_client import call_ai


logger = logging.getLogger(__name__)

ADVISOR_CHAT_CACHE_TTL = 3600  # 1 hour


class AdvisorService:
    ALLOWED_KEYWORDS = {
        "jamb",
        "waec",
        "neco",
        "post utme",
        "post-utme",
        "utme",
        "admission",
        "admissions",
        "university",
        "universities",
        "course",
        "courses",
        "cut off",
        "cutoff",
        "cut-off",
        "subject combination",
        "subjects",
        "o level",
        "olevel",
        "screening",
        "matriculation",
        "school fees",
        "tuition",
        "scholarship",
        "scholarships",
        "career",
        "faculty",
        "department",
        "score",
        "exam",
        "practice",
        "study plan",
        "cgpa",
        "medicine",
        "nursing",
        "engineering",
        "law",
        "computer science",
        "cut off mark",
        "jamb score",
        "waec result",
        "post utme score",
        "lasu",
        "unilag",
        "oau",
        "ui",
        "abu",
        "adekunle",
        "babcock",
        "covenant",
    }

    BLOCKED_PATTERNS = {
        "football",
        "arsenal",
        "chelsea",
        "barcelona",
        "real madrid",
        "coach",
        "manager",
        "premier league",
        "laliga",
        "la liga",
        "champions league",
        "movie",
        "music",
        "celebrity",
        "politics",
        "president",
        "crypto",
        "bitcoin",
        "ethereum",
        "relationship",
        "dating",
        "weather",
        "news",
    }

    CASUAL_GREETINGS = {
        "hi",
        "hello",
        "hey",
        "yo",
        "good morning",
        "good afternoon",
        "good evening",
        "how are you",
        "how far",
        "sup",
        "what's up",
        "whats up",
    }

    LIGHT_CONVERSATIONAL_MESSAGES = {
        "thanks",
        "thank you",
        "okay",
        "ok",
        "alright",
        "nice",
        "good",
        "great",
    }

    SHORT_FOLLOW_UP_MESSAGES = {
        "yes",
        "yeah",
        "yep",
        "sure",
        "okay",
        "ok",
        "alright",
        "no",
        "nope",
        "go on",
        "continue",
        "tell me more",
        "more",
        "why",
        "how",
        "which one",
        "that one",
        "this one",
        "explain",
    }

    REFUSAL_MESSAGE = (
        "I can only help with JAMB, WAEC, NECO, Post-UTME, "
        "university admission, courses, scholarships, and exam preparation."
    )

    AI_FALLBACK_MESSAGE = (
        "The AI advisor is temporarily unavailable. Please try again later."
    )

    def __init__(self, db: AsyncSession):
        self.db = db

    def _normalize_text(self, text: str) -> str:
        return re.sub(r"\s+", " ", (text or "").strip().lower())

    def _extract_first_name(self, full_name: Optional[str]) -> str:
        if not full_name:
            return "there"
        return full_name.strip().split()[0]

    def _is_casual_greeting(self, message: str) -> bool:
        return self._normalize_text(message) in self.CASUAL_GREETINGS

    def _is_light_conversational_message(self, message: str) -> bool:
        return self._normalize_text(message) in self.LIGHT_CONVERSATIONAL_MESSAGES

    def _is_short_follow_up_message(self, message: str) -> bool:
        return self._normalize_text(message) in self.SHORT_FOLLOW_UP_MESSAGES

    def _last_assistant_message_asked_question(self, history: List[dict]) -> bool:
        if not history:
            return False

        for item in reversed(history):
            if item.get("role") == "assistant":
                content = (item.get("content") or "").strip()
                return "?" in content

        return False

    def _is_contextual_follow_up(self, message: str, history: List[dict], context: str) -> bool:
        if context in {"career", "exam_prep", "performance"}:
            return True

        if not history:
            return False

        text = self._normalize_text(message)

        if self._is_short_follow_up_message(text):
            return True

        if len(text.split()) <= 6:
            return True

        if self._last_assistant_message_asked_question(history):
            return True

        return False

    def _is_admission_related(
        self,
        message: str,
        context: str = "admission",
        history: Optional[List[dict]] = None,
    ) -> bool:
        text = self._normalize_text(message)

        if context in {"career", "exam_prep", "performance"}:
            return True

        if self._is_casual_greeting(message) or self._is_light_conversational_message(message):
            return True

        if history and self._is_contextual_follow_up(message, history, context):
            return True

        if any(term in text for term in self.BLOCKED_PATTERNS):
            return False

        return any(term in text for term in self.ALLOWED_KEYWORDS)

    def _build_greeting_response(self, student_ctx: dict, message: str) -> str:
        first_name = self._extract_first_name(student_ctx.get("student_name"))
        text = self._normalize_text(message)

        if text == "good morning":
            return (
                f"Good morning {first_name}. What would you like help with today: "
                f"JAMB, WAEC, admission, scholarships, or course selection?"
            )

        if text == "good afternoon":
            return (
                f"Good afternoon {first_name}. What would you like help with today: "
                f"JAMB, WAEC, admission, scholarships, or course selection?"
            )

        if text == "good evening":
            return (
                f"Good evening {first_name}. What would you like help with today: "
                f"JAMB, WAEC, admission, scholarships, or course selection?"
            )

        if text in {"how are you", "how far", "sup", "what's up", "whats up"}:
            return (
                f"Hello {first_name}. I'm doing well. What would you like help with today: "
                f"admission, course selection, JAMB, or scholarships?"
            )

        return (
            f"Hello {first_name}. What would you like help with today: "
            f"admission, JAMB, WAEC, scholarships, or course selection?"
        )

    def _build_light_conversation_response(self, student_ctx: dict, message: str) -> str:
        first_name = self._extract_first_name(student_ctx.get("student_name"))
        text = self._normalize_text(message)

        if text in {"thanks", "thank you"}:
            return f"You're welcome, {first_name}. What else would you like help with?"

        if text in {"okay", "ok", "alright"}:
            return f"Alright, {first_name}. What would you like help with next?"

        if text in {"nice", "good", "great"}:
            return f"Glad to hear that, {first_name}. What else would you like help with?"

        return f"Alright, {first_name}. What would you like help with next?"

    def _history_fingerprint(self, history: List[dict], limit: int = 4) -> str:
        recent = history[-limit:] if history else []
        compact = "||".join(
            f"{item.get('role', '')}:{self._normalize_text(item.get('content', ''))}"
            for item in recent
        )
        return compact

    def _build_cache_key(
        self,
        user_id: int,
        context: str,
        message: str,
        history: List[dict],
    ) -> str:
        normalized = self._normalize_text(message)
        history_fp = self._history_fingerprint(history)
        digest = hashlib.md5(
            f"{user_id}:{context}:{normalized}:{history_fp}".encode()
        ).hexdigest()
        return f"advisor_chat:{digest}"

    def _response_has_question(self, text: str) -> bool:
        return "?" in (text or "").strip()

    def _build_dynamic_follow_up(self, student_ctx: dict, message: str, context: str) -> str:
        text = self._normalize_text(message)
        selected_course = student_ctx.get("selected_course")
        selected_university = student_ctx.get("selected_university")
        weak_topics = student_ctx.get("top_weak_topics") or []
        jamb_best = student_ctx.get("jamb_best")

        if context == "performance":
            if weak_topics:
                return f"Do you want me to build a study plan for {weak_topics[0]} next?"
            return "Do you want me to turn this into a 2-week study plan?"

        if context == "career":
            return "Would you like me to suggest courses and universities that match your interests?"

        if "scholarship" in text:
            return "Do you want scholarships based on your target course or your target university?"

        if "cut off" in text or "cutoff" in text or "cut-off" in text:
            if selected_course and selected_university:
                return f"Do you also want me to compare this with other schools offering {selected_course}?"
            return "Do you want me to compare cut-off marks across different universities too?"

        if "subject combination" in text or "subjects" in text:
            return "Do you want me to also list the WAEC subjects you should have for that course?"

        if "course" in text or "courses" in text:
            if jamb_best is not None:
                return f"Do you want course options that match your JAMB score of {jamb_best}?"
            return "Do you want me to suggest courses based on your strengths and interests?"

        if "university" in text or "universities" in text:
            if selected_course:
                return f"Do you want universities that are strong for {selected_course}?"
            return "Do you want me to narrow the universities by course or by location?"

        if "waec" in text:
            return "Do you want me to check whether your WAEC subjects fit your intended course?"

        if "jamb" in text:
            if jamb_best is not None:
                return f"Do you want advice based on your current JAMB score of {jamb_best}?"
            return "Do you want help with target scores or subject combination for JAMB?"

        if selected_course and selected_university:
            return f"Do you want me to explain your chances for {selected_course} at {selected_university}?"

        return "Would you like me to guide you on the next best step for your admission plan?"

    def _ensure_follow_up_question(
        self,
        response_text: str,
        student_ctx: dict,
        message: str,
        context: str,
    ) -> str:
        cleaned = (response_text or "").strip()

        if not cleaned:
            return cleaned

        if cleaned == self.REFUSAL_MESSAGE:
            return cleaned

        if cleaned == self.AI_FALLBACK_MESSAGE:
            return cleaned

        if self._response_has_question(cleaned):
            return cleaned

        follow_up = self._build_dynamic_follow_up(student_ctx, message, context)
        return f"{cleaned}\n\n{follow_up}"

    async def _save_and_return_response(
        self,
        conv: AdvisorConversation,
        message: str,
        response_text: str,
        student_ctx: dict,
        title: Optional[str] = None,
    ) -> ChatResponse:
        user_msg = AdvisorMessage(
            conversation_id=conv.id,
            role="user",
            content=message,
        )
        self.db.add(user_msg)
        await self.db.flush()

        ai_msg = AdvisorMessage(
            conversation_id=conv.id,
            role="assistant",
            content=response_text,
        )
        self.db.add(ai_msg)

        if not conv.title:
            conv.title = title or message[:60] + ("..." if len(message) > 60 else "")

        await self.db.commit()
        await self.db.refresh(ai_msg)

        return ChatResponse(
            conversation_id=conv.id,
            message_id=ai_msg.id,
            response=response_text,
            context_used={
                "journey_stage": student_ctx.get("journey_stage"),
                "jamb_score": student_ctx.get("jamb_best"),
                "weak_topics": student_ctx.get("top_weak_topics"),
                "career_interests": student_ctx.get("career_interests"),
            },
        )
    async def chat(
        self,
        user_id: int,
        message: str,
        context: str = "admission",
        conversation_id: Optional[int] = None,
    ) -> ChatResponse:
        conv = await self._get_or_create_conversation(user_id, context, conversation_id)

        student_ctx = await build_student_context(user_id, self.db)
        system_prompt = build_system_prompt(student_ctx, context)
        history = await self._load_history(conv.id, limit=10)

        normalized_message = self._normalize_text(message)

        if not history and normalized_message in self.SHORT_FOLLOW_UP_MESSAGES:
            latest_conv = (
                await self.db.execute(
                    select(AdvisorConversation).where(
                        AdvisorConversation.user_id == user_id,
                        AdvisorConversation.context == context,
                        AdvisorConversation.is_active == True,
                    ).order_by(AdvisorConversation.updated_at.desc())
                )
            ).scalars().first()

            if latest_conv and latest_conv.id != conv.id:
                conv = latest_conv
                history = await self._load_history(conv.id, limit=10)

        if self._is_casual_greeting(message):
            greeting_response = self._build_greeting_response(student_ctx, message)
            return await self._save_and_return_response(
                conv=conv,
                message=message,
                response_text=greeting_response,
                student_ctx=student_ctx,
                title="Greeting",
            )

        if self._is_light_conversational_message(message):
            light_response = self._build_light_conversation_response(student_ctx, message)
            return await self._save_and_return_response(
                conv=conv,
                message=message,
                response_text=light_response,
                student_ctx=student_ctx,
                title="Conversation",
            )

        # IMPORTANT: handle short follow-up replies BEFORE scope check and BEFORE AI call
        if normalized_message in self.SHORT_FOLLOW_UP_MESSAGES and history:
            first_name = self._extract_first_name(student_ctx.get("student_name"))

            if normalized_message in {"no", "nope"}:
                if context == "career":
                    ai_response = (
                        f"Alright {first_name}. In that case, we can explore other career paths "
                        f"that better match your results and strengths. Would you like me to suggest "
                        f"alternative careers and courses for you?"
                    )
                elif context == "performance":
                    ai_response = (
                        f"Alright {first_name}. Instead of that option, we can focus on practical ways "
                        f"to improve your weak areas. Would you like me to create a simple study plan for you?"
                    )
                else:
                    ai_response = (
                        f"Alright {first_name}. In that case, we can explore other options based on your "
                        f"results. Would you like suggestions for courses or universities that better match your score?"
                    )

            elif normalized_message in {"yes", "yeah", "yep", "sure"}:
                if context == "career":
                    ai_response = (
                        f"Great {first_name}. Would you like me to suggest careers first or courses and universities first?"
                    )
                elif context == "performance":
                    ai_response = (
                        f"Great {first_name}. Would you like me to focus on your weak topics first or give you a full study plan?"
                    )
                else:
                    ai_response = (
                        f"Great {first_name}. Would you like me to focus on course options, university options, or both?"
                    )

            elif normalized_message in {"why", "how", "explain"}:
                ai_response = (
                    f"Sure {first_name}. I can explain it more clearly based on your results. "
                    f"Would you like a simple explanation or a detailed breakdown?"
                )

            else:
                ai_response = (
                    f"Alright {first_name}. Let's continue from your previous question. "
                    f"Would you like me to guide you on the next best option?"
                )

            return await self._save_and_return_response(
                conv=conv,
                message=message,
                response_text=ai_response,
                student_ctx=student_ctx,
            )

        if not self._is_admission_related(message, context, history):
            return await self._save_and_return_response(
                conv=conv,
                message=message,
                response_text=self.REFUSAL_MESSAGE,
                student_ctx=student_ctx,
            )

        cache_key = self._build_cache_key(user_id, context, message, history)
        cached_response = await Cache.get(cache_key)

        if isinstance(cached_response, dict):
            ai_response = cached_response.get("response")
        else:
            ai_response = None

        if not ai_response:
            try:
                ai_response = await call_ai(
                    system_prompt=system_prompt,
                    messages=history + [{"role": "user", "content": message}],
                )

                ai_response = self._ensure_follow_up_question(
                    response_text=ai_response,
                    student_ctx=student_ctx,
                    message=message,
                    context=context,
                )

                await Cache.set(
                    cache_key,
                    {"response": ai_response},
                    ttl=ADVISOR_CHAT_CACHE_TTL,
                )
            except Exception as e:
                logger.exception("AI advisor chat failed for user_id=%s: %s", user_id, str(e))
                ai_response = self.AI_FALLBACK_MESSAGE
        else:
            ai_response = self._ensure_follow_up_question(
                response_text=ai_response,
                student_ctx=student_ctx,
                message=message,
                context=context,
            )

        return await self._save_and_return_response(
            conv=conv,
            message=message,
            response_text=ai_response,
            student_ctx=student_ctx,
        )

    async def analyze_performance(self, user_id: int, attempt_id: int) -> ChatResponse:
        from app.modules.exams.model import ExamAttempt

        attempt = (
            await self.db.execute(
                select(ExamAttempt).where(
                    ExamAttempt.id == attempt_id,
                    ExamAttempt.student_id == user_id,
                )
            )
        ).scalars().first()

        if not attempt:
            raise HTTPException(status_code=404, detail="Exam attempt not found")

        topic_breakdown = attempt.topic_scores or {}
        weak_topics = attempt.weak_topics or []

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
        existing = (
            await self.db.execute(
                select(CareerAssessment).where(CareerAssessment.user_id == user_id)
            )
        ).scalars().first()

        resp_summary = "\n".join([
            f"Response {i + 1}: {r}"
            for i, r in enumerate(responses[:50])
        ])

        student_ctx = await build_student_context(user_id, self.db)
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

        try:
            raw = await call_ai(
                system_prompt=system_prompt,
                messages=[{"role": "user", "content": assessment_prompt}],
                max_tokens=600,
            )
        except Exception as e:
            logger.exception("Career assessment AI call failed for user_id=%s: %s", user_id, str(e))
            raw = self.AI_FALLBACK_MESSAGE

        try:
            clean = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
            data = json.loads(clean)
        except Exception:
            data = {
                "recommended_careers": ["To be determined"],
                "recommended_courses": [],
                "waec_subjects_needed": ["English Language", "Mathematics"],
                "jamb_subjects_needed": ["English Language", "Mathematics"],
                "summary": raw[:500],
            }

        if existing:
            existing.raw_responses = responses
            existing.recommended_careers = data.get("recommended_careers", [])
            existing.recommended_courses = data.get("recommended_courses", [])
            existing.waec_subjects_needed = data.get("waec_subjects_needed", [])
            existing.jamb_subjects_needed = data.get("jamb_subjects_needed", [])
            existing.summary = data.get("summary", "")
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
        assessment = (
            await self.db.execute(
                select(CareerAssessment).where(CareerAssessment.user_id == user_id)
            )
        ).scalars().first()

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
        return (
            await self.db.execute(
                select(AdvisorConversation).where(
                    AdvisorConversation.user_id == user_id,
                    AdvisorConversation.is_active == True,
                ).order_by(AdvisorConversation.updated_at.desc())
            )
        ).scalars().all()

    async def get_conversation(
        self, user_id: int, conversation_id: int
    ) -> AdvisorConversation:
        from sqlalchemy.orm import selectinload

        conv = (
            await self.db.execute(
                select(AdvisorConversation)
                .options(selectinload(AdvisorConversation.messages))
                .where(
                    AdvisorConversation.id == conversation_id,
                    AdvisorConversation.user_id == user_id,
                )
            )
        ).scalars().first()

        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return conv

    async def delete_conversation(self, user_id: int, conversation_id: int):
        conv = await self.get_conversation(user_id, conversation_id)
        conv.is_active = False
        await self.db.commit()

    async def _get_or_create_conversation(
        self,
        user_id: int,
        context: str,
        conversation_id: Optional[int],
    ) -> AdvisorConversation:
        if conversation_id:
            result = await self.db.execute(
                select(AdvisorConversation).where(
                    AdvisorConversation.id == conversation_id,
                    AdvisorConversation.user_id == user_id,
                    AdvisorConversation.is_active == True,
                )
            )
            conv = result.scalars().first()
            if conv:
                return conv

        latest_active = (
            await self.db.execute(
                select(AdvisorConversation).where(
                    AdvisorConversation.user_id == user_id,
                    AdvisorConversation.context == context,
                    AdvisorConversation.is_active == True,
                ).order_by(AdvisorConversation.updated_at.desc())
            )
        ).scalars().first()

        if latest_active:
            return latest_active

        conv = AdvisorConversation(
            user_id=user_id,
            context=context,
            is_active=True,
        )
        self.db.add(conv)
        await self.db.flush()
        return conv

    async def _load_history(self, conversation_id: int, limit: int = 10) -> List[dict]:
        messages = (
            await self.db.execute(
                select(AdvisorMessage)
                .where(AdvisorMessage.conversation_id == conversation_id)
                .order_by(AdvisorMessage.created_at.desc())
                .limit(limit)
            )
        ).scalars().all()

        return [{"role": m.role, "content": m.content} for m in reversed(messages)]