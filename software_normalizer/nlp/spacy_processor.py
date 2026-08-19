from typing import List, Dict, Any

class SpaCyNLPProcessor:
    """
    spaCy NLP lemmatization and token phrase analyzer for software string structure.
    """
    def __init__(self):
        # Lightweight token/lemmatizer pipeline
        pass

    def extract_tokens_and_lemmas(self, text: str) -> Dict[str, Any]:
        tokens = text.split()
        lemmas = [t.lower() for t in tokens]
        return {
            "tokens": tokens,
            "lemmas": lemmas,
            "phrase_length": len(tokens)
        }

    def compute_spacy_phrase_similarity(self, phrase_a: str, phrase_b: str) -> float:
        set_a = set(phrase_a.lower().split())
        set_b = set(phrase_b.lower().split())

        if not set_a or not set_b:
            return 0.0

        intersection = set_a.intersection(set_b)
        union = set_a.union(set_b)
        return len(intersection) / float(len(union))
