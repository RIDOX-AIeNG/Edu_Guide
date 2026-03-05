import enum


class JourneyStage(str, enum.Enum):
    """
    Global phase gate for each student.
    Advances automatically when a stage is successfully completed.

    onboarding → waec → jamb → post_utme → admitted → completed
    """
    onboarding = "onboarding"  # Just registered
    waec       = "waec"        # Actively in WAEC
    jamb       = "jamb"        # WAEC passed (5 credits); JAMB unlocked
    post_utme  = "post_utme"   # JAMB score >= cutoff; POST-UTME unlocked
    admitted   = "admitted"    # POST-UTME passed; ADMITTED
    completed  = "completed"   # Full journey done


class ClassLevel(str, enum.Enum):
    SS1 = "SS1"
    SS2 = "SS2"
    SS3 = "SS3"


class ExamType(str, enum.Enum):
    waec      = "waec"
    jamb      = "jamb"
    post_utme = "post_utme"
    practice  = "practice"


class AttemptStatus(str, enum.Enum):
    in_progress = "in_progress"
    completed   = "completed"
    abandoned   = "abandoned"


class Difficulty(str, enum.Enum):
    easy   = "easy"
    medium = "medium"
    hard   = "hard"

