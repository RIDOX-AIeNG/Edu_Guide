import json
import logging
import re
from datetime import date, datetime
from typing import Any, List, Optional

from openai import OpenAI
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.modules.scholarships.models import Scholarship
from app.modules.advisor.context_builder import build_student_context
from app.modules.scholarships.alert_models import ScholarshipAlert
from app.modules.advisor.context_builder import build_student_context
from app.modules.auth.model import User


logger = logging.getLogger(__name__)


class ScholarshipService:
    TRUSTED_DOMAINS = [
        "scholarshipregion.com",
        "opportunitiesforafricans.com",
        "scholars4dev.com",
        "daad.de",
        "commonwealthscholarships.org",
        "myschool.ng",
        "mtn.ng",
        "seplatenergy.com",
        "nlng.com",
        "nnpclimited.com",
        "fsb.gov.ng",
        "education.gov.ng",
    ]

    def __init__(self, db: AsyncSession):
        self.db = db
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None

    async def get_banner_scholarships(self, limit: int = 5) -> List[Scholarship]:
        result = await self.db.execute(
            select(Scholarship)
            .where(Scholarship.is_active == True)
            .order_by(
                Scholarship.is_urgent.desc(),
                Scholarship.deadline.asc().nullslast(),
                Scholarship.created_at.desc(),
            )
        )
        rows = result.scalars().all()

        seen_urls = set()
        unique_rows = []

        for row in rows:
            key = self._normalize_url(row.apply_url)
            if not key or key in seen_urls:
                continue

            seen_urls.add(key)
            unique_rows.append(row)

            if len(unique_rows) >= limit:
                break

        return unique_rows
    

    async def get_banner_scholarships_for_user(self, user_id: int, limit: int = 5):

        student_ctx = await build_student_context(user_id, self.db)

        result = await self.db.execute(
            select(Scholarship).where(Scholarship.is_active == True)
        )

        rows = result.scalars().all()

        scored = []

        course = (student_ctx.get("selected_course") or "").lower()
        interests = student_ctx.get("career_interests") or []
        interests = [i.lower() for i in interests]

        for row in rows:

            score = 0

            title = (row.title or "").lower()
            desc = (row.description or "").lower()

            # urgent scholarships first
            if row.is_urgent:
                score += 5

            # course relevance
            if course and course in desc:
                score += 5

            # STEM boost
            if "engineering" in course or "computer" in course:
                if "technology" in desc or "stem" in desc:
                    score += 4

            # interest match
            for interest in interests:
                if interest in desc:
                    score += 3

            scored.append((score, row))

        scored.sort(key=lambda x: x[0], reverse=True)

        return [r[1] for r in scored[:limit]]
    
    async def get_recommended_scholarships_for_user(self, user_id: int, limit: int = 10):
        student_ctx = await build_student_context(user_id, self.db)

        result = await self.db.execute(
            select(Scholarship).where(Scholarship.is_active == True)
        )
        rows = result.scalars().all()

        scored = []

        course = (student_ctx.get("selected_course") or "").lower()
        interests = student_ctx.get("career_interests") or []
        if isinstance(interests, str):
            interests = [interests]
        interests = [i.lower() for i in interests]

        weak_topics = student_ctx.get("top_weak_topics") or []
        weak_topics = [w.lower() for w in weak_topics]

        jamb_best = student_ctx.get("jamb_best")

        for row in rows:
            score = 0

            title = (row.title or "").lower()
            desc = (row.description or "").lower()
            eligibility = (row.eligibility or "").lower()
            category = (row.category or "").lower()

            if row.is_urgent:
                score += 5

            if category == "undergraduate":
                score += 3

            if course:
                if course in desc or course in eligibility or course in title:
                    score += 6

            for interest in interests:
                if interest and (interest in desc or interest in title or interest in eligibility):
                    score += 4

            if "engineering" in course or "computer" in course or "technology" in course:
                if "stem" in desc or "technology" in desc or "engineering" in desc:
                    score += 4

            if weak_topics:
                for topic in weak_topics:
                    if topic in desc:
                        score += 1

            if jamb_best is not None and category == "undergraduate":
                score += 2

            scored.append((score, row))

        scored.sort(key=lambda x: x[0], reverse=True)

        seen_urls = set()
        recommended = []

        for _, row in scored:
            key = self._normalize_url(row.apply_url)
            if not key or key in seen_urls:
                continue

            seen_urls.add(key)
            recommended.append(row)

            if len(recommended) >= limit:
                break

        return recommended
    
        

    async def list_active_scholarships(self, category: Optional[str] = None) -> List[Scholarship]:
        q = select(Scholarship).where(Scholarship.is_active == True)

        if category:
            q = q.where(Scholarship.category == category)

        q = q.order_by(
            Scholarship.is_urgent.desc(),
            Scholarship.deadline.asc().nullslast(),
            Scholarship.created_at.desc(),
        )

        result = await self.db.execute(q)
        rows = result.scalars().all()

        seen_urls = set()
        unique_rows = []

        for row in rows:
            key = self._normalize_url(row.apply_url)
            if not key or key in seen_urls:
                continue

            seen_urls.add(key)
            unique_rows.append(row)

        return unique_rows

    async def deactivate_expired(self) -> int:
        today = date.today()

        result = await self.db.execute(
            select(Scholarship).where(
                Scholarship.is_active == True,
                Scholarship.deadline.is_not(None),
                Scholarship.deadline < today,
            )
        )
        expired_rows = result.scalars().all()

        for row in expired_rows:
            row.is_active = False
            row.updated_at = datetime.utcnow()

        await self.db.commit()
        return len(expired_rows)

    async def remove_existing_duplicates(self) -> int:
        result = await self.db.execute(
            select(Scholarship).order_by(
                Scholarship.created_at.asc(),
                Scholarship.id.asc(),
            )
        )
        rows = result.scalars().all()

        seen = {}
        deleted = 0

        for row in rows:
            key = self._dedupe_key(row.title, row.apply_url)
            if not key:
                continue

            if key in seen:
                await self.db.delete(row)
                deleted += 1
            else:
                seen[key] = row.id

        await self.db.commit()
        return deleted

    async def upsert_scholarships(self, items: list[dict[str, Any]]) -> dict[str, int]:
        created_ids = []
        created = 0
        updated = 0

        existing_result = await self.db.execute(select(Scholarship))
        existing_rows = existing_result.scalars().all()

        existing_map = {}
        for row in existing_rows:
            key = self._dedupe_key(row.title, row.apply_url)
            if key and key not in existing_map:
                existing_map[key] = row

        for item in items:
            raw_title = (item.get("title") or "").strip()
            raw_url = (item.get("apply_url") or "").strip()

            if not raw_title or not raw_url:
                continue

            key = self._dedupe_key(raw_title, raw_url)
            if not key:
                continue

            existing = existing_map.get(key)

            payload = {
                "title": self._clean_display_title(raw_title)[:300],
                "provider": (item.get("provider") or "Unknown").strip()[:200],
                "description": item.get("description"),
                "amount": item.get("amount"),
                "deadline": self._parse_date(item.get("deadline")),
                "eligibility": item.get("eligibility"),
                "apply_url": self._normalize_url(raw_url)[:500],
                "category": self._clean_category(item.get("category")),
                "country": (item.get("country") or "Nigeria").strip()[:50],
                "is_active": True,
                "is_urgent": self._compute_urgent(item.get("deadline")),
            }

            if existing:
                for field, value in payload.items():
                    setattr(existing, field, value)
                existing.updated_at = datetime.utcnow()
                updated += 1
            else:
                scholarship = Scholarship(**payload)
                self.db.add(scholarship)
                await self.db.flush()
                created_ids.append(scholarship.id)
                existing_map[key] = scholarship
                created += 1

        await self.db.commit()

        alerts_created = await self.generate_alerts_for_new_scholarships(created_ids)

        deleted_duplicates = await self.remove_existing_duplicates()

        return {
            "created": created,
            "updated": updated,
            "deleted_duplicates": deleted_duplicates,
            "alerts_created": alerts_created,
        }

    async def refresh_scholarships_with_openai(self) -> dict[str, Any]:
        if not self.client:
            raise ValueError("OPENAI_API_KEY is not configured")

        prompt = self._build_refresh_prompt()

        if hasattr(self.client, "responses"):
            response = self.client.responses.create(
                model=getattr(settings, "AI_MODEL", None) or "gpt-4.1-mini",
                tools=[{"type": "web_search"}],
                input=prompt,
            )
            text_output = getattr(response, "output_text", None)
        else:
            response = self.client.chat.completions.create(
                model=getattr(settings, "AI_MODEL", None) or "gpt-4.1-mini",
                messages=[{"role": "user", "content": prompt}],
            )
            text_output = response.choices[0].message.content if response.choices else None

        if not text_output:
            raise ValueError("OpenAI returned no text output")

        data = self._extract_json(text_output)
        items = data.get("scholarships", [])

        normalized_items = []
        for item in items:
            normalized = self._normalize_item(item)
            if normalized:
                normalized_items.append(normalized)

        upsert_result = await self.upsert_scholarships(normalized_items)
        expired_count = await self.deactivate_expired()

        return {
            "fetched": len(normalized_items),
            "created": upsert_result["created"],
            "updated": upsert_result["updated"],
            "deleted_duplicates": upsert_result["deleted_duplicates"],
            "alerts_created": upsert_result["alerts_created"],
            "expired_deactivated": expired_count,
            "ran_at": datetime.utcnow().isoformat(),
        }

    def _build_refresh_prompt(self) -> str:
        trusted = ", ".join(self.TRUSTED_DOMAINS)
        today = date.today().isoformat()

        return f"""
Find recent and currently active scholarships relevant to Nigerian students.

Today is {today}.

Priorities:
- Nigerian undergraduate scholarships
- Nigerian postgraduate scholarships
- STEM scholarships for Nigerian students
- scholarships with current or upcoming deadlines
- official scholarship pages or reputable scholarship/news websites

Prefer these domains when possible:
{trusted}

Return ONLY valid JSON with this exact shape:
{{
  "scholarships": [
    {{
      "title": "string",
      "provider": "string",
      "description": "short factual summary",
      "amount": "string or null",
      "deadline": "YYYY-MM-DD or null",
      "eligibility": "string or null",
      "apply_url": "https://...",
      "category": "undergraduate|postgraduate|general|international|local",
      "country": "Nigeria"
    }}
  ]
}}

Rules:
- Include only items with a real URL.
- Exclude clearly expired scholarships.
- Keep descriptions short and factual.
- Do not invent scholarships.
- Focus on the latest or still-open opportunities.
- Prefer Nigerian undergraduate scholarships first, then postgraduate opportunities.
"""

    def _normalize_item(self, item: dict[str, Any]) -> Optional[dict[str, Any]]:
        title = (item.get("title") or "").strip()
        url = self._normalize_url(item.get("apply_url"))

        if not title or not url:
            return None

        if not re.match(r"^https?://", url):
            return None

        return {
            "title": self._clean_display_title(title)[:300],
            "provider": (item.get("provider") or "Unknown")[:200],
            "description": item.get("description"),
            "amount": item.get("amount"),
            "deadline": item.get("deadline"),
            "eligibility": item.get("eligibility"),
            "apply_url": url[:500],
            "category": self._clean_category(item.get("category")),
            "country": (item.get("country") or "Nigeria")[:50],
        }

    def _clean_display_title(self, raw: Optional[str]) -> str:
        value = re.sub(r"\s+", " ", (raw or "").strip())
        if not value:
            return ""
        return value

    def _normalize_title(self, raw: Optional[str]) -> str:
        return re.sub(r"\s+", " ", (raw or "").strip().lower())

    def _normalize_url(self, raw: Optional[str]) -> str:
        if not raw:
            return ""
        return raw.strip().rstrip("/").lower()

    def _dedupe_key(self, title: Optional[str], apply_url: Optional[str]) -> str:
        normalized_title = self._normalize_title(title)
        normalized_url = self._normalize_url(apply_url)

        if not normalized_title or not normalized_url:
            return ""

        return f"{normalized_title}|{normalized_url}"

    def _clean_category(self, raw: Optional[str]) -> str:
        value = (raw or "general").strip().lower()
        allowed = {"undergraduate", "postgraduate", "general", "international", "local"}
        return value if value in allowed else "general"

    def _compute_urgent(self, raw_deadline: Optional[str]) -> bool:
        parsed = self._parse_date(raw_deadline)
        if not parsed:
            return False

        delta = (parsed - date.today()).days
        return 0 <= delta <= 21

    def _parse_date(self, raw: Optional[str]) -> Optional[date]:
        if not raw:
            return None

        if isinstance(raw, date):
            return raw

        raw = str(raw).strip()
        if not raw:
            return None

        for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%Y/%m/%d"):
            try:
                return datetime.strptime(raw, fmt).date()
            except ValueError:
                pass

        return None

    def _extract_json(self, text_output: str) -> dict[str, Any]:
        cleaned = text_output.strip()

        if cleaned.startswith("```"):
            cleaned = cleaned.removeprefix("```json").removeprefix("```").strip()
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3].strip()

        return json.loads(cleaned)
    
    def _score_scholarship_for_student(self, scholarship: Scholarship, student_ctx: dict) -> int:
        score = 0

        course = (student_ctx.get("selected_course") or "").lower()
        interests = student_ctx.get("career_interests") or []
        if isinstance(interests, str):
            interests = [interests]
        interests = [i.lower() for i in interests]

        title = (scholarship.title or "").lower()
        desc = (scholarship.description or "").lower()
        eligibility = (scholarship.eligibility or "").lower()
        category = (scholarship.category or "").lower()

        if scholarship.is_urgent:
            score += 5

        if category == "undergraduate":
            score += 3

        if course and (course in title or course in desc or course in eligibility):
            score += 6

        for interest in interests:
            if interest and (interest in title or interest in desc or interest in eligibility):
                score += 4

        if "engineering" in course or "computer" in course or "technology" in course:
            if "stem" in desc or "technology" in desc or "engineering" in desc:
                score += 4

        return score
    

    def _build_match_reason(self, scholarship, student_ctx):
        reasons = []

        interest = (student_ctx.get("career_interests") or "").lower()
        text = f"{scholarship.title} {scholarship.description} {scholarship.eligibility}".lower()

        if scholarship.is_urgent:
            reasons.append("The scholarship deadline is approaching.")

        if scholarship.category == "undergraduate":
            reasons.append("It supports undergraduate students preparing for university.")

        if interest and interest in text:
            reasons.append(f"It relates to your interest in {interest}.")

        if not reasons:
            reasons.append("It is open to Nigerian students and may still be worth reviewing.")

        return reasons


    async def generate_alerts_for_new_scholarships(self, scholarship_ids: list[int]) -> int:
        if not scholarship_ids:
            return 0

        users_result = await self.db.execute(select(User).where(User.is_active == True))
        users = users_result.scalars().all()

        scholarships_result = await self.db.execute(
            select(Scholarship).where(Scholarship.id.in_(scholarship_ids))
        )
        scholarships = scholarships_result.scalars().all()

        created_alerts = 0

        for user in users:
            student_ctx = await build_student_context(user.id, self.db)

            for scholarship in scholarships:
                score = self._score_scholarship_for_student(scholarship, student_ctx)
                logger.debug(
                    "[ALERT DEBUG] user_id=%s scholarship_id=%s title='%s' score=%s course=%s interests=%s",
                    user.id,
                    scholarship.id,
                    scholarship.title,
                    score,
                    student_ctx.get("selected_course"),
                    student_ctx.get("career_interests"),
                )
    

                if score < 3:
                    continue

                existing = (
                    await self.db.execute(
                        select(ScholarshipAlert).where(
                            ScholarshipAlert.user_id == user.id,
                            ScholarshipAlert.scholarship_id == scholarship.id,
                        )
                    )
                ).scalars().first()

                if existing:
                    continue

                alert = ScholarshipAlert(
                    user_id=user.id,
                    scholarship_id=scholarship.id,
                    is_read=False,
                )
                self.db.add(alert)
                created_alerts += 1

        await self.db.commit()
        return created_alerts