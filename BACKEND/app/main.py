from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from app.core.config import settings
from app.modules.auth.router         import router as auth_router
from app.modules.exams.router        import router as exams_router
from app.modules.practice.router     import router as practice_router
from app.modules.universities.router import router as universities_router
from app.modules.advisor.router      import router as advisor_router
from app.modules.dashboard.router    import router as dashboard_router
from app.modules.admin.router        import router as admin_router
from app.modules.admission_guide.router import router as admission_guide_router
from app.modules.admin.router       import router as admin_router
from app.modules.admission_guide.router import router as admission_guide_router
from app.modules.scholarships.router import router as scholarships_router



from app.core.rate_limit import limiter, rate_limit_handler
from slowapi.errors import RateLimitExceeded

#app.state.limiter = limiter
#app.add_exception_handler(RateLimitExceeded, rate_limit_handler)


app = FastAPI(
    title="EduGuide API",
    version="1.0.0",
    description=(
        "Nigerian educational platform: WAEC → JAMB → POST-UTME → Admission. "
        "Unified AI Advisor accessible at every stage."
    ),
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(auth_router,         prefix=f"{settings.API_V1_STR}/auth",         tags=["Auth"])
app.include_router(exams_router,        prefix=f"{settings.API_V1_STR}/exams",         tags=["Exams"])
app.include_router(practice_router,     prefix=f"{settings.API_V1_STR}/practice",      tags=["Practice"])
app.include_router(universities_router, prefix=f"{settings.API_V1_STR}/universities",  tags=["Universities"])
app.include_router(advisor_router,      prefix=f"{settings.API_V1_STR}/advisor",       tags=["AI Advisor"])
app.include_router(dashboard_router,    prefix=f"{settings.API_V1_STR}/student",       tags=["Student Dashboard"])
app.include_router(admin_router,        prefix=f"{settings.API_V1_STR}/admin",         tags=["Admin"])
app.include_router(admission_guide_router, prefix=f"{settings.API_V1_STR}/admission-guide", tags=["Admission Guide"])
app.include_router(admission_guide_router, prefix=f"{settings.API_V1_STR}/admission-guide", tags=["Admission Guide"])
app.include_router(practice_router, prefix=f"{settings.API_V1_STR}/practice", tags=["Practice"])
app.include_router(scholarships_router, prefix=f"{settings.API_V1_STR}/scholarships",  tags=["Scholarships"])


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "platform": "EduGuide", "version": "1.0.0"}


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    schema = get_openapi(title="EduGuide API", version="1.0.0", routes=app.routes)
    schema.setdefault("components", {}).setdefault("securitySchemes", {})["BearerAuth"] = {
        "type": "http", "scheme": "bearer", "bearerFormat": "JWT",
    }
    app.openapi_schema = schema
    return app.openapi_schema

app.openapi = custom_openapi

# For local development, run with: uvicorn app.main:app --reload