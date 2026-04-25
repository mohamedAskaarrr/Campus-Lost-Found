"""
Composite ranker: runs the full matching pipeline for a given lost report.
"""

import logging
from datetime import datetime
from dataclasses import dataclass

from .vectorizer import get_vectorizer
from .scorer import (
    score_category,
    score_color,
    score_location,
    score_time,
    composite_score,
)
from .explainer import generate_explanation

logger = logging.getLogger(__name__)

TOP_K = 5
MIN_SCORE_THRESHOLD = 0.05  # filter out completely irrelevant matches


@dataclass
class LostItem:
    id: str
    description: str
    category: str
    color: str | None
    location_lost: str
    time_lost: datetime


@dataclass
class FoundItem:
    id: str
    description: str
    category: str
    color: str | None
    location_found: str
    time_found: datetime
    finder_contact: str


@dataclass
class MatchCandidate:
    found_report_id: str
    confidence_score: float
    explanation: str
    feature_scores: dict[str, float]


def rank_matches(
    lost: LostItem,
    found_items: list[FoundItem],
    top_k: int = TOP_K,
) -> list[MatchCandidate]:
    """
    Run the full matching pipeline:
      1. CSP pre-filter  (temporal + category hard constraints)
      2. TF-IDF text similarity
      3. Individual feature scoring
      4. Weighted composite score
      5. Sort descending, return top-K

    Args:
        lost: The lost item report to match against.
        found_items: All candidate found-item reports.
        top_k: Number of top matches to return.

    Returns:
        List of MatchCandidate sorted by confidence_score descending.
    """
    if not found_items:
        return []

    # Prepare vectorizer — fit on all descriptions for best TF-IDF quality
    vectorizer = get_vectorizer()
    all_descriptions = [lost.description] + [f.description for f in found_items]
    vectorizer.fit(all_descriptions)

    # Batch compute text similarities in one pass (efficient)
    found_descriptions = [f.description for f in found_items]
    text_scores = vectorizer.batch_similarity(lost.description, found_descriptions)

    candidates: list[MatchCandidate] = []

    for i, found in enumerate(found_items):
        # ── CSP Hard Constraints ──────────────────────────────────
        # Temporal constraint: item cannot be found before it was lost
        if found.time_found < lost.time_lost:
            logger.debug(f"CSP filtered {found.id}: found before lost")
            continue

        # ── Feature Scores ────────────────────────────────────────
        feature_scores = {
            "text": text_scores[i],
            "category": score_category(lost.category, found.category),
            "color": score_color(lost.color, found.color),
            "location": score_location(lost.location_lost, found.location_found),
            "time": score_time(lost.time_lost, found.time_found),
        }

        score = composite_score(feature_scores)

        if score < MIN_SCORE_THRESHOLD:
            continue  # Skip noise

        explanation = generate_explanation(feature_scores, lost, found)

        candidates.append(
            MatchCandidate(
                found_report_id=found.id,
                confidence_score=round(score, 4),
                explanation=explanation,
                feature_scores=feature_scores,
            )
        )

    # Sort descending by confidence
    candidates.sort(key=lambda c: c.confidence_score, reverse=True)
    return candidates[:top_k]
