"""
Unit tests for the AI matching pipeline.
Run with: pytest tests/ -v
"""

import pytest
from datetime import datetime, timezone, timedelta

from matcher.vectorizer import ItemVectorizer
from matcher.scorer import (
    score_category,
    score_color,
    score_location,
    score_time,
    composite_score,
    WEIGHTS,
)
from matcher.ranker import LostItem, FoundItem, rank_matches
from matcher.explainer import generate_explanation


# ──────────────────────────────────────────────
# Fixtures
# ──────────────────────────────────────────────

NOW = datetime(2024, 3, 15, 10, 0, 0, tzinfo=timezone.utc)
LATER = NOW + timedelta(hours=2)
MUCH_LATER = NOW + timedelta(days=5)
BEFORE = NOW - timedelta(hours=1)


def make_lost(**kwargs):
    defaults = dict(
        id="lost-001",
        description="black laptop charger with frayed cable",
        category="charger",
        color="black",
        location_lost="Engineering Building Room 301",
        time_lost=NOW,
    )
    defaults.update(kwargs)
    return LostItem(**defaults)


def make_found(**kwargs):
    defaults = dict(
        id="found-001",
        description="black laptop charger with frayed cable",
        category="charger",
        color="black",
        location_found="Engineering Building Room 301",
        time_found=LATER,
        finder_contact="0123456789",
    )
    defaults.update(kwargs)
    return FoundItem(**defaults)


# ──────────────────────────────────────────────
# TF-IDF Vectorizer
# ──────────────────────────────────────────────

class TestVectorizer:
    def test_identical_texts_score_one(self):
        v = ItemVectorizer()
        text = "black laptop charger with frayed cable"
        score = v.similarity(text, text)
        assert score == pytest.approx(1.0, abs=1e-5)

    def test_completely_different_texts_score_near_zero(self):
        v = ItemVectorizer()
        score = v.similarity("red water bottle", "blue student ID card")
        assert score < 0.1

    def test_similar_texts_score_above_threshold(self):
        v = ItemVectorizer()
        score = v.similarity(
            "black laptop charger with USB cable",
            "laptop charger black color USB-C",
        )
        assert score > 0.3

    def test_empty_text_returns_zero(self):
        v = ItemVectorizer()
        assert v.similarity("", "some text") == 0.0
        assert v.similarity("some text", "") == 0.0

    def test_batch_similarity_length(self):
        v = ItemVectorizer()
        corpus = ["text one", "text two", "text three"]
        scores = v.batch_similarity("text one", corpus)
        assert len(scores) == 3
        assert scores[0] == pytest.approx(1.0, abs=1e-5)

    def test_fit_improves_corpus_similarity(self):
        v = ItemVectorizer()
        corpus = [
            "black charger laptop cable",
            "student ID card university",
            "water bottle blue flask",
        ]
        v.fit(corpus)
        score = v.similarity("black charger laptop cable", "laptop cable black charger")
        assert score > 0.5


# ──────────────────────────────────────────────
# Category Scorer
# ──────────────────────────────────────────────

class TestCategoryScorer:
    def test_exact_match_returns_one(self):
        assert score_category("charger", "charger") == 1.0

    def test_mismatch_returns_zero(self):
        assert score_category("charger", "bottle") == 0.0

    def test_case_insensitive(self):
        assert score_category("Charger", "charger") == 1.0

    def test_empty_category_returns_neutral(self):
        assert score_category("", "charger") == 0.5
        assert score_category("charger", "") == 0.5


# ──────────────────────────────────────────────
# Color Scorer
# ──────────────────────────────────────────────

class TestColorScorer:
    def test_exact_match_returns_one(self):
        assert score_color("black", "black") == 1.0

    def test_alias_normalized(self):
        assert score_color("grey", "gray") == 1.0

    def test_no_color_returns_neutral(self):
        assert score_color(None, "black") == 0.5
        assert score_color("black", None) == 0.5

    def test_different_colors_low_score(self):
        assert score_color("red", "blue") < 0.4


# ──────────────────────────────────────────────
# Location Scorer
# ──────────────────────────────────────────────

class TestLocationScorer:
    def test_identical_returns_one(self):
        assert score_location("Engineering Building", "Engineering Building") == 1.0

    def test_partial_overlap(self):
        score = score_location("Engineering Building Room 301", "Engineering Building")
        assert 0.3 < score < 1.0

    def test_no_overlap_returns_zero(self):
        score = score_location("Library Floor 2", "Sports Center Parking")
        assert score == 0.0

    def test_empty_location_returns_zero(self):
        assert score_location("", "Engineering Building") == 0.0


# ──────────────────────────────────────────────
# Time Scorer
# ──────────────────────────────────────────────

class TestTimeScorer:
    def test_found_before_lost_returns_zero(self):
        assert score_time(NOW, BEFORE) == 0.0

    def test_same_time_returns_one(self):
        score = score_time(NOW, NOW)
        assert score == pytest.approx(1.0, abs=1e-5)

    def test_two_hours_high_score(self):
        score = score_time(NOW, LATER)
        assert score > 0.7

    def test_five_days_low_score(self):
        score = score_time(NOW, MUCH_LATER)
        assert score < 0.3

    def test_none_returns_neutral(self):
        assert score_time(None, None) == 0.5


# ──────────────────────────────────────────────
# Composite Score
# ──────────────────────────────────────────────

class TestCompositeScore:
    def test_all_ones_returns_one(self):
        scores = {"text": 1.0, "category": 1.0, "color": 1.0, "location": 1.0, "time": 1.0}
        assert composite_score(scores) == pytest.approx(1.0, abs=1e-5)

    def test_all_zeros_returns_zero(self):
        scores = {"text": 0.0, "category": 0.0, "color": 0.0, "location": 0.0, "time": 0.0}
        assert composite_score(scores) == pytest.approx(0.0, abs=1e-5)

    def test_weights_sum_to_one(self):
        assert sum(WEIGHTS.values()) == pytest.approx(1.0, abs=1e-5)

    def test_text_has_highest_weight(self):
        assert WEIGHTS["text"] == max(WEIGHTS.values())


# ──────────────────────────────────────────────
# Ranker
# ──────────────────────────────────────────────

class TestRanker:
    def test_returns_empty_for_no_found_items(self):
        lost = make_lost()
        assert rank_matches(lost, []) == []

    def test_csp_filters_found_before_lost(self):
        lost = make_lost()
        found = make_found(time_found=BEFORE)
        results = rank_matches(lost, [found])
        assert results == []

    def test_identical_item_ranks_first(self):
        lost = make_lost()
        perfect = make_found(id="perfect")
        noise = make_found(
            id="noise",
            description="blue water bottle stickers",
            category="bottle",
            color="blue",
            location_found="Sports Center",
        )
        results = rank_matches(lost, [perfect, noise])
        assert results[0].found_report_id == "perfect"

    def test_returns_at_most_top_k(self):
        lost = make_lost()
        found_items = [make_found(id=f"found-{i}") for i in range(10)]
        results = rank_matches(lost, found_items, top_k=5)
        assert len(results) <= 5

    def test_results_sorted_descending(self):
        lost = make_lost()
        found_items = [
            make_found(id="a", description="black laptop charger cable frayed"),
            make_found(id="b", description="red water bottle near gym"),
            make_found(id="c", description="charger USB laptop cable"),
        ]
        results = rank_matches(lost, found_items)
        scores = [r.confidence_score for r in results]
        assert scores == sorted(scores, reverse=True)

    def test_confidence_in_valid_range(self):
        lost = make_lost()
        found = make_found()
        results = rank_matches(lost, [found])
        for r in results:
            assert 0.0 <= r.confidence_score <= 1.0

    def test_explanation_non_empty(self):
        lost = make_lost()
        found = make_found()
        results = rank_matches(lost, [found])
        assert len(results) > 0
        assert results[0].explanation != ""
