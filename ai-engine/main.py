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
# Startup: seed demo found reports
# This makes matching work immediately in demos.
# ──────────────────────────────────────────────

@app.on_event("startup")
def seed_demo_data():
    DEMO_FOUND = [
        # ID Cards
        {"category":"id_card",    "description":"Found a blue university student ID card near the cafeteria. Has a photo and student number. Slight scratch on the corner.","color":"blue",   "location_found":"Main Cafeteria Building A","time_found":"2024-03-10T11:00:00Z","finder_contact":"omar.khalil@sewedy.edu.eg"},
        {"category":"id_card",    "description":"Found a white student ID card with green stripe. Found near the administrative building.","color":"white",  "location_found":"Administrative Building Corridor","time_found":"2024-03-13T11:00:00Z","finder_contact":"amr.wael@sewedy.edu.eg"},
        {"category":"id_card",    "description":"Blue university ID card found near library turnstiles. Has barcode and photo. Says student ID on it.","color":"blue",   "location_found":"Library Main Entrance","time_found":"2024-03-15T11:00:00Z","finder_contact":"youssef.mahmoud@sewedy.edu.eg"},
        # Chargers
        {"category":"charger",    "description":"Found a black MacBook charger USB-C in the engineering lab. Has white tape wrapping near the adapter end.","color":"black",  "location_found":"Engineering Lab Room 301","time_found":"2024-03-10T14:00:00Z","finder_contact":"youssef.mahmoud@sewedy.edu.eg"},
        {"category":"charger",    "description":"Dell laptop charger found in computer lab. Black adapter with blue LED ring indicator. 65W model.","color":"black",  "location_found":"Computer Lab Building C Room 205","time_found":"2024-03-13T17:00:00Z","finder_contact":"mariam.fathy@sewedy.edu.eg"},
        {"category":"charger",    "description":"Found white USB-C charging cable in lecture hall. Approximately 1 meter long. iPhone compatible.","color":"white",  "location_found":"Lecture Hall A Row 5","time_found":"2024-03-15T13:00:00Z","finder_contact":"nour.ibrahim@sewedy.edu.eg"},
        {"category":"charger",    "description":"Samsung fast charger adapter found. Black with Samsung branding. 45W output on label.","color":"black",  "location_found":"Study Room 4 Building A","time_found":"2024-03-17T12:00:00Z","finder_contact":"dina.mostafa@sewedy.edu.eg"},
        # Bottles
        {"category":"bottle",     "description":"Found a large dark blue water bottle near library study area. Has a university sticker on the side. HydroFlask brand.","color":"blue",   "location_found":"Library Study Hall Floor 2","time_found":"2024-03-11T16:00:00Z","finder_contact":"ahmed.hassan@sewedy.edu.eg"},
        {"category":"bottle",     "description":"Silver thermos found in the sports area. Has a small dent on the bottom. Keeps drinks hot.","color":"silver", "location_found":"Sports Center Near Locker Rooms","time_found":"2024-03-14T18:00:00Z","finder_contact":"dina.mostafa@sewedy.edu.eg"},
        {"category":"bottle",     "description":"Green Yeti-style insulated cup found. Has a university logo printed on it. Small dent near bottom.","color":"green",  "location_found":"Student Union Building","time_found":"2024-03-16T14:00:00Z","finder_contact":"mariam.fathy@sewedy.edu.eg"},
        # Notebooks
        {"category":"notebook",   "description":"Found a red spiral notebook in lecture hall B. Has calculus and linear algebra formulas written inside. Name written on cover.","color":"red",    "location_found":"Math Department Lecture Hall B","time_found":"2024-03-11T12:00:00Z","finder_contact":"kareem.tarek@sewedy.edu.eg"},
        {"category":"notebook",   "description":"Found a black A5 hardcover notebook. Has design sketches and senior project notes inside.","color":"black",  "location_found":"Design Studio Building D","time_found":"2024-03-14T14:00:00Z","finder_contact":"ahmed.hassan@sewedy.edu.eg"},
        {"category":"notebook",   "description":"Blue covered notebook found with physics lab reports inside. Dated weeks 1 to 6 of semester.","color":"blue",   "location_found":"Physics Lab Building B Room 110","time_found":"2024-03-16T16:00:00Z","finder_contact":"kareem.tarek@sewedy.edu.eg"},
        # Headphones
        {"category":"headphones", "description":"Found a pair of black Sony noise-cancelling headphones. Has a small colored sticker on the left ear cup. Works fine.","color":"black",  "location_found":"Library Ground Floor Entry Area","time_found":"2024-03-12T16:30:00Z","finder_contact":"sara.ali@sewedy.edu.eg"},
        {"category":"headphones", "description":"Found white AirPods in a white charging case near engineering building. Has a small dent on the case.","color":"white",  "location_found":"Engineering Building Room 104 Bench","time_found":"2024-03-15T15:00:00Z","finder_contact":"sara.ali@sewedy.edu.eg"},
        {"category":"headphones", "description":"Blue JBL wireless headphones found in library area. Fully charged. JBL logo visible on ear cups.","color":"blue",   "location_found":"Library Charging Station 2nd Row","time_found":"2024-03-16T17:00:00Z","finder_contact":"hana.samir@sewedy.edu.eg"},
        # Keys
        {"category":"keys",       "description":"Found 3 keys on a red keychain with a mini torch attached. Found near the parking area gate.","color":"red",    "location_found":"Parking Lot Gate 3","time_found":"2024-03-12T10:00:00Z","finder_contact":"nour.ibrahim@sewedy.edu.eg"},
        {"category":"keys",       "description":"Black leather keychain with Toyota logo found. Has 3 keys attached. Car key with remote fob.","color":"black",  "location_found":"Main Building Near Reception","time_found":"2024-03-15T10:00:00Z","finder_contact":"omar.khalil@sewedy.edu.eg"},
        {"category":"keys",       "description":"Orange keychain with 4 keys found in the cafeteria. One key looks like a padlock key.","color":"orange", "location_found":"Cafeteria Near Cashier Counter","time_found":"2024-03-17T13:30:00Z","finder_contact":"amr.wael@sewedy.edu.eg"},
        # Other
        {"category":"other",      "description":"Found a brown leather wallet near the ATM machine. Contains some cards but no cash. Owner should describe contents.","color":"brown",  "location_found":"Main Building ATM Area","time_found":"2024-03-18T09:00:00Z","finder_contact":"hana.samir@sewedy.edu.eg"},
    ]
    for fr in DEMO_FOUND:
        rid = str(uuid.uuid4())
        _found_reports[rid] = {
            "id": rid,
            "student_id": "demo",
            "status": "active",
            "created_at": _now(),
            **fr,
        }
    logger.info(f"Seeded {len(DEMO_FOUND)} demo found reports.")


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
