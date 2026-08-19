from typing import Dict, List, Any, Optional
from software_normalizer.config import NormalizerConfig
from software_normalizer.catalog.reference_catalog import ReferenceCatalog
from software_normalizer.preprocessing.cleaner import TextCleaner
from software_normalizer.ml.tfidf_model import SoftwareTFIDFModel
from software_normalizer.nlp.spacy_processor import SpaCyNLPProcessor
from software_normalizer.cache.norm_cache import NormalizationCache
from software_normalizer.review.queue import HumanReviewQueue

class MultiStageMatchingPipeline:
    """
    Strict 7-stage software normalization & ML matching engine:
    1. Exact Match
    2. Normalized Exact Match
    3. Alias Match
    4. Rule-Based Match
    5. Fuzzy Match
    6. ML / NLP Match (scikit-learn + spaCy)
    7. Human Review Enqueue
    """

    def __init__(self):
        self.catalog = ReferenceCatalog()
        self.cleaner = TextCleaner()
        self.tfidf_model = SoftwareTFIDFModel()
        self.spacy_nlp = SpaCyNLPProcessor()
        self.cache = NormalizationCache(ttl_seconds=NormalizerConfig.CACHE_TTL_SECONDS)
        self.review_queue = HumanReviewQueue()

        # Fit TFIDF model on reference catalog
        entries_dict = [e.to_dict() for e in self.catalog.get_all_entries()]
        self.tfidf_model.fit_catalog(entries_dict)

    def normalize_software(
        self,
        raw_name: str,
        raw_publisher: Optional[str] = None,
        raw_version: Optional[str] = None,
        source: str = "AGENTLESS",
        tenant_id: str = "tenant-kspl-global"
    ) -> Dict[str, Any]:

        if not raw_name or not raw_name.strip():
            return {
                "raw_name": raw_name,
                "status": "REJECTED",
                "error": "Empty software name"
            }

        # Check Cache
        cached = self.cache.get(raw_name)
        if cached:
            cached_res = dict(cached)
            cached_res["from_cache"] = True
            return cached_res

        entries = self.catalog.get_all_entries()

        # -------------------------------------------------------------
        # STAGE 1: Exact Match
        # -------------------------------------------------------------
        for entry in entries:
            if raw_name.strip().lower() == entry.canonical_name.lower():
                res = self._build_result(raw_name, raw_publisher, raw_version, entry, 1.0, "exact_match")
                self.cache.set(raw_name, res)
                return res

        # -------------------------------------------------------------
        # STAGE 2: Normalized Exact Match
        # -------------------------------------------------------------
        cleaned_raw = self.cleaner.preprocess(raw_name)
        for entry in entries:
            cleaned_canon = self.cleaner.preprocess(entry.canonical_name)
            if cleaned_raw == cleaned_canon:
                res = self._build_result(raw_name, raw_publisher, raw_version, entry, 0.99, "normalized_exact_match")
                self.cache.set(raw_name, res)
                return res

        # -------------------------------------------------------------
        # STAGE 3: Alias Match
        # -------------------------------------------------------------
        for entry in entries:
            for alias in entry.aliases:
                cleaned_alias = self.cleaner.preprocess(alias)
                if cleaned_raw == cleaned_alias or raw_name.strip().lower() == alias.lower():
                    res = self._build_result(raw_name, raw_publisher, raw_version, entry, 0.98, "alias_match")
                    self.cache.set(raw_name, res)
                    return res

        # -------------------------------------------------------------
        # STAGE 4: Rule-Based / Edition / Publisher Aware Match
        # -------------------------------------------------------------
        if raw_publisher:
            cleaned_pub = self.cleaner.preprocess(raw_publisher)
            for entry in entries:
                if cleaned_pub in entry.publisher.lower():
                    if entry.product_family.lower() in cleaned_raw:
                        res = self._build_result(raw_name, raw_publisher, raw_version, entry, 0.96, "rule_publisher_family_match")
                        self.cache.set(raw_name, res)
                        return res

        # -------------------------------------------------------------
        # STAGE 5 & 6: Fuzzy & scikit-learn ML / spaCy Match
        # -------------------------------------------------------------
        ml_predictions = self.tfidf_model.predict(cleaned_raw, top_k=3)
        candidates = []

        for cat_id, score in ml_predictions:
            entry = self.catalog.get_by_id(cat_id)
            if entry:
                # spaCy phrase similarity boost
                spacy_sim = self.spacy_nlp.compute_spacy_phrase_similarity(cleaned_raw, entry.canonical_name)
                combined_score = round(0.7 * score + 0.3 * spacy_sim, 4)

                candidates.append({
                    "canonical_id": entry.canonical_id,
                    "canonical_name": entry.canonical_name,
                    "publisher": entry.publisher,
                    "confidence": combined_score
                })

        candidates.sort(key=lambda x: x["confidence"], reverse=True)

        if candidates:
            best_candidate = candidates[0]
            confidence = best_candidate["confidence"]
            best_entry = self.catalog.get_by_id(best_candidate["canonical_id"])

            if confidence >= NormalizerConfig.AUTO_MATCH_THRESHOLD:
                res = self._build_result(raw_name, raw_publisher, raw_version, best_entry, confidence, "ml_scikit_spacy_match", candidates)
                self.cache.set(raw_name, res)
                return res

            # -------------------------------------------------------------
            # STAGE 7: Human Review Enqueue
            # -------------------------------------------------------------
            item = self.review_queue.enqueue_uncertain_match(
                raw_name=raw_name,
                raw_publisher=raw_publisher,
                raw_version=raw_version,
                source=source,
                tenant_id=tenant_id,
                candidates=candidates,
                confidence=confidence
            )

            res = {
                "raw_name": raw_name,
                "raw_publisher": raw_publisher,
                "raw_version": raw_version,
                "status": "UNCERTAIN_HUMAN_REVIEW",
                "review_id": item.review_id,
                "top_candidate": best_candidate,
                "all_candidates": candidates,
                "confidence": confidence,
                "method": "ml_review_recommended",
                "model_version": NormalizerConfig.MODEL_VERSION,
                "from_cache": False
            }
            return res

        return {
            "raw_name": raw_name,
            "status": "UNMATCHED",
            "confidence": 0.0,
            "candidates": []
        }

    def _build_result(
        self,
        raw_name: str,
        raw_publisher: Optional[str],
        raw_version: Optional[str],
        entry: Any,
        confidence: float,
        method: str,
        candidates: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        return {
            "raw_name": raw_name,
            "raw_publisher": raw_publisher,
            "raw_version": raw_version,
            "canonical_id": entry.canonical_id,
            "canonical_name": entry.canonical_name,
            "publisher": entry.publisher,
            "product_family": entry.product_family,
            "edition": entry.edition,
            "category": entry.category,
            "license_model": entry.license_model,
            "confidence": confidence,
            "method": method,
            "model_version": NormalizerConfig.MODEL_VERSION,
            "status": "MATCHED",
            "from_cache": False,
            "candidates": candidates or []
        }
