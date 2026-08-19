import numpy as np
from typing import List, Tuple, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from software_normalizer.config import NormalizerConfig

class SoftwareTFIDFModel:
    """
    scikit-learn TF-IDF + Cosine Similarity matching engine.
    """
    def __init__(self):
        self.model_name = NormalizerConfig.MODEL_NAME
        self.version = NormalizerConfig.MODEL_VERSION
        self.vectorizer = TfidfVectorizer(ngram_range=(1, 3), analyzer='char_wb')
        self.catalog_ids: List[str] = []
        self.catalog_texts: List[str] = []
        self.tfidf_matrix = None

    def fit_catalog(self, catalog_entries: List[Dict[str, Any]]):
        self.catalog_ids = []
        self.catalog_texts = []

        for entry in catalog_entries:
            # Build rich feature string including canonical name, aliases, publisher, and keywords
            feature_str = f"{entry['canonical_name']} {entry['publisher']} {entry['product_family']} {' '.join(entry.get('aliases', []))} {' '.join(entry.get('keywords', []))}"
            self.catalog_ids.append(entry['canonical_id'])
            self.catalog_texts.append(feature_str.lower())

        if self.catalog_texts:
            self.tfidf_matrix = self.vectorizer.fit_transform(self.catalog_texts)

    def predict(self, raw_cleaned_text: str, top_k: int = 3) -> List[Tuple[str, float]]:
        if self.tfidf_matrix is None or not self.catalog_texts:
            return []

        query_vec = self.vectorizer.transform([raw_cleaned_text.lower()])
        similarities = cosine_similarity(query_vec, self.tfidf_matrix)[0]

        top_indices = np.argsort(similarities)[::-1][:top_k]
        results = []

        for idx in top_indices:
            score = float(similarities[idx])
            cat_id = self.catalog_ids[idx]
            results.append((cat_id, round(score, 4)))

        return results
