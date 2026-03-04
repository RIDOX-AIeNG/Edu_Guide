"""
WAEC grading scale and JAMB score conversion utilities.
"""

# WAEC grade boundaries (percentage → grade)
WAEC_THRESHOLDS = [
    (75, "A1"),
    (70, "B2"),
    (65, "B3"),
    (60, "C4"),
    (55, "C5"),
    (50, "C6"),   # ← C6 is the minimum CREDIT grade
    (45, "D7"),
    (40, "E8"),
    (0,  "F9"),
]

CREDIT_GRADES = {"A1", "B2", "B3", "C4", "C5", "C6"}


def get_waec_grade(pct: float) -> str:
    """Convert percentage to WAEC letter grade."""
    for threshold, grade in WAEC_THRESHOLDS:
        if pct >= threshold:
            return grade
    return "F9"


def is_credit(grade: str) -> bool:
    """Return True if grade is A1–C6 (credit or distinction)."""
    return grade in CREDIT_GRADES


def percentage_to_jamb_score(correct: int, total: int) -> int:
    """Scale raw correct count → JAMB 0–400 score."""
    if total == 0:
        return 0
    return round((correct / total) * 400)


def compute_topic_breakdown(answers_with_questions: list) -> dict:
    """
    Build per-topic performance map.

    answers_with_questions: list of tuples (ExamAnswer ORM, Question ORM, topic_name: str)
    The third element is the pre-loaded topic name string — avoids lazy relationship access.
    Returns: {topic_name: {"correct": int, "total": int, "percentage": float}}
    """
    topic_map: dict = {}
    for item in answers_with_questions:
        # Support both old (answer, question) and new (answer, question, topic_name) tuples
        if len(item) == 3:
            answer, question, topic_name = item
        else:
            answer, question = item
            # Fallback: use topic_id as string, never touch .topic relationship
            topic_name = f"Topic {question.topic_id}" if question.topic_id else "General"

        if topic_name not in topic_map:
            topic_map[topic_name] = {"correct": 0, "total": 0}
        topic_map[topic_name]["total"] += 1
        if answer.is_correct:
            topic_map[topic_name]["correct"] += 1

    for name, data in topic_map.items():
        data["percentage"] = (
            round(data["correct"] / data["total"] * 100, 1)
            if data["total"] > 0 else 0.0
        )
    return topic_map


def get_weak_topics(topic_breakdown: dict, threshold: float = 60.0) -> list:
    """Return topic names where student scored below threshold %."""
    return [
        topic for topic, data in topic_breakdown.items()
        if data["percentage"] < threshold
    ]
