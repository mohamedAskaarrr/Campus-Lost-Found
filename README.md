# Campus Lost-and-Found Matcher

An AI-assisted lost & found web application for university campuses that automatically matches reported lost items with found items using NLP, similarity scoring, and explainable feature-based ranking.

## Table of Contents
- Project concept
- Key features
- Architecture & Tech stack
- Quick start
- Data & database
- Testing
- Contributing
- Contact

## Project concept

Students and campus staff report lost and found items through a simple UI. The system analyzes the reports (text description, category, color, location, and time) and returns ranked candidate matches with a confidence score and a human-readable explanation. This reduces manual effort and speeds up reunifications.

## Key features
- Natural language matching (TF-IDF + cosine similarity)
- Multi-feature scoring (category, color, location, time)
- Explainable match explanations and per-feature scores
- Responsive React frontend with a polished UI
- Modular Python AI engine (FastAPI) that can be extended with classifiers
- Seed data and simple deployment configuration

## Architecture & Tech stack

- Frontend: React (Vite), Tailwind CSS, Zustand for state
- AI Engine: Python 3.11+, FastAPI, scikit-learn, pandas
- Backend schema: Insforge (schema + migration), PostgreSQL-compatible
- Dev tooling: pytest for tests, GitHub Actions for CI

High-level flow:
1. User submits a lost/found report via frontend.
2. API persists the report to the database.
3. Matching pipeline vectorizes text, computes similarity, combines feature scores, and stores match_results.
4. Frontend displays ranked matches with explanations.

## Quick start

Prerequisites:
- Node.js 18+
- Python 3.11+
- PostgreSQL (or use Insforge-hosted DB)

Frontend (local):
```bash
cd frontend
npm install
npm run dev
```

AI Engine (local):
```bash
cd ai-engine
python -m venv venv
venv\Scripts\activate   # Windows
# or: source venv/bin/activate  # macOS / Linux
pip install -r requirements.txt
python main.py
```

Notes:
- Frontend expects an API endpoint (set in `frontend/src/api/client.js`). Update environment or the client to point to your running AI engine/API.
- Use `database/seed_data.json` to populate sample reports for demos.

## Data & database

- `database/seed_data.json`: sample lost/found reports for local testing.
- `backend/insforge/migration.sql` and `backend/insforge/schema.json`: schema and migration steps for the production backend.

Typical tables:
- `lost_reports` / `found_reports` — report metadata and description
- `match_results` — stored results with `confidence_score`, `explanation`, and `feature_scores` (JSON)

## Testing

Unit tests (AI engine):
```bash
cd ai-engine
pytest tests/
```

Integration (manual):
1. Run frontend + AI engine
2. Submit a lost report via the UI
3. Check DB for stored report and `match_results`

Goal metrics:
- Precision@3 ≥ 70% for initial model

## Contributing

This repository is used as a course project. If you'd like to contribute:
1. Fork the repo and create a feature branch
2. Add tests for new behavior
3. Open a pull request describing your change

Please keep changes focused and add or update tests when modifying matching logic.

## Contact

Project: Campus Lost-and-Found Matcher
Maintainer: course project contributors

For questions or help with running locally, open an issue in this repository.

