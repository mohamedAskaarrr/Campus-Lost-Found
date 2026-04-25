"""
Individual feature scorers for the matching pipeline.

Weights (per PDR §5.2):
  text description : 0.40
  item category    : 0.25
  color            : 0.15
  location         : 0.12
  time proximity   : 0.08
"""

from datetime import datetime, timezone
from difflib import SequenceMatcher
import math
import re

WEIGHTS = {
    "text": 0.40,
    "category": 0.25,
    "color": 0.15,
    "location": 0.12,
    "time": 0.08,
}

# ──────────────────────────────────────────────
# 1. Category scorer
# ──────────────────────────────────────────────

def score_category(lost_cat: str, found_cat: str) -> float:
    """
    Returns 1.0 for exact category match, 0.0 otherwise.
    """
    if not lost_cat or not found_cat:
        return 0.5  # unknown → neutral
    return 1.0 if lost_cat.strip().lower() == found_cat.strip().lower() else 0.0


# ──────────────────────────────────────────────
# 2. Color scorer
# ──────────────────────────────────────────────

# Normalized color aliases
_COLOR_ALIASES: dict[str, str] = {
    "grey": "gray",
    "scarlet": "red",
    "crimson": "red",
    "navy": "blue",
    "aqua": "cyan",
    "violet": "purple",
    "magenta": "pink",
    "beige": "white",
    "cream": "white",
    "ivory": "white",
    "charcoal": "gray",
    "gold": "yellow",
    "lime": "green",
    "teal": "green",
    "maroon": "red",
    "olive": "green",
    "coral": "orange",
    "salmon": "orange",
    "khaki": "yellow",
    "silver": "gray",
    "midnight": "black",
}


def _normalize_color(color: str) -> str:
    c = color.strip().lower()
    return _COLOR_ALIASES.get(c, c)


def score_color(lost_color: str | None, found_color: str | None) -> float:
    """
    Fuzzy color match. Returns float in [0.0, 1.0].
    Returns 0.5 if either color is unknown (neutral).
    """
    if not lost_color or not found_color:
        return 0.5  # neutral — can't penalize for missing info

    lc = _normalize_color(lost_color)
    fc = _normalize_color(found_color)

    if lc == fc:
        return 1.0

    # Fuzzy match via SequenceMatcher
    ratio = SequenceMatcher(None, lc, fc).ratio()
    return float(ratio)


# ──────────────────────────────────────────────
# 3. Location scorer
# ──────────────────────────────────────────────

_STOP_WORDS = {"the", "a", "an", "in", "on", "at", "of", "and", "or", "near", "by", "from"}


def _tokenize_location(text: str) -> set[str]:
    tokens = re.findall(r"[a-z0-9]+", text.lower())
    return {t for t in tokens if t not in _STOP_WORDS and len(t) > 1}


def score_location(lost_loc: str, found_loc: str) -> float:
    """
    Token-overlap Jaccard similarity between location strings.
    Returns float in [0.0, 1.0].
    """
    if not lost_loc or not found_loc:
        return 0.0

    a_tokens = _tokenize_location(lost_loc)
    b_tokens = _tokenize_location(found_loc)

    if not a_tokens or not b_tokens:
        return 0.0

    intersection = a_tokens & b_tokens
    union = a_tokens | b_tokens
    return len(intersection) / len(union)


# ──────────────────────────────────────────────
# 4. Time proximity scorer
# ──────────────────────────────────────────────

_MAX_HOURS = 7 * 24  # 7 days → score decays to 0


def _to_utc(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def score_time(time_lost: datetime, time_found: datetime) -> float:
    """
    Temporal proximity score. Found date must be >= lost date (hard constraint).
    Score decays linearly from 1.0 (instant) to 0.0 at 7 days.
    Returns 0.0 if found before lost (impossible match).
    """
    if not time_lost or not time_found:
        return 0.5  # neutral

    tl = _to_utc(time_lost)
    tf = _to_utc(time_found)

    delta_hours = (tf - tl).total_seconds() / 3600

    if delta_hours < 0:
        return 0.0  # CSP violation: item found before it was lost

    # Exponential decay — feel more natural than linear
    score = math.exp(-delta_hours / (_MAX_HOURS / 3))
    return float(max(0.0, min(1.0, score)))


# ──────────────────────────────────────────────
# 5. Composite scorer
# ──────────────────────────────────────────────

def composite_score(feature_scores: dict[str, float]) -> float:
    """
    Compute weighted composite score.
    S = Σ(weight_i × score_i)
    """
    return sum(WEIGHTS[k] * feature_scores.get(k, 0.0) for k in WEIGHTS)
