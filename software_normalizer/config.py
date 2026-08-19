import os

class NormalizerConfig:
    SERVICE_NAME: str = "Enterprise Software Normalization & ML Matching Microservice"
    VERSION: str = "1.2.0-ml"
    PORT: int = 8082
    MODEL_NAME: str = "software-normalizer-tfidf-spacy"
    MODEL_VERSION: str = "1.2.0"
    
    # Confidence Thresholds
    AUTO_MATCH_THRESHOLD: float = 0.95
    REVIEW_RECOMMENDED_THRESHOLD: float = 0.80
    
    # Performance & Cache
    CACHE_TTL_SECONDS: int = 86400 # 24 hours
    BATCH_SIZE: int = 1000
