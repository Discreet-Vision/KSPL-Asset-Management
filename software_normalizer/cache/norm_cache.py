import time
from typing import Dict, Optional, Any

class NormalizationCache:
    """
    High-performance exact string normalization cache.
    Prevents redundant ML / vector processing for repeated software strings across discovery runs.
    """
    def __init__(self, ttl_seconds: int = 86400):
        self.ttl = ttl_seconds
        self._cache: Dict[str, Dict[str, Any]] = {}

    def get(self, raw_string: str) -> Optional[Dict[str, Any]]:
        key = raw_string.strip()
        entry = self._cache.get(key)
        if not entry:
            return None

        if time.time() - entry["timestamp"] > self.ttl:
            del self._cache[key]
            return None

        return entry["data"]

    def set(self, raw_string: str, result: Dict[str, Any]):
        key = raw_string.strip()
        self._cache[key] = {
            "timestamp": time.time(),
            "data": result
        }

    def clear(self):
        self._cache.clear()
        
    def size(self) -> int:
        return len(self._cache)
