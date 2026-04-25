"""
Database connector: fetches found_reports from Insforge REST API.
"""

import logging
import os
import requests
from datetime import datetime

from .ranker import FoundItem

logger = logging.getLogger(__name__)

INSFORGE_URL = os.getenv("INSFORGE_DB_BASE_URL", "https://nj978ng4.us-east.insforge.app/api/db")
INSFORGE_KEY = os.getenv("INSFORGE_DB_API_KEY") or os.getenv("INSFORGE_API_KEY")


def _headers() -> dict:
    if not INSFORGE_KEY:
        return {
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }

    return {
        "apikey": INSFORGE_KEY,
        "Authorization": f"Bearer {INSFORGE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

def fetch_active_found_reports() -> list[FoundItem]:
    """
    Retrieve all active found-item reports from Insforge REST API.
    """
    try:
        url = f"{INSFORGE_URL}/found_reports?status=eq.active&order=created_at.desc"
        resp = requests.get(url, headers=_headers(), timeout=10)
        resp.raise_for_status()
        rows = resp.json()

        items: list[FoundItem] = []
        for row in rows:
            items.append(
                FoundItem(
                    id=row.get("id"),
                    description=row.get("description", ""),
                    category=row.get("category", "other"),
                    color=row.get("color"),
                    location_found=row.get("location_found", ""),
                    time_found=_parse_dt(row.get("time_found")),
                    finder_contact=row.get("finder_contact", ""),
                )
            )
        logger.info(f"Fetched {len(items)} active found reports from Insforge DB.")
        return items
    except Exception as e:
        logger.error(f"Insforge fetch error: {e}")
        return []

def save_match_results(lost_report_id: str, candidates: list) -> None:
    """
    Persist match results into the match_results table in Insforge.
    """
    if not candidates:
        return

    payloads = []
    for c in candidates:
        payloads.append({
            "lost_report_id": lost_report_id,
            "found_report_id": c.found_report_id,
            "confidence_score": c.confidence_score,
            "explanation": c.explanation,
            "feature_scores": c.feature_scores,
        })

    try:
        url = f"{INSFORGE_URL}/match_results"
        resp = requests.post(url, json=payloads, headers=_headers(), timeout=10)
        resp.raise_for_status()
        logger.info(f"Saved {len(candidates)} match results to Insforge for {lost_report_id}.")
    except Exception as e:
        logger.error(f"Insforge save error: {e}")


def _parse_dt(value) -> datetime:
    if not value:
        return datetime.utcnow()
    if isinstance(value, datetime):
        return value
    if isinstance(value, str):
        # Handle 'Z' -> '+00:00'
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    return datetime.utcnow()
