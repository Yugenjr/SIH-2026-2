from typing import Dict, List, Any
import random

class DocumentIntelligence:
    @staticmethod
    def process_upload(file_name: str, doc_type: str, simulate_blurry: bool = False) -> Dict[str, Any]:
        """
        Processes uploaded documents: Quality filter -> Classification -> Field Extraction -> Evidence Bounding Box mapping
        """
        if simulate_blurry or "blurry" in file_name.lower():
            return {
                "success": False,
                "doc_type": doc_type,
                "file_name": file_name,
                "quality_status": "BLURRY",
                "ocr_confidence": 0.42,
                "error_title": "DOCUMENT QUALITY ISSUE",
                "error_message": "The uploaded document appears blurry or unreadable.",
                "required_action": "Please replace with a clear, high-resolution scan or photo.",
                "extracted_fields": []
            }

        # Successful extraction simulation based on document type
        extracted_fields = []
        if doc_type in ["Income Certificate", "INCOME"]:
            extracted_fields = [
                {"field_name": "Full Name", "value": "Arun Kumar", "confidence": 0.98, "source": "Income Certificate", "page": 1, "bounding_box": {"x": 120, "y": 80, "w": 200, "h": 30}},
                {"field_name": "Annual Income", "value": "₹1,80,000", "confidence": 0.97, "source": "Income Certificate", "page": 1, "bounding_box": {"x": 120, "y": 140, "w": 180, "h": 30}},
                {"field_name": "Certificate No", "value": "INC-2025-88912", "confidence": 0.99, "source": "Income Certificate", "page": 1, "bounding_box": {"x": 120, "y": 200, "w": 220, "h": 30}},
                {"field_name": "Valid Until", "value": "11/06/2027", "confidence": 0.96, "source": "Income Certificate", "page": 1, "bounding_box": {"x": 120, "y": 260, "w": 160, "h": 30}}
            ]
        elif doc_type in ["Academic Marksheet", "MARKSHEET"]:
            extracted_fields = [
                {"field_name": "Student Name", "value": "Arun Kumar", "confidence": 0.99, "source": "Academic Marksheet", "page": 1, "bounding_box": {"x": 100, "y": 90, "w": 210, "h": 28}},
                {"field_name": "Date of Birth", "value": "12/04/2003", "confidence": 0.94, "source": "Academic Marksheet", "page": 1, "bounding_box": {"x": 100, "y": 150, "w": 150, "h": 28}},
                {"field_name": "Percentage / GPA", "value": "82.4%", "confidence": 0.99, "source": "Academic Marksheet", "page": 1, "bounding_box": {"x": 100, "y": 210, "w": 100, "h": 28}},
                {"field_name": "Roll Number", "value": "2022-PHD-ST-044", "confidence": 0.98, "source": "Academic Marksheet", "page": 1, "bounding_box": {"x": 100, "y": 270, "w": 190, "h": 28}}
            ]
        elif doc_type in ["Caste Certificate", "CASTE"]:
            extracted_fields = [
                {"field_name": "Applicant Name", "value": "Arun Kumar", "confidence": 0.99, "source": "Caste Certificate", "page": 1, "bounding_box": {"x": 110, "y": 100, "w": 190, "h": 30}},
                {"field_name": "Tribe / Community", "value": "Malayali (ST)", "confidence": 0.98, "source": "Caste Certificate", "page": 1, "bounding_box": {"x": 110, "y": 160, "w": 210, "h": 30}},
                {"field_name": "Issuing Authority", "value": "Tehsildar Salem", "confidence": 0.95, "source": "Caste Certificate", "page": 1, "bounding_box": {"x": 110, "y": 220, "w": 240, "h": 30}}
            ]
        else:
            extracted_fields = [
                {"field_name": "Document Holder", "value": "Arun Kumar", "confidence": 0.96, "source": doc_type, "page": 1, "bounding_box": {"x": 100, "y": 100, "w": 200, "h": 30}}
            ]

        return {
            "success": True,
            "doc_type": doc_type,
            "file_name": file_name,
            "quality_status": "GOOD",
            "ocr_confidence": 0.97,
            "extracted_fields": extracted_fields,
            "is_ready": True
        }

    @staticmethod
    def validate_cross_document(app_dob: str, mark_dob: str, id_dob: str, app_name: str, doc_name: str) -> Dict[str, Any]:
        """
        Cross-checks values extracted from multiple documents (Application vs Marksheet vs Identity)
        """
        flags = []
        dob_match = (app_dob == mark_dob == id_dob)
        if not dob_match:
            flags.append("DATE OF BIRTH MISMATCH")

        name_match = (app_name.lower().strip() == doc_name.lower().strip())
        if not name_match:
            flags.append("NAME SPELLING VARIATION")

        overall_status = "PASS"
        if not dob_match:
            overall_status = "WARNING"
        if not dob_match and not name_match:
            overall_status = "FAIL"

        return {
            "dob_match": dob_match,
            "dob_details": {
                "application": app_dob,
                "marksheet": mark_dob,
                "identity": id_dob
            },
            "name_match": name_match,
            "name_details": {
                "application": app_name,
                "documents": doc_name
            },
            "income_match": True,
            "income_details": {"declared": 180000, "extracted": 180000},
            "overall_status": overall_status,
            "flags": flags
        }
