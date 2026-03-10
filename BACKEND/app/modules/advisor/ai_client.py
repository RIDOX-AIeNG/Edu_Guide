"""
Thin wrapper around OpenAI
Switch providers via .env: AI_PROVIDER=openai
"""

from typing import List, Dict
import logging
import re

from openai import AsyncOpenAI
from app.core.config import settings

logger = logging.getLogger(__name__)

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


def clean_ai_response(text: str) -> str:
    """
    Remove markdown-like formatting so frontend gets clean plain text.
    """
    if not text:
        return text

    text = text.strip()

    # Remove fenced code blocks markers
    text = text.replace("```", "")

    # Remove markdown headings like ### Title
    text = re.sub(r"^\s{0,3}#{1,6}\s*", "", text, flags=re.MULTILINE)

    # Remove bold / italic / inline code markers
    text = text.replace("**", "")
    text = text.replace("__", "")
    text = text.replace("`", "")

    # Remove bullet prefixes like -, *, •
    text = re.sub(r"^\s*[-*•]\s+", "", text, flags=re.MULTILINE)

    # Remove numbered markdown list prefixes like 1. 2. 3.
    text = re.sub(r"^\s*\d+\.\s+", "", text, flags=re.MULTILINE)

    # Collapse too many blank lines
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


async def call_ai(
    system_prompt: str,
    messages: List[Dict],
    max_tokens: int = 800,
) -> str:
    """
    Call the configured LLM and return cleaned response text.
    messages should NOT include the system prompt.
    """
    if settings.AI_PROVIDER == "openai":
        return await _call_openai(system_prompt, messages, max_tokens)

    raise ValueError(f"Unsupported AI_PROVIDER: {settings.AI_PROVIDER}")


async def _call_openai(
    system_prompt: str,
    messages: List[Dict],
    max_tokens: int,
) -> str:
    try:
        full_messages = [{"role": "system", "content": system_prompt}] + messages

        response = await client.chat.completions.create(
            model=settings.AI_MODEL,
            messages=full_messages,
            max_tokens=max_tokens,
            temperature=0.7,
        )

        raw_text = response.choices[0].message.content.strip()
        return clean_ai_response(raw_text)

    except Exception as e:
        logger.exception("OpenAI request failed: %s", str(e))
        raise