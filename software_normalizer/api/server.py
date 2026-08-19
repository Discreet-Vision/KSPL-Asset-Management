from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
from typing import List, Optional, Any
from software_normalizer.config import NormalizerConfig
from software_normalizer.pipeline.matching_engine import MultiStageMatchingPipeline
from software_normalizer.catalog.reference_catalog import CanonicalSoftwareEntry
from software_normalizer.adapters.reconciliation_adapter import SoftwareReconciliationAdapter

app = FastAPI(
    title=NormalizerConfig.SERVICE_NAME,
    version=NormalizerConfig.VERSION,
    description="Enterprise Software Normalization & ML Matching Microservice (Technopedia-Lite, scikit-learn, spaCy)"
)

pipeline = MultiStageMatchingPipeline()

class NormalizeSingleRequest(BaseModel):
    raw_name: str
    raw_publisher: Optional[str] = None
    raw_version: Optional[str] = None
    source: Optional[str] = "AGENTLESS"

class NormalizeBatchRequest(BaseModel):
    items: List[NormalizeSingleRequest]

class CreateCatalogItemRequest(BaseModel):
    canonical_id: str
    canonical_name: str
    publisher: str
    product_family: str
    edition: Optional[str] = None
    category: Optional[str] = "Application"
    license_model: Optional[str] = "Per User"
    aliases: Optional[List[str]] = None

class AddAliasRequest(BaseModel):
    canonical_id: str
    alias: str

class ReviewDecisionRequest(BaseModel):
    review_id: str
    canonical_id: str
    approved_by: str

@app.get("/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": NormalizerConfig.SERVICE_NAME,
        "version": NormalizerConfig.VERSION,
        "model_name": NormalizerConfig.MODEL_NAME,
        "model_version": NormalizerConfig.MODEL_VERSION,
        "cache_size": pipeline.cache.size()
    }

@app.post("/software-normalization/normalize")
def normalize_single_software(
    req: NormalizeSingleRequest,
    x_tenant_id: str = Header("tenant-kspl-global")
):
    res = pipeline.normalize_software(
        raw_name=req.raw_name,
        raw_publisher=req.raw_publisher,
        raw_version=req.raw_version,
        source=req.source or "AGENTLESS",
        tenant_id=x_tenant_id
    )
    reconciled = SoftwareReconciliationAdapter.format_for_reconciliation(res, x_tenant_id)
    return {"status": "SUCCESS", "normalization": res, "reconciliation_adapter": reconciled}

@app.post("/software-normalization/batch")
def normalize_batch_software(
    req: NormalizeBatchRequest,
    x_tenant_id: str = Header("tenant-kspl-global")
):
    results = []
    for item in req.items:
        res = pipeline.normalize_software(
            raw_name=item.raw_name,
            raw_publisher=item.raw_publisher,
            raw_version=item.raw_version,
            source=item.source or "AGENTLESS",
            tenant_id=x_tenant_id
        )
        results.append(res)
    return {
        "status": "SUCCESS",
        "total_processed": len(results),
        "results": results
    }

@app.get("/software-catalog")
def get_software_catalog():
    entries = pipeline.catalog.get_all_entries()
    return {"status": "SUCCESS", "count": len(entries), "catalog": [e.to_dict() for e in entries]}

@app.post("/software-catalog")
def create_software_catalog_entry(req: CreateCatalogItemRequest):
    entry = CanonicalSoftwareEntry(
        canonical_id=req.canonical_id,
        canonical_name=req.canonical_name,
        publisher=req.publisher,
        product_family=req.product_family,
        edition=req.edition,
        category=req.category or "Application",
        license_model=req.license_model or "Per User",
        aliases=req.aliases or []
    )
    pipeline.catalog.add_entry(entry)
    # Refit ML vectorizer
    entries_dict = [e.to_dict() for e in pipeline.catalog.get_all_entries()]
    pipeline.tfidf_model.fit_catalog(entries_dict)
    return {"status": "SUCCESS", "entry": entry.to_dict()}

@app.post("/software-catalog/aliases")
def add_catalog_alias(req: AddAliasRequest):
    success = pipeline.catalog.add_alias(req.canonical_id, req.alias)
    if not success:
        raise HTTPException(status_code=404, detail="Canonical software entry not found")
    # Refit ML vectorizer
    entries_dict = [e.to_dict() for e in pipeline.catalog.get_all_entries()]
    pipeline.tfidf_model.fit_catalog(entries_dict)
    return {"status": "SUCCESS", "canonical_id": req.canonical_id, "added_alias": req.alias}

@app.get("/software-normalization/review-queue")
def get_review_queue(x_tenant_id: str = Header("tenant-kspl-global")):
    items = pipeline.review_queue.get_pending_reviews(x_tenant_id)
    return {"status": "SUCCESS", "pending_count": len(items), "queue": items}

@app.post("/software-normalization/review")
def approve_review_decision(req: ReviewDecisionRequest):
    updated = pipeline.review_queue.approve_review(req.review_id, req.canonical_id, req.approved_by)
    if not updated:
        raise HTTPException(status_code=404, detail="Review item not found")

    # Learn approved match as alias automatically
    item_raw_name = updated["raw_name"]
    pipeline.catalog.add_alias(req.canonical_id, item_raw_name)

    # Refit ML vectorizer
    entries_dict = [e.to_dict() for e in pipeline.catalog.get_all_entries()]
    pipeline.tfidf_model.fit_catalog(entries_dict)

    return {"status": "SUCCESS", "review": updated, "learned_alias": item_raw_name}
