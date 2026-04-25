"""
Explanation generator: produces human-readable match reasoning.
"""

from dataclasses import dataclass


def generate_explanation(
    feature_scores: dict[str, float],
    lost,
    found,
) -> str:
    """
    Build a plain-language explanation string from the feature scores.
    Each triggered condition appends a sentence.
    """
    parts: list[str] = []

    text_score = feature_scores.get("text", 0.0)
    cat_score = feature_scores.get("category", 0.0)
    color_score = feature_scores.get("color", 0.0)
    loc_score = feature_scores.get("location", 0.0)
    time_score = feature_scores.get("time", 0.0)

    # Text similarity
    if text_score >= 0.7:
        parts.append(
            f"Descriptions are very similar — both mention similar details about a {found.category.replace('_', ' ')}."
        )
    elif text_score >= 0.4:
        parts.append("Descriptions share several key terms in common.")
    elif text_score >= 0.15:
        parts.append("Descriptions have some overlapping keywords.")

    # Category
    if cat_score == 1.0:
        cat_label = (lost.category or "item").replace("_", " ").title()
        parts.append(f"Both reports are categorized as {cat_label}.")
    elif cat_score == 0.0:
        parts.append(
            f"Categories differ ({lost.category.replace('_', ' ')} vs {found.category.replace('_', ' ')}) — review carefully."
        )

    # Color
    if color_score >= 0.9:
        parts.append(
            f"Item colors match: both listed as {(lost.color or 'unknown').lower()}."
        )
    elif color_score >= 0.6:
        parts.append(
            f"Colors are similar ({(lost.color or '?').lower()} / {(found.color or '?').lower()})."
        )

    # Location
    if loc_score >= 0.5:
        parts.append(
            f"Both linked to the same area ({found.location_found})."
        )
    elif loc_score >= 0.2:
        parts.append("Locations share some common keywords.")

    # Time
    if time_score >= 0.8:
        parts.append("Item was found very shortly after it was reported lost.")
    elif time_score >= 0.5:
        parts.append("Found within a reasonable timeframe after the loss was reported.")
    elif time_score >= 0.1:
        parts.append("Some time has passed between the loss and discovery dates.")

    if not parts:
        parts.append("Low similarity overall — please verify manually before contacting.")

    return " ".join(parts)
