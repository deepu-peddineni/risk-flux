"""Reading time estimator — ~200 words per minute average"""


def estimate_reading_time(content: str, wpm: int = 200) -> int:
    """Return estimated reading time in minutes (minimum 1)."""
    word_count = len(content.split())
    return max(1, round(word_count / wpm))
