from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import LabelEncoder
from datetime import datetime
import os

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# ─── Load Data from CSV Files ─────────────────────────────────────────────────

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

lost_df  = pd.read_csv(os.path.join(BASE_DIR, "lost_items.csv"))
found_df = pd.read_csv(os.path.join(BASE_DIR, "found_items.csv"))
train_df = pd.read_csv(os.path.join(BASE_DIR, "classifier_training_data.csv"))

lost_df.fillna("", inplace=True)
found_df.fillna("", inplace=True)

lost_reports  = lost_df.to_dict(orient="records")
found_reports = found_df.to_dict(orient="records")

CATEGORIES = ["ID Card", "Charger", "Bottle", "Notebook", "Headphones", "Keys"]
LOCATIONS  = ["Library", "Cafeteria", "Building A", "Building B", "Sports Hall",
              "Parking Lot", "Main Gate", "Lab 3", "Lecture Hall 1", "Lecture Hall 2"]

print(f"[data] Loaded {len(lost_reports)} lost reports, "
      f"{len(found_reports)} found reports, "
      f"{len(train_df)} training samples.")

# ─── Train Neural-Network Classifier (MLP) ───────────────────────────────────

label_enc      = LabelEncoder()
y_train        = label_enc.fit_transform(train_df["label"].tolist())
cat_vectorizer = TfidfVectorizer(ngram_range=(1, 2))
X_train        = cat_vectorizer.fit_transform(train_df["description"].tolist())

clf = MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=500, random_state=42)
clf.fit(X_train, y_train)

print(f"[model] Classifier trained on {len(train_df)} samples "
      f"| classes: {list(label_enc.classes_)}")

# ─── Helper: Predict Category ────────────────────────────────────────────────

def predict_category(text: str):
    """Return (predicted_label, confidence) for a free-text description."""
    X     = cat_vectorizer.transform([text])
    proba = clf.predict_proba(X)[0]
    idx   = int(np.argmax(proba))
    return label_enc.inverse_transform([idx])[0], float(proba[idx])

# ─── Matching Engine (TF-IDF + weighted signals) ─────────────────────────────

def compute_matches(query_desc, query_location, query_color,
                    query_category, query_date, mode="lost"):
    """
    mode='lost'  → user lost something  → search found_reports
    mode='found' → user found something → search lost_reports
    """
    pool = found_reports if mode == "lost" else lost_reports

    pool_texts  = [r["description"] for r in pool]
    tfidf       = TfidfVectorizer(ngram_range=(1, 2), stop_words="english")
    matrix      = tfidf.fit_transform([query_desc] + pool_texts)
    text_scores = cosine_similarity(matrix[0], matrix[1:])[0]

    results = []
    for i, report in enumerate(pool):
        text_score  = float(text_scores[i])
        cat_bonus   = 0.30 if query_category and \
                      report["category"].lower() == query_category.lower() else 0.0
        loc_bonus   = 0.20 if query_location  and \
                      report["location"].lower()  == query_location.lower()  else 0.0
        color_bonus = 0.15 if query_color     and \
                      query_color.lower() in str(report["color"]).lower()    else 0.0
        try:
            days_diff  = abs((datetime.strptime(query_date,     "%Y-%m-%d") -
                              datetime.strptime(report["date"], "%Y-%m-%d")).days)
            date_bonus = max(0.0, 0.10 * (1 - days_diff / 30))
        except Exception:
            date_bonus = 0.0

        total_score = text_score * 0.35 + cat_bonus + loc_bonus + color_bonus + date_bonus

        reasons = []
        if text_score  > 0.20: reasons.append(f"Description similarity ({text_score:.0%})")
        if cat_bonus:           reasons.append(f"Same category: {report['category']}")
        if loc_bonus:           reasons.append(f"Same location: {report['location']}")
        if color_bonus:         reasons.append(f"Color match: {report['color']}")
        if date_bonus  > 0.05: reasons.append(f"Close date: {report['date']}")

        results.append({
            **report,
            "score":           round(total_score, 4),
            "text_similarity": round(text_score,  4),
            "reasons":         reasons if reasons else ["Low textual overlap"],
        })

    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:5]

# ─── Helper: Append new row to CSV ───────────────────────────────────────────

def append_to_csv(filepath: str, row: dict, columns: list):
    pd.DataFrame([{c: row.get(c, "") for c in columns}]).to_csv(
        filepath, mode="a", header=False, index=False
    )

# ─── API Routes ───────────────────────────────────────────────────────────────

@app.route("/api/reports", methods=["GET"])
def get_reports():
    return jsonify({"lost": lost_reports, "found": found_reports})


@app.route("/api/match", methods=["POST"])
def match():
    data     = request.json
    desc     = data.get("description", "")
    location = data.get("location",    "")
    color    = data.get("color",       "")
    category = data.get("category",    "")
    date     = data.get("date", datetime.now().strftime("%Y-%m-%d"))
    mode     = data.get("mode", "lost")

    predicted_cat, cat_confidence = predict_category(desc)
    if not category:
        category = predicted_cat

    matches = compute_matches(desc, location, color, category, date, mode)

    return jsonify({
        "matches":             matches,
        "predicted_category":  predicted_cat,
        "category_confidence": round(cat_confidence, 3),
        "auto_category_used":  not bool(data.get("category", "")),
    })


@app.route("/api/submit", methods=["POST"])
def submit():
    data        = request.json
    report_type = data.get("type", "lost")

    predicted_cat, conf = predict_category(data.get("description", ""))

    if report_type == "lost":
        new_report = {
            "id":          f"L{len(lost_reports) + 1:03d}",
            "category":    data.get("category") or predicted_cat,
            "description": data.get("description", ""),
            "location":    data.get("location",    ""),
            "date":        data.get("date", datetime.now().strftime("%Y-%m-%d")),
            "color":       data.get("color", ""),
            "contact":     data.get("contact", ""),
        }
        lost_reports.append(new_report)
        append_to_csv(
            os.path.join(BASE_DIR, "lost_items.csv"),
            new_report,
            ["id", "category", "description", "location", "date", "color", "contact"],
        )
    else:
        new_report = {
            "id":          f"F{len(found_reports) + 1:03d}",
            "category":    data.get("category") or predicted_cat,
            "description": data.get("description", ""),
            "location":    data.get("location",    ""),
            "date":        data.get("date", datetime.now().strftime("%Y-%m-%d")),
            "color":       data.get("color", ""),
            "finder":      data.get("finder", "anonymous"),
        }
        found_reports.append(new_report)
        append_to_csv(
            os.path.join(BASE_DIR, "found_items.csv"),
            new_report,
            ["id", "category", "description", "location", "date", "color", "finder"],
        )

    return jsonify({
        "success":            True,
        "report":             new_report,
        "predicted_category": predicted_cat,
        "confidence":         round(conf, 3),
    })


@app.route("/api/stats", methods=["GET"])
def stats():
    return jsonify({
        "total_lost":  len(lost_reports),
        "total_found": len(found_reports),
        "categories":  CATEGORIES,
        "locations":   LOCATIONS,
    })


# ─── Frontend Routes ─────────────────────────────────────────────────────────

@app.route('/')
def serve_index():
    """Serve the main index.html page"""
    return send_from_directory('.', 'index.html')


@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static files (CSS, JS, etc)"""
    return send_from_directory('.', filename)


# ─── Application Entry Point ──────────────────────────────────────────────────

if __name__ == "__main__":
    # Use environment variable for port (Railway sets PORT env var)
    # Default to 5050 for local development
    port = int(os.environ.get('PORT', 5050))
    debug = os.environ.get('FLASK_ENV') != 'production'

    app.run(debug=debug, host='0.0.0.0', port=port)