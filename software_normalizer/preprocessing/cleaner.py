import re

class TextCleaner:
    """
    Standardizes raw software titles prior to exact, alias, or vector comparisons.
    Preserves raw values for audit.
    """
    
    # Common software abbreviations dictionary
    COMMON_ALIASES = {
        "msft": "microsoft",
        "ofc": "office",
        "o365": "office 365",
        "m365": "microsoft 365",
        "acro": "acrobat",
        "corp": "corporation",
        "inc": "",
        "llc": "",
        "ltd": ""
    }

    @classmethod
    def preprocess(cls, raw_text: str) -> str:
        if not raw_text:
            return ""

        # Lowercase
        text = raw_text.lower().strip()

        # Replace hyphens and underscores with spaces
        text = re.sub(r'[-_]', ' ', text)

        # Remove special characters except alphanumeric and spaces
        text = re.sub(r'[^\w\s]', ' ', text)

        # Collapse whitespace
        tokens = text.split()

        # Expand known abbreviations
        cleaned_tokens = [cls.COMMON_ALIASES.get(tok, tok) for tok in tokens if tok]

        return " ".join(cleaned_tokens)
