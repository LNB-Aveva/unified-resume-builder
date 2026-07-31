import re


def sanitize_for_prompt(text: str) -> str:
    """Strip common prompt injection patterns from user-supplied text."""
    text = re.sub(
        r'(?i)(ignore|forget|disregard)\s+(all\s+)?(previous|prior|above)\s+(instructions?|rules?|prompts?)',
        '',
        text,
    )
    text = re.sub(r'(?im)^\s*(system|assistant|user)\s*:', '', text)
    text = text.replace('<<<', '').replace('>>>', '')
    return text.strip()
