from typing import Dict, Any

class IdentityVerificationAdapter:
    @staticmethod
    def verify_aadhaar(aadhaar_number: str) -> Dict[str, Any]:
        return {
            "service_name": "Identity Verification",
            "category": "Identity",
            "status": "Verified",
            "token": "AADHAAR-VERIFIED-ST-99812",
            "masked_aadhaar": "XXXX-XXXX-8912",
            "latency_ms": 140,
            "last_sync": "2026-09-29 10:15:00"
        }

class DigiLockerAdapter:
    @staticmethod
    def fetch_document(doc_type: str, uri: str) -> Dict[str, Any]:
        return {
            "service_name": "Document Registry",
            "category": "DigiLocker",
            "status": "Synchronized",
            "issuer": "Government of Tamil Nadu - Revenue Dept",
            "digilocker_uri": f"in.gov.digilocker.{doc_type.lower()}.88219",
            "verified_digital_signature": True,
            "latency_ms": 195,
            "last_sync": "2026-09-29 10:15:00"
        }

class PFMSAdapter:
    @staticmethod
    def get_dbt_status(application_id: str) -> Dict[str, Any]:
        return {
            "service_name": "Payment Service",
            "category": "DBT / PFMS",
            "status": "Received",
            "transaction_id": "DBT-PFMS-2026-990124",
            "bank_name": "State Bank of India",
            "account_masked": "XXXXXX4419",
            "ifsc": "SBIN0001234",
            "amount_transferred": 134000.0,
            "latency_ms": 210,
            "last_sync": "2026-09-29 10:15:00"
        }

class NSPAdapter:
    @staticmethod
    def sync_scheme_data(scheme_code: str) -> Dict[str, Any]:
        return {
            "service_name": "NSP Synchronization",
            "category": "Central Registry",
            "status": "Synchronized",
            "scheme_code": scheme_code,
            "last_sync": "2026-09-29 10:15:00"
        }
