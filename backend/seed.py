from typing import Dict, List, Any
import datetime

# Seed Data Store
SEED_SCHEMES = [
    {
        "id": "SCHEME-NFST",
        "code": "NFST",
        "name": "National Fellowship for ST Students",
        "description": "Financial assistance for ST students to pursue higher education (M.Phil / Ph.D) in Indian Universities.",
        "version": "NFST-2026.1",
        "is_active": True,
        "max_income_limit": 250000.0,
        "min_academic_score": 60.0,
        "max_age_limit": 35,
        "required_documents": [
            "Caste Certificate",
            "Income Certificate",
            "Academic Marksheet",
            "Admission Proof",
            "Bonafide Certificate"
        ],
        "eligibility_rules": [
            {"field": "category", "operator": "==", "value": "ST", "label": "ST Category Mandatory", "failure_reason": "Only ST category students eligible"},
            {"field": "annual_income", "operator": "<=", "value": 250000, "label": "Income <= ₹2,50,000", "failure_reason": "Annual family income exceeds threshold"},
            {"field": "academic_percentage", "operator": ">=", "value": 60.0, "label": "Academic Score >= 60%", "failure_reason": "Score below minimum required percentage"},
            {"field": "age", "operator": "<=", "value": 35, "label": "Age <= 35 Years", "failure_reason": "Age exceeds maximum limit"}
        ]
    },
    {
        "id": "SCHEME-NOS",
        "code": "NOS",
        "name": "National Overseas Scholarship for ST Students",
        "description": "Financial assistance to ST students selected for pursuing Master's / Ph.D. level courses abroad.",
        "version": "NOS-2026.1",
        "is_active": True,
        "max_income_limit": 600000.0,
        "min_academic_score": 65.0,
        "max_age_limit": 35,
        "required_documents": [
            "Caste Certificate",
            "Income Certificate",
            "Academic Marksheet",
            "Foreign University Offer Letter",
            "Aadhaar Identity"
        ],
        "eligibility_rules": [
            {"field": "category", "operator": "==", "value": "ST", "label": "ST Category Mandatory", "failure_reason": "Only ST category students eligible"},
            {"field": "annual_income", "operator": "<=", "value": 600000, "label": "Income <= ₹6,00,000", "failure_reason": "Income exceeds threshold"},
            {"field": "academic_percentage", "operator": ">=", "value": 65.0, "label": "Academic Score >= 65%", "failure_reason": "Score below minimum required percentage"}
        ]
    }
]

SEED_STUDENT_PROFILE = {
    "id": "STU-88192",
    "name": "Arun Kumar",
    "email": "arun.kumar.st@university.edu.in",
    "phone": "+91 98765 43210",
    "role": "STUDENT",
    "category": "ST",
    "gender": "Male",
    "annual_income": 180000.0,
    "education_level": "Ph.D. Scholar (Biotechnology)",
    "academic_percentage": 82.4,
    "age": 27,
    "state": "Tamil Nadu",
    "district": "Salem",
    "institution": "Indian Institute of Technology, Madras",
    "aadhaar_masked": "XXXX-XXXX-8912"
}

# 100 Synthetic Applications Data Generator
def generate_synthetic_applications() -> List[Dict[str, Any]]:
    names = [
        "Arun Kumar", "Priya Marandi", "Ramesh Munda", "Sunita Oraon", "Karan Soren",
        "Deepak Gond", "Anjali Bhil", "Vikas Santhal", "Meena Khadia", "Sanjay Bodo",
        "Lakshmi Naik", "Vijay Rathwa", "Pooja Gamit", "Rajesh Meena", "Swati Koley"
    ]
    states = ["Tamil Nadu", "Jharkhand", "Odisha", "Chhattisgarh", "Madhya Pradesh", "Rajasthan", "Assam", "Gujarat"]
    statuses = ["SUBMITTED", "DOCUMENT_VERIFICATION", "ELIGIBLE", "DEFICIENT", "OFFICER_SCRUTINY", "SELECTED", "APPROVED", "REJECTED"]

    apps = []

    # Main Demo Application 1 (#821 - Arun Kumar - NFST - DOB Mismatch & Officer Review)
    apps.append({
        "id": "NFST-2026-00821",
        "application_number": "NFST-2026-00821",
        "student_id": "STU-88192",
        "student_name": "Arun Kumar",
        "annual_income": 180000.0,
        "academic_percentage": 82.4,
        "category": "ST",
        "scheme_id": "SCHEME-NFST",
        "scheme_code": "NFST",
        "scheme_name": "National Fellowship for ST Students",
        "scheme_version": "NFST-2026.1",
        "status": "OFFICER_SCRUTINY",
        "current_stage_label": "Officer Scrutiny",
        "submitted_at": "2026-09-28 09:12:00",
        "updated_at": "2026-09-29 10:42:00",
        "assigned_officer_id": "OFF-104",
        "assigned_officer_name": "Dr. Rajeshwar Prasad (Verification Officer)",
        "eligibility_pass": True,
        "eligibility_explanation": [
            {"rule": "ST Category", "requirement": "ST", "actual": "ST", "passed": True, "status": "PASS"},
            {"rule": "Annual Income", "requirement": "<= ₹2,50,000", "actual": "₹1,80,000", "passed": True, "status": "PASS"},
            {"rule": "Academic Score", "requirement": ">= 60%", "actual": "82.4%", "passed": True, "status": "PASS"},
            {"rule": "Age Limit", "requirement": "<= 35 Years", "actual": "27 Years", "passed": True, "status": "PASS"}
        ],
        "cross_doc_status": {
            "dob_match": False,
            "dob_details": {"application": "12/04/2004", "marksheet": "12/04/2003", "identity": "12/04/2004"},
            "name_match": True,
            "name_details": {"application": "Arun Kumar", "documents": "Arun Kumar"},
            "income_match": True,
            "income_details": {"declared": 180000, "extracted": 180000},
            "overall_status": "WARNING",
            "flags": ["DATE OF BIRTH MISMATCH"]
        },
        "anomaly_score": 0.94,
        "anomaly_flags": ["94% document similarity with #431", "Same DOB & Bank Fingerprint"],
        "documents": [
            {
                "id": "DOC-821-1",
                "application_id": "NFST-2026-00821",
                "doc_type": "Income Certificate",
                "file_name": "Income_Certificate_Arun.pdf",
                "quality": "GOOD",
                "ocr_confidence": 0.97,
                "is_valid": True,
                "extracted_fields": [
                    {"field_name": "Full Name", "value": "Arun Kumar", "confidence": 0.98, "source": "Income Certificate", "page": 1, "bounding_box": {"x": 120, "y": 80, "w": 200, "h": 30}},
                    {"field_name": "Annual Income", "value": "₹1,80,000", "confidence": 0.97, "source": "Income Certificate", "page": 1, "bounding_box": {"x": 120, "y": 140, "w": 180, "h": 30}},
                    {"field_name": "Valid Until", "value": "11/06/2027", "confidence": 0.96, "source": "Income Certificate", "page": 1, "bounding_box": {"x": 120, "y": 260, "w": 160, "h": 30}}
                ]
            },
            {
                "id": "DOC-821-2",
                "application_id": "NFST-2026-00821",
                "doc_type": "Academic Marksheet",
                "file_name": "Marksheet_PhD_Biotech.pdf",
                "quality": "GOOD",
                "ocr_confidence": 0.98,
                "is_valid": False,
                "validation_issue": "DOB listed as 12/04/2003 vs Application 12/04/2004",
                "extracted_fields": [
                    {"field_name": "Student Name", "value": "Arun Kumar", "confidence": 0.99, "source": "Academic Marksheet", "page": 1, "bounding_box": {"x": 100, "y": 90, "w": 210, "h": 28}},
                    {"field_name": "Date of Birth", "value": "12/04/2003", "confidence": 0.94, "source": "Academic Marksheet", "page": 1, "bounding_box": {"x": 100, "y": 150, "w": 150, "h": 28}},
                    {"field_name": "Percentage", "value": "82.4%", "confidence": 0.99, "source": "Academic Marksheet", "page": 1, "bounding_box": {"x": 100, "y": 210, "w": 100, "h": 28}}
                ]
            },
            {
                "id": "DOC-821-3",
                "application_id": "NFST-2026-00821",
                "doc_type": "Caste Certificate",
                "file_name": "ST_Caste_Certificate.pdf",
                "quality": "GOOD",
                "ocr_confidence": 0.99,
                "is_valid": True,
                "extracted_fields": [
                    {"field_name": "Applicant Name", "value": "Arun Kumar", "confidence": 0.99, "source": "Caste Certificate", "page": 1},
                    {"field_name": "Tribe / Community", "value": "Malayali (ST)", "confidence": 0.98, "source": "Caste Certificate", "page": 1}
                ]
            }
        ],
        "deficiencies": [
            {
                "id": "DEF-821-01",
                "application_id": "NFST-2026-00821",
                "document_id": "DOC-821-2",
                "doc_type": "Academic Marksheet",
                "severity": "WARNING",
                "problem": "Date of Birth Mismatch (Application DOB: 12/04/2004 vs Marksheet DOB: 12/04/2003)",
                "required_action": "Upload corrected Marksheet or official DOB proof document",
                "deadline": "05 October 2026",
                "status": "ACTION REQUIRED",
                "created_at": "2026-09-28 10:17:00",
                "created_by": "Dr. Rajeshwar Prasad (Verification Officer)",
                "resolved_at": None
            }
        ]
    })

    # Main Demo Application 2 (#823 - NOS 2026 - Documents Required)
    apps.append({
        "id": "NOS-2026-00823",
        "application_number": "NOS-2026-00823",
        "student_id": "STU-88192",
        "student_name": "Arun Kumar",
        "annual_income": 180000.0,
        "academic_percentage": 82.4,
        "category": "ST",
        "scheme_id": "SCHEME-NOS",
        "scheme_code": "NOS",
        "scheme_name": "National Overseas Scholarship",
        "scheme_version": "NOS-2026.1",
        "status": "DEFICIENT",
        "current_stage_label": "Documents Required",
        "submitted_at": "2026-09-27 14:20:00",
        "updated_at": "2026-09-29 08:30:00",
        "assigned_officer_id": "OFF-102",
        "assigned_officer_name": "Smt. Anita Sharma",
        "eligibility_pass": True,
        "eligibility_explanation": [],
        "cross_doc_status": {
            "dob_match": True,
            "dob_details": {"application": "12/04/2004", "marksheet": "12/04/2004", "identity": "12/04/2004"},
            "name_match": True,
            "name_details": {"application": "Arun Kumar", "documents": "Arun Kumar"},
            "income_match": True,
            "income_details": {"declared": 180000, "extracted": 180000},
            "overall_status": "PASS",
            "flags": []
        },
        "anomaly_score": 0.02,
        "anomaly_flags": [],
        "documents": [],
        "deficiencies": [
            {
                "id": "DEF-823-01",
                "application_id": "NOS-2026-00823",
                "document_id": "DOC-823-1",
                "doc_type": "Income Certificate",
                "severity": "CRITICAL",
                "problem": "Income Certificate needs replacement (Blurry/Expired document)",
                "required_action": "Upload valid Income Certificate for Financial Year 2025-26",
                "deadline": "05 October 2026",
                "status": "ACTION REQUIRED",
                "created_at": "2026-09-27 16:00:00",
                "created_by": "Smt. Anita Sharma",
                "resolved_at": None
            }
        ]
    })

    # Generate 98 remaining realistic applications for statistics & queue filtering
    for i in range(1, 99):
        app_num = f"NFST-2026-{1000 + i}"
        name = names[i % len(names)]
        st = states[i % len(states)]
        stat = statuses[i % len(statuses)]
        inc = 120000.0 + (i * 2500) % 150000
        score = 62.0 + (i * 1.7) % 32
        
        apps.append({
            "id": f"APP-{1000 + i}",
            "application_number": app_num,
            "student_id": f"STU-{9000 + i}",
            "student_name": name,
            "annual_income": inc,
            "academic_percentage": round(score, 1),
            "category": "ST",
            "scheme_id": "SCHEME-NFST",
            "scheme_code": "NFST",
            "scheme_name": "National Fellowship for ST Students",
            "scheme_version": "NFST-2026.1",
            "status": stat,
            "current_stage_label": stat.replace("_", " ").title(),
            "submitted_at": f"2026-09-{(i % 25) + 1:02d} 11:00:00",
            "updated_at": f"2026-09-{(i % 25) + 1:02d} 15:30:00",
            "assigned_officer_id": f"OFF-{(i % 5) + 101}",
            "assigned_officer_name": f"Officer {(i % 5) + 1}",
            "eligibility_pass": inc <= 250000 and score >= 60,
            "eligibility_explanation": [],
            "cross_doc_status": {
                "dob_match": True,
                "dob_details": {"application": "15/05/2001", "marksheet": "15/05/2001", "identity": "15/05/2001"},
                "name_match": True,
                "name_details": {"application": name, "documents": name},
                "income_match": True,
                "income_details": {"declared": inc, "extracted": inc},
                "overall_status": "PASS",
                "flags": []
            },
            "anomaly_score": 0.04 if i % 12 != 0 else 0.88,
            "anomaly_flags": ["Potential duplicate institution"] if i % 12 == 0 else [],
            "documents": [],
            "deficiencies": []
        })

    return apps

SEED_FELLOWSHIP = {
    "id": "FEL-2026-0044",
    "application_id": "NFST-2026-00821",
    "student_id": "STU-88192",
    "student_name": "Arun Kumar",
    "scheme_name": "National Fellowship for ST Students (NFST)",
    "status": "ACTIVE",
    "current_year": 2,
    "total_years": 4,
    "next_renewal_date": "14 Oct 2026",
    "dbt_payment_status": "UP TO DATE (₹31,000 / month)",
    "stipend_amount_monthly": 31000.0,
    "contingency_annual": 20000.0,
    "reports_submitted": 3
}

SEED_AUDIT_LOGS = [
    {"id": "AUD-01", "application_id": "NFST-2026-00821", "timestamp": "28 Sep 09:12", "actor": "Arun Kumar (Student)", "actor_role": "STUDENT", "action": "Application Submitted", "reason": "Initial submission via SAHA PWA", "scheme_version": "NFST-2026.1"},
    {"id": "AUD-02", "application_id": "NFST-2026-00821", "timestamp": "28 Sep 09:13", "actor": "SAHA Doc AI Engine", "actor_role": "SYSTEM", "action": "Documents Processed", "reason": "OCR & quality inspection executed", "scheme_version": "NFST-2026.1"},
    {"id": "AUD-03", "application_id": "NFST-2026-00821", "timestamp": "28 Sep 09:14", "actor": "SAHA OCR Engine", "actor_role": "SYSTEM", "action": "OCR & Extraction Complete", "reason": "Extracted income ₹1,80,000 & mark percentage 82.4%", "scheme_version": "NFST-2026.1"},
    {"id": "AUD-04", "application_id": "NFST-2026-00821", "timestamp": "28 Sep 09:15", "actor": "SAHA Rules Engine", "actor_role": "SYSTEM", "action": "Eligibility Evaluated", "reason": "Eligible for NFST under ST category & income threshold", "scheme_version": "NFST-2026.1"},
    {"id": "AUD-05", "application_id": "NFST-2026-00821", "timestamp": "28 Sep 09:15", "actor": "SAHA Cross-Doc Engine", "actor_role": "SYSTEM", "action": "DOB Mismatch Detected", "reason": "Marksheet DOB (12/04/2003) vs Application DOB (12/04/2004)", "scheme_version": "NFST-2026.1"},
    {"id": "AUD-06", "application_id": "NFST-2026-00821", "timestamp": "28 Sep 10:02", "actor": "System Workload Manager", "actor_role": "SYSTEM", "action": "Officer Assigned", "reason": "Assigned to Dr. Rajeshwar Prasad (OFF-104)", "scheme_version": "NFST-2026.1"},
    {"id": "AUD-07", "application_id": "NFST-2026-00821", "timestamp": "28 Sep 10:17", "actor": "Dr. Rajeshwar Prasad", "actor_role": "OFFICER", "action": "Deficiency Created", "reason": "DOB mismatch requested for clarification", "scheme_version": "NFST-2026.1"}
]
