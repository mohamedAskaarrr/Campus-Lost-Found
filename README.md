# Campus Lost-and-Found Matcher

An AI-powered web application that intelligently matches lost items with found ones on university campuses using natural language processing and similarity scoring.

## Project Overview

This full-stack application solves the problem of manual, inefficient lost-and-found processes by:
- Accepting structured reports from students (lost and found items)
- Using TF-IDF vectorization and cosine similarity to rank potential matches
- Providing confidence scores and human-readable explanations for each match
- Supporting 6+ item categories with professional UI/UX

## Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Router v6** for navigation
- **Framer Motion** for animations
- **Lucide React** for icons
- **Axios** for API calls

### AI Engine
- **Python 3.11+**
- **FastAPI** web framework
- **scikit-learn** for NLP (TF-IDF, cosine similarity)
- **pandas** for data manipulation
- Optional: **MLPClassifier** for category prediction

### Backend & Database
- **Insforge** (insforge.dev) for backend platform
- **PostgreSQL** for data storage
- Tables: `lost_reports`, `found_reports`, `match_results`

### Deployment
- **Railway** for cloud hosting
- **GitHub Actions** for CI/CD

## Project Structure

```
.
├── frontend/              # React SPA
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable components
│   │   ├── store/        # Zustand state management
│   │   ├── api/          # API client
│   │   └── design/       # Design system
│   ├── package.json
│   └── tailwind.config.ts
├── ai-engine/            # Python FastAPI
│   ├── matcher/          # TF-IDF, similarity scoring
│   ├── classifier/       # Optional category classifier
│   ├── routes/           # API endpoints
│   ├── tests/            # Unit tests
│   ├── main.py
│   └── requirements.txt
├── backend/
│   └── insforge/         # Insforge schema definition
├── database/
│   └── seed_data.json    # Sample reports
├── docs/                 # Documentation
├── .github/workflows/    # CI/CD pipelines
├── .env.example
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL (or Insforge hosted DB)
- Git

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`

### AI Engine Setup

```bash
cd ai-engine
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

Runs on `http://localhost:8000`

## Key Features

### Primary Features
- ✅ Full-stack web application for lost/found matching
- ✅ TF-IDF + cosine similarity matching engine
- ✅ Support for 6 item categories (ID card, charger, bottle, notebook, headphones, keys)
- ✅ Human-readable match explanations
- ✅ Multi-feature scoring (text, category, color, location, time)
- ✅ 50-100 sample test reports for demo

### Secondary Features (Implemented)
- ✅ Professional, mobile-friendly UI
- ✅ Responsive design across all devices
- ✅ Live deployment on Railway

### Optional Features (Stretch Goals)
- ⏳ Category classifier (neural network)
- ⏳ Bilingual Arabic/English support
- ⏳ Duplicate report detection
- ⏳ Image upload with color extraction
- ⏳ Match notification system

## Database Schema

### lost_reports
- `id` (UUID, PK)
- `student_id` (UUID, FK)
- `category` (ENUM: id_card, charger, bottle, notebook, headphones, keys)
- `description` (TEXT)
- `color` (VARCHAR)
- `location_lost` (VARCHAR)
- `time_lost` (TIMESTAMP)
- `status` (ENUM: active, matched, closed)
- `created_at` (TIMESTAMP)

### found_reports
- Same as `lost_reports` with `location_found`, `time_found`, and `finder_contact`

### match_results
- `id` (UUID, PK)
- `lost_report_id` (UUID, FK)
- `found_report_id` (UUID, FK)
- `confidence_score` (FLOAT, 0.0-1.0)
- `explanation` (TEXT)
- `feature_scores` (JSONB)
- `created_at` (TIMESTAMP)

## Matching Algorithm

The system uses a weighted multi-feature scoring approach:

| Feature | Weight | Method |
|---------|--------|--------|
| Text Description | 0.40 | TF-IDF + Cosine Similarity |
| Item Category | 0.25 | Exact match / penalty |
| Color | 0.15 | Fuzzy string match |
| Location | 0.12 | Token overlap |
| Time Proximity | 0.08 | Temporal distance scoring |

Score = Σ(weight_i × score_i)

## Testing

### Unit Tests
```bash
cd ai-engine
pytest tests/
```

Tests cover:
- TF-IDF vectorizer
- Cosine similarity function
- Feature scoring
- Explanation generation

### Integration Tests
- Submit lost report via frontend
- Verify it appears in database
- Trigger matching pipeline
- Verify ranked results returned

### End-to-End Accuracy
Target: ≥70% precision@3 (top-3 results contain true match)

## Deployment

### Local Development
See setup instructions above.

### Railway Production
1. Push to GitHub
2. GitHub Actions triggers Railway deployment
3. Frontend deployed as static site
4. AI Engine deployed as service
5. Shared database (Insforge)

See `docs/DEPLOYMENT.md` for detailed instructions.

## Success Metrics

| Metric | Minimum | Stretch |
|--------|---------|---------|
| Sample reports | 50 | 100+ |
| Precision@3 | ≥70% | ≥85% |
| Item categories | 6 | 8+ |
| Languages | English | Arabic + English |
| Deployment | Railway | Custom domain |

## Design System

### Colors
- **Primary Blue:** #1A56DB
- **Accent Orange:** #F97316
- **Success Green:** #10B981
- **Warning Yellow:** #F59E0B
- **Neutral Dark:** #1E293B
- **Background:** #F8FAFF

### Typography
- **Font:** Inter (Google Fonts)
- **H1:** 32px, **H2:** 24px, **H3:** 18px
- **Body:** 16px / line-height 1.6

## Development Phases

1. **Phase 1:** Foundation & Project Structure (Weeks 1-2)
2. **Phase 2:** AI Engine Implementation (Weeks 3-4)
3. **Phase 3:** Frontend Core (Weeks 5-6)
4. **Phase 4:** Integration & API (Week 7)
5. **Phase 5:** UI Polish & Accessibility (Week 8)
6. **Phase 6:** Optional Classifier (Week 9)
7. **Phase 7:** Deployment (Week 10)
8. **Phase 8:** Stretch Goals (Weeks 11-12)

## Contributing

This is a course project for CET251: Artificial Intelligence at El Sewedy University of Technology.

## Resources

- [Insforge Docs](https://insforge.dev)
- [Railway Docs](https://docs.railway.app)
- [React Docs](https://react.dev)
- [FastAPI Docs](https://fastapi.tiangolo.com)
- [scikit-learn TF-IDF](https://scikit-learn.org)

## License

Academic use only - El Sewedy University of Technology, 2024/2025
