"""
TF-IDF Vectorizer wrapper for text similarity scoring.
"""

import logging
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

logger = logging.getLogger(__name__)


class ItemVectorizer:
    """
    Wraps scikit-learn TfidfVectorizer to compute cosine similarity
    between lost and found item descriptions.
    """

    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            lowercase=True,
            stop_words="english",
            ngram_range=(1, 2),       # unigrams + bigrams
            max_features=5000,
            sublinear_tf=True,        # apply log normalization to tf
        )
        self._fitted = False

    def fit(self, texts: list[str]) -> None:
        """Fit the vectorizer on a corpus of item descriptions."""
        cleaned = [self._clean(t) for t in texts if t]
        if cleaned:
            self.vectorizer.fit(cleaned)
            self._fitted = True
            logger.info(f"Vectorizer fitted on {len(cleaned)} documents.")

    def similarity(self, text_a: str, text_b: str) -> float:
        """
        Compute cosine similarity between two item descriptions.
        Returns a float in [0.0, 1.0].
        """
        if not text_a or not text_b:
            return 0.0

        if not self._fitted:
            # Auto-fit on the two texts (minimal fallback)
            self.fit([text_a, text_b])

        try:
            vec_a = self.vectorizer.transform([self._clean(text_a)])
            vec_b = self.vectorizer.transform([self._clean(text_b)])
            score = cosine_similarity(vec_a, vec_b)[0][0]
            return float(np.clip(score, 0.0, 1.0))
        except Exception as e:
            logger.warning(f"Similarity error: {e}")
            return 0.0

    def batch_similarity(self, query: str, corpus: list[str]) -> list[float]:
        """
        Compute similarity of one query against a list of texts.
        Returns a list of floats in [0.0, 1.0].
        """
        if not query or not corpus:
            return [0.0] * len(corpus)

        if not self._fitted:
            self.fit([query] + corpus)

        try:
            q_vec = self.vectorizer.transform([self._clean(query)])
            c_vecs = self.vectorizer.transform([self._clean(t) for t in corpus])
            scores = cosine_similarity(q_vec, c_vecs)[0]
            return [float(np.clip(s, 0.0, 1.0)) for s in scores]
        except Exception as e:
            logger.warning(f"Batch similarity error: {e}")
            return [0.0] * len(corpus)

    @staticmethod
    def _clean(text: str) -> str:
        """Basic text cleaning."""
        return " ".join(str(text).strip().lower().split())


# Singleton instance — shared across requests
_vectorizer = ItemVectorizer()


def get_vectorizer() -> ItemVectorizer:
    return _vectorizer
