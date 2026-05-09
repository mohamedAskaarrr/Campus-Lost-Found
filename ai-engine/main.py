"""
Campus Lost-and-Found AI Engine
FastAPI application for intelligent item matching
"""

import os
import uuid
import logging
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=os.getenv("LOG_LEVEL", "info").upper())
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Campus Lost-and-Found AI Engine",
    description="Intelligent matching pipeline for lost and found items",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────────
# In-Memory Store  (works without any database)
# ──────────────────────────────────────────────

_lost_reports:  dict[str, dict] = {}
_found_reports: dict[str, dict] = {}
_match_cache:   dict[str, list] = {}


def _now() -> str:
    return datetime.utcnow().isoformat() + "Z"


# ──────────────────────────────────────────────
# Pydantic Models
# ──────────────────────────────────────────────

class LostReportIn(BaseModel):
    student_id: Optional[str] = "anonymous"
    category: str
    description: str
    color: Optional[str] = None
    location_lost: str
    time_lost: str
    status: Optional[str] = "active"


class FoundReportIn(BaseModel):
    student_id: Optional[str] = "anonymous"
    category: str
    description: str
    color: Optional[str] = None
    location_found: str
    time_found: str
    finder_contact: str
    status: Optional[str] = "active"


class MatchRequest(BaseModel):
    lost_report_id: str
    description: str
    category: str
    color: Optional[str] = None
    location_lost: str
    time_lost: str


class FeatureScore(BaseModel):
    text_similarity: float
    category_match: float
    color_match: float
    location_match: float
    time_proximity: float


class MatchResult(BaseModel):
    found_report_id: str
    confidence_score: float
    explanation: str
    feature_scores: FeatureScore
    location_found: Optional[str] = None
    finder_contact: Optional[str] = None
    category: Optional[str] = None


class MatchResponse(BaseModel):
    lost_report_id: str
    matches: list[MatchResult]
    count: int


class ClassifyRequest(BaseModel):
    description: str


class ClassifyResponse(BaseModel):
    category: str
    confidence: float
    alternatives: list[dict]


# ──────────────────────────────────────────────
# Health
# ──────────────────────────────────────────────

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Campus Lost-and-Found AI Engine",
        "version": "1.0.0",
        "lost_reports": len(_lost_reports),
        "found_reports": len(_found_reports),
    }


# ──────────────────────────────────────────────
# Lost Reports CRUD
# ──────────────────────────────────────────────

@app.post("/lost-reports", status_code=201)
def create_lost_report(body: LostReportIn):
    rid = str(uuid.uuid4())
    record = {"id": rid, "created_at": _now(), **body.model_dump()}
    _lost_reports[rid] = record
    logger.info(f"Lost report created: {rid}")
    return record


@app.get("/lost-reports")
def list_lost_reports():
    return list(reversed(list(_lost_reports.values())))


@app.get("/lost-reports/{report_id}")
def get_lost_report(report_id: str):
    r = _lost_reports.get(report_id)
    if not r:
        raise HTTPException(404, "Lost report not found")
    return r


@app.delete("/lost-reports/{report_id}", status_code=204)
def delete_lost_report(report_id: str):
    if report_id not in _lost_reports:
        raise HTTPException(404, "Not found")
    del _lost_reports[report_id]


# ──────────────────────────────────────────────
# Found Reports CRUD
# ──────────────────────────────────────────────

@app.post("/found-reports", status_code=201)
def create_found_report(body: FoundReportIn):
    rid = str(uuid.uuid4())
    record = {"id": rid, "created_at": _now(), **body.model_dump()}
    _found_reports[rid] = record
    logger.info(f"Found report created: {rid}")
    return record


@app.get("/found-reports")
def list_found_reports():
    return list(reversed(list(_found_reports.values())))


@app.get("/found-reports/{report_id}")
def get_found_report(report_id: str):
    r = _found_reports.get(report_id)
    if not r:
        raise HTTPException(404, "Found report not found")
    return r


# ──────────────────────────────────────────────
# Match Results cache
# ──────────────────────────────────────────────

@app.get("/match-results/{lost_report_id}")
def get_match_results(lost_report_id: str):
    return _match_cache.get(lost_report_id, [])


# ──────────────────────────────────────────────
# Match endpoint — full AI pipeline
# ──────────────────────────────────────────────

@app.post("/match", response_model=MatchResponse)
def find_matches(request: MatchRequest):
    """Run TF-IDF + multi-feature scoring pipeline."""
    logger.info(f"Match request: {request.lost_report_id}")

    try:
        time_lost = datetime.fromisoformat(request.time_lost.replace("Z", "+00:00"))
    except ValueError:
        raise HTTPException(422, "Invalid time_lost — use ISO-8601.")

    from matcher.ranker import LostItem, FoundItem, rank_matches

    lost = LostItem(
        id=request.lost_report_id,
        description=request.description,
        category=request.category,
        color=request.color,
        location_lost=request.location_lost,
        time_lost=time_lost,
    )

    # Collect found items from both in-memory demo store and Insforge DB.
    # (The frontend writes found reports to Insforge, so DB is required for real matches.)
    found_items: list[FoundItem] = []
    found_meta: dict[str, dict] = {}

    def _add_found(item: FoundItem) -> None:
        # De-dupe by id but always refresh meta
        if item.id not in found_meta:
            found_items.append(item)
        found_meta[item.id] = {
            "location_found": item.location_found,
            "finder_contact": item.finder_contact,
            "category": item.category,
        }

    # 1) Insforge DB (real user submissions)
    db_items: list[FoundItem] = []
    try:
        from matcher.db import fetch_active_found_reports

        db_items = fetch_active_found_reports()
        for item in db_items:
            _add_found(item)
    except Exception as e:
        logger.warning(f"DB unavailable: {e}")

    # 2) Demo in-memory store (only if DB has no rows)
    if not db_items:
        for fr in _found_reports.values():
            if fr.get("status", "active") != "active":
                continue
            try:
                tf = datetime.fromisoformat(fr["time_found"].replace("Z", "+00:00"))
            except Exception:
                tf = datetime.utcnow()

            _add_found(
                FoundItem(
                    id=fr["id"],
                    description=fr.get("description", ""),
                    category=fr.get("category", "other"),
                    color=fr.get("color"),
                    location_found=fr.get("location_found", ""),
                    time_found=tf,
                    finder_contact=fr.get("finder_contact", ""),
                )
            )

    candidates = rank_matches(lost, found_items)

    if db_items:
        try:
            from matcher.db import delete_match_results, save_match_results

            delete_match_results(request.lost_report_id)
            save_match_results(request.lost_report_id, candidates)
        except Exception as e:
            logger.warning(f"Could not persist match results: {e}")

    results = []
    for c in candidates:
        meta = found_meta.get(c.found_report_id, {})
        results.append(MatchResult(
            found_report_id=c.found_report_id,
            confidence_score=c.confidence_score,
            explanation=c.explanation,
            feature_scores=FeatureScore(
                text_similarity=c.feature_scores.get("text", 0.0),
                category_match=c.feature_scores.get("category", 0.0),
                color_match=c.feature_scores.get("color", 0.0),
                location_match=c.feature_scores.get("location", 0.0),
                time_proximity=c.feature_scores.get("time", 0.0),
            ),
            location_found=meta.get("location_found"),
            finder_contact=meta.get("finder_contact"),
            category=meta.get("category"),
        ))

    _match_cache[request.lost_report_id] = [r.model_dump() for r in results]

    return MatchResponse(
        lost_report_id=request.lost_report_id,
        matches=results,
        count=len(results),
    )


# ──────────────────────────────────────────────
# Classify
# ──────────────────────────────────────────────

@app.post("/classify", response_model=ClassifyResponse)
def classify_item(request: ClassifyRequest):
    logger.info(f"Classify: '{request.description[:60]}'")

    if os.getenv("ENABLE_CLASSIFIER", "true").lower() == "true":
        try:
            from classifier.model import get_classifier
            clf = get_classifier()
            if clf.is_trained:
                return ClassifyResponse(**clf.predict(request.description))
        except Exception as e:
            logger.warning(f"Classifier error: {e}")

    desc = request.description.lower()
    keyword_map = {
        "id_card":    ["id", "card", "student card", "university id", "national id"],
        "charger":    ["charger", "cable", "adapter", "usb", "charging"],
        "bottle":     ["bottle", "water bottle", "flask", "mug", "tumbler"],
        "notebook":   ["notebook", "book", "notes", "journal", "textbook", "copy"],
        "headphones": ["headphone", "earphone", "earbud", "airpod", "headset"],
        "keys":       ["key", "keys", "keychain", "keyring"],
    }
    best_cat, best_conf = "other", 0.0
    for cat, kws in keyword_map.items():
        hits = sum(1 for kw in kws if kw in desc)
        conf = min(1.0, hits / max(len(kws), 1) * 3)
        if conf > best_conf:
            best_conf, best_cat = conf, cat

    return ClassifyResponse(category=best_cat, confidence=round(best_conf, 3), alternatives=[])


# ──────────────────────────────────────────────
# Entry point
# ──────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("FASTAPI_PORT", 8000)),
        reload=os.getenv("FASTAPI_ENV") == "development",
    )
