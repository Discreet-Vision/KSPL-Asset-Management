import datetime
from typing import Dict, List, Optional, Any

class CanonicalSoftwareEntry:
    def __init__(
        self,
        canonical_id: str,
        canonical_name: str,
        publisher: str,
        product_family: str,
        edition: Optional[str] = None,
        version: Optional[str] = None,
        category: str = "Application",
        subcategory: str = "General",
        license_model: str = "Per User",
        aliases: Optional[List[str]] = None,
        keywords: Optional[List[str]] = None
    ):
        self.canonical_id = canonical_id
        self.canonical_name = canonical_name
        self.publisher = publisher
        self.product_family = product_family
        self.edition = edition
        self.version = version
        self.category = category
        self.subcategory = subcategory
        self.license_model = license_model
        self.aliases = aliases or []
        self.keywords = keywords or []
        self.status = "APPROVED"
        self.created_at = datetime.datetime.utcnow().isoformat() + "Z"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "canonical_id": self.canonical_id,
            "canonical_name": self.canonical_name,
            "publisher": self.publisher,
            "product_family": self.product_family,
            "edition": self.edition,
            "version": self.version,
            "category": self.category,
            "subcategory": self.subcategory,
            "license_model": self.license_model,
            "aliases": self.aliases,
            "keywords": self.keywords,
            "status": self.status,
            "created_at": self.created_at
        }

class ReferenceCatalog:
    """
    Technopedia-Lite canonical software catalog manager.
    """
    def __init__(self):
        self._catalog: Dict[str, CanonicalSoftwareEntry] = {}
        self._seed_default_catalog()

    def _seed_default_catalog(self):
        entries = [
            CanonicalSoftwareEntry(
                canonical_id="SW-MSFT-365-E3",
                canonical_name="Microsoft 365 E3",
                publisher="Microsoft",
                product_family="Microsoft 365",
                edition="E3",
                category="SaaS / Productivity",
                subcategory="Office Suite",
                license_model="Subscription",
                aliases=["MSFT OFC 365 E3", "Microsoft Office 365 E3", "Office365-E3", "Microsoft 365 E3", "Microsoft 365 Apps for enterprise"],
                keywords=["office", "excel", "word", "outlook", "teams", "e3"]
            ),
            CanonicalSoftwareEntry(
                canonical_id="SW-MSFT-365-E5",
                canonical_name="Microsoft 365 E5",
                publisher="Microsoft",
                product_family="Microsoft 365",
                edition="E5",
                category="SaaS / Productivity",
                subcategory="Office Suite & Security",
                license_model="Subscription",
                aliases=["MSFT 365 E5", "Microsoft Office 365 E5", "Office365-E5"],
                keywords=["office", "security", "e5", "defender"]
            ),
            CanonicalSoftwareEntry(
                canonical_id="SW-ADOBE-ACROBAT-PRO",
                canonical_name="Adobe Acrobat Pro",
                publisher="Adobe",
                product_family="Acrobat",
                edition="Pro",
                category="Document Management",
                subcategory="PDF Editor",
                license_model="Per User / Subscription",
                aliases=["Adobe Acro Pro", "Adobe Acrobat DC Pro", "Acrobat Professional", "Adobe Acrobat Pro DC"],
                keywords=["pdf", "acrobat", "adobe", "reader"]
            ),
            CanonicalSoftwareEntry(
                canonical_id="SW-GOOGLE-CHROME",
                canonical_name="Google Chrome",
                publisher="Google",
                product_family="Chrome",
                edition="Enterprise",
                category="Web Browser",
                subcategory="Browser",
                license_model="Freeware",
                aliases=["Google Chrome Enterprise", "chrome-stable", "Google Chrome x64"],
                keywords=["chrome", "browser", "google"]
            ),
            CanonicalSoftwareEntry(
                canonical_id="SW-DOCKER-DESKTOP",
                canonical_name="Docker Desktop",
                publisher="Docker Inc.",
                product_family="Docker",
                edition="Business / Pro",
                category="Developer Tools",
                subcategory="Containerization",
                license_model="Per User Subscription",
                aliases=["Docker Desktop / Engine", "docker-ce", "Docker Engine Community"],
                keywords=["docker", "containers", "k8s"]
            ),
            CanonicalSoftwareEntry(
                canonical_id="SW-POSTGRESQL-SERVER",
                canonical_name="PostgreSQL",
                publisher="PostgreSQL Global Development Group",
                product_family="PostgreSQL",
                edition="Server",
                category="Database",
                subcategory="Relational DB",
                license_model="Open Source (PostgreSQL License)",
                aliases=["postgresql15-server", "PostgreSQL Database Server", "postgres-server"],
                keywords=["database", "sql", "postgres"]
            )
        ]
        for entry in entries:
            self._catalog[entry.canonical_id] = entry

    def get_all_entries(self) -> List[CanonicalSoftwareEntry]:
        return list(self._catalog.values())

    def get_by_id(self, canonical_id: str) -> Optional[CanonicalSoftwareEntry]:
        return self._catalog.get(canonical_id)

    def add_entry(self, entry: CanonicalSoftwareEntry):
        self._catalog[entry.canonical_id] = entry

    def add_alias(self, canonical_id: str, new_alias: str) -> bool:
        entry = self._catalog.get(canonical_id)
        if entry:
            if new_alias not in entry.aliases:
                entry.aliases.append(new_alias)
            return True
        return False
