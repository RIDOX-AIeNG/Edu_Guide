# FILE: create_tables.py
# ==============================================================================
#  Place this file in your BACKEND/ folder (same level as the app/ folder):
#
#  BACKEND/
#  ├── app/
#  │   ├── main.py
#  │   ├── core/
#  │   └── modules/
#  ├── create_tables.py   ← THIS FILE GOES HERE
#  └── .env
#
#  Run from BACKEND/ folder with venv activated:
#      cd C:\Users\USER\Desktop\Edu_Guide\BACKEND
#      python create_tables.py
# ==============================================================================

import asyncio
import sys
import os


sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from sqlalchemy.ext.asyncio import create_async_engine
from app.core.database import Base
from app.core.config import settings


print("Loading models...")

from app.modules.auth.model import User, RefreshToken
print("  ✓ auth")

from app.modules.universities.model import University, Course, CutoffMark
print("  ✓ universities")

from app.modules.question.model import Subject, Topic, Question
print("  ✓ questions")

from app.modules.exams.model import ExamAttempt, ExamAnswer
print("  ✓ exams")

from app.modules.practice.model import PracticeSession
print("  ✓ practice")

from app.modules.advisor.model import AdvisorConversation, AdvisorMessage, CareerAssessment
print("  ✓ advisor")

try:
    from app.modules.scholarships.models import Scholarship
    from app.modules.scholarships.alert_models import ScholarshipAlert
    print("  ✓ scholarships")
except ImportError:
    print("  ⚠  scholarships module not found — skipping")

try:
    from app.modules.dashboard.model import AdmissionWindow
    print("  ✓ admission_windows")
except ImportError:
    pass

print()

async def create_all_tables():
    db_url = settings.DATABASE_URL
    print(f"  Connecting to: {db_url[:60]}")

    engine = create_async_engine(db_url, echo=False, future=True)

    async with engine.begin() as conn:
        print("🔨  Creating tables...\n")
        await conn.run_sync(Base.metadata.create_all)

    await engine.dispose()

    print("=" * 55)
    print("Done! Tables created:")
    for table in Base.metadata.sorted_tables:
        print(f"   ✓  {table.name}")
    print("=" * 55)
    print()
    print("Next steps:")
    print("  1. Start server:  uvicorn app.main:app --reload")
    print("  2. Seed data:     POST /api/v1/admin/seed/all")
    print("                    Header: X-Admin-Key: <ADMIN_SEED_KEY>")
    print()


if __name__ == "__main__":
    try:
        asyncio.run(create_all_tables())
    except Exception as exc:
        print(f"\n  Error: {exc}\n")
        print("Common fixes:")
        print("  • Run from BACKEND/ folder, not from inside app/")
        print("    cd C:\\Users\\USER\\Desktop\\Edu_Guide\\BACKEND")
        print("    python create_tables.py")
        print()
        print("  • Check DATABASE_URL in your .env file:")
        print("    DATABASE_URL=postgresql+asyncpg://postgres:PASSWORD@localhost:5432/eduguide")
        print()
        print("  • Make sure the database exists:")
        print("    psql -U postgres -c \"CREATE DATABASE eduguide;\"")
        print()
        print("  • Make sure asyncpg is installed:")
        print("    pip install asyncpg")
        sys.exit(1)
