import datetime
import uuid
from typing import Dict, List, Any, Optional

class ReviewItem:
    def __init__(
        self,
        raw_name: str,
        raw_publisher: Optional[str],
        raw_version: Optional[str],
        source: str,
        tenant_id: str,
        candidates: List[Dict[str, Any]],
        confidence: float
    ):
        self.review_id = f"REV-{uuid.uuid4().hex[:8].upper()}"
        self.raw_name = raw_name
        self.raw_publisher = raw_publisher
        self.raw_version = raw_version
        self.source = source
        self.tenant_id = tenant_id
        self.candidates = candidates
        self.confidence = confidence
        self.status = "PENDING_REVIEW" # PENDING_REVIEW, APPROVED, REJECTED
        self.decision = None
        self.created_at = datetime.datetime.utcnow().isoformat() + "Z"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "review_id": self.review_id,
            "raw_name": self.raw_name,
            "raw_publisher": self.raw_publisher,
            "raw_version": self.raw_version,
            "source": self.source,
            "tenant_id": self.tenant_id,
            "candidates": self.candidates,
            "confidence": self.confidence,
            "status": self.status,
            "decision": self.decision,
            "created_at": self.created_at
        }

class HumanReviewQueue:
    """
    Manages uncertain software matches for human review.
    Learns approved matches as persistent aliases.
    """
    def __init__(self):
        self._queue: Dict[str, ReviewItem] = {}

    def enqueue_uncertain_match(
        self,
        raw_name: str,
        raw_publisher: Optional[str],
        raw_version: Optional[str],
        source: str,
        tenant_id: str,
        candidates: List[Dict[str, Any]],
        confidence: float
    ) -> ReviewItem:
        item = ReviewItem(raw_name, raw_publisher, raw_version, source, tenant_id, candidates, confidence)
        self._queue[item.review_id] = item
        return item

    def get_pending_reviews(self, tenant_id: str) -> List[Dict[str, Any]]:
        return [
            item.to_dict() for item in self._queue.values()
            if item.tenant_id == tenant_id and item.status == "PENDING_REVIEW"
        ]

    def approve_review(self, review_id: str, canonical_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        item = self._queue.get(review_id)
        if not item:
            return None

        item.status = "APPROVED"
        item.decision = {
            "canonical_id": canonical_id,
            "approved_by": user_id,
            "approved_at": datetime.datetime.utcnow().isoformat() + "Z"
        }
        return item.to_dict()
