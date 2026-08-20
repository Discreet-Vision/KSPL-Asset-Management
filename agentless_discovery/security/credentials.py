import base64
import os
from typing import Dict, Optional
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from agentless_discovery.config import AgentlessConfig

class CredentialVault:
    def __init__(self, secret_key: str = AgentlessConfig.SECRET_KEY):
        if not secret_key:
            raise RuntimeError("AGENTLESS_SECRET_KEY must be configured before discovery credentials can be used")
        salt = b'itam_agentless_salt'
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(secret_key.encode()))
        self.cipher = Fernet(key)
        self._vault: Dict[str, Dict] = {}

    def encrypt_secret(self, secret: str) -> str:
        return self.cipher.encrypt(secret.encode()).decode()

    def decrypt_secret(self, token: str) -> str:
        return self.cipher.decrypt(token.encode()).decode()

    def store_credential(self, cred_id: str, cred_type: str, tenant_id: str, username: str, secret: str) -> Dict:
        encrypted_secret = self.encrypt_secret(secret)
        record = {
            "cred_id": cred_id,
            "type": cred_type, # snmp_v2c, snmp_v3, wmi, ssh
            "tenant_id": tenant_id,
            "username": username,
            "secret_ref": encrypted_secret,
            "status": "ACTIVE",
        }
        self._vault[cred_id] = record
        return {k: v for k, v in record.items() if k != "secret_ref"}

    def get_decrypted_secret(self, cred_id: str) -> Optional[str]:
        record = self._vault.get(cred_id)
        if not record:
            return None
        return self.decrypt_secret(record["secret_ref"])
