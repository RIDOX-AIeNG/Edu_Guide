"""
Thin wrapper around OpenAI 
Switch providers via .env:  AI_PROVIDER=openai
"""
from typing import List, Dict
from app.core.config import settings


async def call_ai(
    system_prompt:  str,
    messages:       List[Dict],  
    max_tokens:     int = 800,
) -> str:
    """
    Call the configured LLM and return its response text.
    messages should NOT include the system prompt — that is passed separately.
    """
    if settings.AI_PROVIDER =="openai":
        return await _call_openai(system_prompt, messages, max_tokens)   


async def _call_openai(
    system_prompt: str,
    messages:      List[Dict],
    max_tokens:    int,
) -> str:
    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        full_messages = [{"role": "system", "content": system_prompt}] + messages
        response = await client.chat.completions.create(
            model=settings.AI_MODEL,
            messages=full_messages,
            max_tokens=max_tokens,
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"[AI Error] Could not generate response: {str(e)}. Please check your OPENAI_API_KEY in .env"
