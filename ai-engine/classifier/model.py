"""
Category Classifier using scikit-learn MLPClassifier.
Trained on TF-IDF vectors of item descriptions.
"""

import logging
import os
import joblib
from pathlib import Path

import numpy as np
from sklearn.neural_network import MLPClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

logger = logging.getLogger(__name__)

CATEGORIES = ["id_card", "charger", "bottle", "notebook", "headphones", "keys", "other"]
MODEL_PATH = Path(__file__).parent / "saved_model.joblib"

# ──────────────────────────────────────────────
# Training data (50+ labeled descriptions)
# ──────────────────────────────────────────────

TRAINING_DATA = [
    # id_card
    ("lost my student ID card near the cafeteria", "id_card"),
    ("university ID card dropped somewhere in building A", "id_card"),
    ("national ID card missing from my wallet", "id_card"),
    ("found a student card near the library entrance", "id_card"),
    ("my student identification card is lost", "id_card"),
    ("ID badge with my photo on it", "id_card"),
    ("university access card lost", "id_card"),
    ("student card with blue lanyard", "id_card"),
    ("found white ID card near cafeteria", "id_card"),
    ("student ID with yellow stripe", "id_card"),

    # charger
    ("lost my laptop charger in the lab", "charger"),
    ("MacBook charger left in classroom 301", "charger"),
    ("USB-C charging cable missing", "charger"),
    ("found a white iPhone charger in the library", "charger"),
    ("black laptop power adapter lost", "charger"),
    ("phone charger missing from study room", "charger"),
    ("Dell laptop charger left behind in engineering lab", "charger"),
    ("USB cable and adapter lost", "charger"),
    ("charging brick with cable found near lockers", "charger"),
    ("found a phone charger in room 204", "charger"),

    # bottle
    ("lost my blue water bottle near the gym", "bottle"),
    ("stainless steel thermos left in chemistry lab", "bottle"),
    ("water bottle with stickers on it", "bottle"),
    ("found a black Stanley cup near the entrance", "bottle"),
    ("my tumbler is missing from the cafeteria", "bottle"),
    ("large green water flask lost", "bottle"),
    ("lost my HydroFlask near the vending machines", "bottle"),
    ("red and white water bottle", "bottle"),
    ("found a metal water bottle on bench", "bottle"),
    ("plastic water bottle with university logo", "bottle"),

    # notebook
    ("lost my spiral notebook with blue cover", "notebook"),
    ("engineering notes book missing from lab", "notebook"),
    ("found a black journal in the library", "notebook"),
    ("my calculus textbook is lost", "notebook"),
    ("lost blue notebook with handwritten notes", "notebook"),
    ("A4 notebook with red cover found on desk", "notebook"),
    ("missing physics notes and workbook", "notebook"),
    ("lost my lined notebook from study hall", "notebook"),
    ("found a notebook with name written inside", "notebook"),
    ("small pocket notebook lost", "notebook"),

    # headphones
    ("lost Sony WH-1000XM4 headphones in the library", "headphones"),
    ("black wireless earbuds missing", "headphones"),
    ("AirPods lost near the lecture hall", "headphones"),
    ("found white earphones on chair in room 105", "headphones"),
    ("noise-cancelling headphones left on bus", "headphones"),
    ("lost my JBL earbuds case", "headphones"),
    ("wired headset found in computer lab", "headphones"),
    ("Bluetooth headphones left at charging station", "headphones"),
    ("lost green earbuds with case", "headphones"),
    ("found black over-ear headphones near cafeteria", "headphones"),

    # keys
    ("lost my house keys near the parking lot", "keys"),
    ("key ring with car key and two other keys", "keys"),
    ("found a set of keys near gate 3", "keys"),
    ("lost keys with blue keychain", "keys"),
    ("car keys dropped somewhere in the main building", "keys"),
    ("found a keyring with many keys in the cafeteria", "keys"),
    ("dorm room key missing", "keys"),
    ("lost keys with red lanyard", "keys"),
    ("motorcycle key lost near parking area", "keys"),
    ("found single key on floor near lab", "keys"),

    # other
    ("lost my glasses in the library", "other"),
    ("found a wallet near the ATM", "other"),
    ("missing umbrella", "other"),
    ("lost my watch near the gym", "other"),
    ("found a pair of sunglasses", "other"),
    ("missing backpack from study hall", "other"),
    ("lost my calculator", "other"),
    ("found a pen drive near computer lab", "other"),
]


class ItemClassifier:
    """
    MLPClassifier trained on TF-IDF vectors to predict item category.
    """

    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            lowercase=True,
            stop_words="english",
            ngram_range=(1, 2),
            max_features=3000,
        )
        self.encoder = LabelEncoder()
        self.model = MLPClassifier(
            hidden_layer_sizes=(128, 64),
            activation="relu",
            solver="adam",
            max_iter=500,
            random_state=42,
            early_stopping=True,
        )
        self.is_trained = False

    def train(self, data: list[tuple[str, str]] = TRAINING_DATA) -> dict:
        """Train on labeled (description, category) pairs."""
        texts = [d[0] for d in data]
        labels = [d[1] for d in data]

        X = self.vectorizer.fit_transform(texts)
        y = self.encoder.fit_transform(labels)

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        self.model.fit(X_train, y_train)
        self.is_trained = True

        y_pred = self.model.predict(X_test)
        report = classification_report(
            y_test, y_pred,
            target_names=self.encoder.classes_,
            output_dict=True,
        )
        logger.info(f"Classifier trained. Accuracy: {report['accuracy']:.2%}")

        # Save model
        self.save()
        return report

    def predict(self, description: str) -> dict:
        """Predict category from free-text description."""
        if not self.is_trained:
            raise RuntimeError("Classifier not trained yet.")

        X = self.vectorizer.transform([description.lower()])
        proba = self.model.predict_proba(X)[0]
        top_indices = np.argsort(proba)[::-1][:3]

        predicted_idx = top_indices[0]
        confidence = float(proba[predicted_idx])
        category = self.encoder.inverse_transform([predicted_idx])[0]

        alternatives = [
            {
                "category": self.encoder.inverse_transform([i])[0],
                "confidence": round(float(proba[i]), 3),
            }
            for i in top_indices[1:]
        ]

        return {
            "category": category,
            "confidence": round(confidence, 3),
            "alternatives": alternatives,
        }

    def save(self):
        joblib.dump(
            {"vectorizer": self.vectorizer, "encoder": self.encoder, "model": self.model},
            MODEL_PATH,
        )
        logger.info(f"Classifier saved to {MODEL_PATH}")

    def load(self):
        data = joblib.load(MODEL_PATH)
        self.vectorizer = data["vectorizer"]
        self.encoder = data["encoder"]
        self.model = data["model"]
        self.is_trained = True
        logger.info("Classifier loaded from disk.")


# Singleton
_classifier: ItemClassifier | None = None


def get_classifier() -> ItemClassifier:
    global _classifier
    if _classifier is None:
        _classifier = ItemClassifier()
        if MODEL_PATH.exists():
            _classifier.load()
        else:
            logger.info("No saved model found. Training from built-in data...")
            _classifier.train()
    return _classifier
