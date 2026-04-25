# 🎓 Campus Lost & Found

<div align="center">

![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square)
![Python](https://img.shields.io/badge/Python-3.8+-blue?style=flat-square)
![Flask](https://img.shields.io/badge/Flask-2.0+-red?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

*🔍 AI-Powered Lost & Found Matching System for Campus Communities*

[Features](#-features) • [Quick Start](#-quick-start) • [Installation](#-installation) • [Architecture](#-architecture)

</div>

---

## ✨ Features

> 🤖 **Smart Matching Engine**
- ML-powered category prediction with TF-IDF vectorization
- Semantic similarity matching using cosine similarity
- Multi-factor scoring (description, category, location, color, date)
- Real-time confidence scoring

> 🎯 **User-Friendly Interface**
- Beautiful, animated UI with Glassmorphism design
- Three modes: Find Matches, Submit Report, Browse Records
- Auto-category detection for descriptions
- Responsive design (mobile-friendly)
- Smooth animations & transitions

> 📊 **Data Intelligence**
- CSV-based persistent storage
- Neural Network classifier (MLP) for item categorization
- Advanced matching algorithm with weighted signals
- Statistics tracking for lost/found items

> 🚀 **API-First Architecture**
- RESTful API endpoints
- CORS-enabled for cross-origin requests
- JSON-based request/response

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.8+** installed
- **pip** (Python package manager)

### One-Command Setup

```bash
# 1. Clone/Navigate to the project directory
cd campus-lost-and-found

# 2. Create virtual environment (recommended)
python -m venv venv

# 3. Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# 4. Install all dependencies
pip install -r requirements.txt

# 5. Run the backend
python app.py

# 6. Open in browser
# Frontend: http://localhost:5050 (will be served)
# Or open index.html in your browser
```

Backend runs on: **http://localhost:5050**

---

## 📦 Installation

### Step-by-Step Setup

#### 1️⃣ **Clone Repository**
```bash
git clone <repo-url>
cd Campus-Lost-Found
```

#### 2️⃣ **Create Virtual Environment**
```bash
python -m venv venv

# Activate it:
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

#### 3️⃣ **Install Dependencies**
```bash
pip install -r requirements.txt
```

#### 4️⃣ **Run the Application**
```bash
python app.py
```

#### 5️⃣ **Access the UI**
- Open `index.html` in your browser, OR
- Modify `app.py` to serve static files (see section below)

---

## 📋 Required Packages

| Package | Version | Purpose |
|---------|---------|---------|
| **Flask** | 2.0+ | Web framework for backend API |
| **Flask-CORS** | 3.0+ | Enable cross-origin requests |
| **pandas** | 1.3+ | Data manipulation & CSV handling |
| **numpy** | 1.21+ | Numerical computations |
| **scikit-learn** | 1.0+ | ML models (TF-IDF, cosine similarity, MLP classifier) |

### Complete Dependencies (requirements.txt)

```
Flask==2.3.0
Flask-CORS==4.0.0
pandas==2.0.0
numpy==1.24.0
scikit-learn==1.3.0
```

### Install from requirements.txt
```bash
pip install -r requirements.txt
```

### Or install individually
```bash
pip install Flask Flask-CORS pandas numpy scikit-learn
```

---

## 🏗️ Architecture

### Backend (Flask + ML)
```
app.py
├── Data Loading (CSV files)
├── ML Classifier Training (TF-IDF + MLP)
├── Matching Engine
└── API Routes
    ├── /api/reports       [GET]   - Get all reports
    ├── /api/match         [POST]  - Find matches
    ├── /api/submit        [POST]  - Submit new report
    └── /api/stats         [GET]   - Get statistics
```

### Frontend (HTML + Vanilla JS)
```
index.html
├── Header (Logo + Stats)
├── Tab Navigation
├── Three Views:
│   ├── Find Matches (with smart search)
│   ├── Submit Report (with auto-detection)
│   └── Browse Records (with filtering)
└── Animations & Styling (pure CSS)
```

### Data Layer
```
CSV Files:
├── lost_items.csv         - Reported lost items
├── found_items.csv        - Reported found items
└── classifier_training_data.csv - Training dataset for ML model
```

---

## 📡 API Endpoints

### 1. Get All Reports
```bash
GET /api/reports
```
**Response:**
```json
{
  "lost": [...],
  "found": [...]
}
```

### 2. Find Matches
```bash
POST /api/match
Content-Type: application/json

{
  "description": "black Sony headphones",
  "category": "Headphones",
  "color": "black",
  "location": "Library",
  "date": "2024-01-17",
  "mode": "lost"
}
```

**Response:**
```json
{
  "matches": [...],
  "predicted_category": "Headphones",
  "category_confidence": 0.95,
  "auto_category_used": false
}
```

### 3. Submit Report
```bash
POST /api/submit
Content-Type: application/json

{
  "type": "lost",
  "description": "Blue umbrella",
  "category": "Accessories",
  "color": "blue",
  "location": "Cafeteria",
  "date": "2024-01-17",
  "contact": "student@sewedy.edu.eg"
}
```

### 4. Get Statistics
```bash
GET /api/stats
```
**Response:**
```json
{
  "total_lost": 15,
  "total_found": 20,
  "categories": ["ID Card", "Charger", ...],
  "locations": ["Library", "Cafeteria", ...]
}
```

---

## 🎨 Features Breakdown

### Smart Matching Algorithm
- **Text Similarity** (35%): TF-IDF + Cosine Similarity
- **Category Match** (30%): Exact category bonus
- **Location Match** (20%): Exact location bonus
- **Color Match** (15%): Color string matching
- **Date Proximity** (10%): Days difference scoring

### ML Category Prediction
- **Vectorizer**: TF-IDF with bigrams
- **Model**: Multi-Layer Perceptron (64→32 neurons)
- **Training Data**: Pre-labeled item descriptions
- **Output**: Category prediction + confidence score

### UI Animations
- ✨ Floating orb backgrounds
- 🎭 Fade-in entrance animations
- 🔄 Smooth tab transitions
- 🎯 Hover effects on cards
- 📊 Confidence bars with animations

---

## 🛠️ Development

### Directory Structure
```
campus-lost-and-found/
├── app.py                           # Flask backend
├── index.html                       # Frontend UI
├── lost_items.csv                   # Lost items data
├── found_items.csv                  # Found items data
├── classifier_training_data.csv     # ML training data
├── requirements.txt                 # Python dependencies
└── README.md                        # This file
```

### Customization

#### Change Port
In `app.py` line 206:
```python
if __name__ == "__main__":
    app.run(debug=True, port=5000)  # Change 5050 to your port
```

#### Update Categories/Locations
Edit lines 29-31 in `app.py`:
```python
CATEGORIES = ["ID Card", "Charger", "Bottle", ...]
LOCATIONS = ["Library", "Cafeteria", ...]
```

#### Serve Frontend from Flask
Add this to `app.py`:
```python
from flask import send_from_directory

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)
```

---

## 🚀 Deployment

### Option 1: Heroku
```bash
# Create Procfile:
echo "web: python app.py" > Procfile

# Deploy:
heroku create your-app-name
git push heroku main
```

### Option 2: Railway.app
```bash
# Connect your GitHub repo to Railway
# Set start command: python app.py
# Railway auto-detects Python
```

### Option 3: PythonAnywhere
- Upload files via web dashboard
- Set up Web app with Flask
- Configure WSGI file

### Option 4: AWS/Google Cloud
- Use containerization (Docker)
- Deploy to App Engine or Lambda

---

## 📊 Sample Data

Pre-loaded sample data:
- **15 Lost Items**: Various categories across campus
- **20 Found Items**: Ready to match against lost reports
- **Training Data**: 50+ labeled examples for ML model

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Port 5050 already in use** | Change port in `app.py` line 206 |
| **CSV files not found** | Ensure files are in same directory as `app.py` |
| **Module not found (pandas, etc)** | Run `pip install -r requirements.txt` again |
| **CORS errors** | Flask-CORS is configured; check API URL in `index.html` line 1025 |
| **ML model not training** | Check CSV format; ensure `classifier_training_data.csv` has correct columns |

---

## 📝 License

This project is licensed under the **MIT License** - see LICENSE file for details.

---

## 👥 Contributors

- **Developer**: Campus Tech Team
- **UI/UX**: Modern Design System
- **ML Pipeline**: Scikit-learn Integration

---

<div align="center">

### 🎯 Quick Links

[Report an Issue](../../issues) • [View Source](../../) • [Discussion](../../discussions)

**Made with ❤️ for Campus Community**

</div>

---

## 🔐 Security Notes

- ✅ Input validation on API endpoints
- ✅ CORS properly configured
- ✅ No sensitive data in frontend
- ✅ CSV data is local storage only


