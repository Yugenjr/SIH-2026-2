from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime

class RoleEnum(str, Enum):
    STUDENT = "STUDENT"
    OFFICER = "OFFICER"
    SCHEME_ADMIN = "SCHEME_ADMIN"
    MOTA_ADMIN = "MOTA_ADMIN"

class CategoryEnum(str, Enum):
    ST = "ST"
    SC = "SC"
    OBC = "OBC"
    GENERAL = "GENERAL"

class AppStatusEnum(str, Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    DOCUMENT_VERIFICATION = "DOCUMENT_VERIFICATION"
    ELIGIBLE = "ELIGIBLE"
    DEFICIENT = "DEFICIENT"
    OFFICER_SCRUTINY = "OFFICER_SCRUTINY"
    SELECTED = "SELECTED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class DocTypeEnum(str, Enum):
    CASTE = "Caste Certificate"
    INCOME = "Income Certificate"
    MARKSHEET = "Academic Marksheet"
    BONAFIDE = "Bonafide Certificate"
    ADMISSION = "Admission Letter"
    BANK = "Bank Passbook"
    IDENTITY = "Aadhaar Identity"

class DocQualityEnum(str, Enum):
    GOOD = "GOOD"
    BLURRY = "BLURRY"
    POOR = "POOR"

class DeficiencySeverityEnum(str, Enum):
    CRITICAL = "CRITICAL"
    WARNING = "WARNING"
    INFO = "INFO"

class DeficiencyStatusEnum(str, Enum):
    OPEN = "ACTION REQUIRED"
    RESOLVED = "RESOLVED"
    REJECTED = "REJECTED"

class FellowshipStatusEnum(str, Enum):
    ACTIVE = "ACTIVE"
    RENEWAL_PENDING = "RENEWAL PENDING"
    COMPLETED = "COMPLETED"
    SUSPENDED = "SUSPENDED"

# Core Models
class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    role: RoleEnum
    category: CategoryEnum = CategoryEnum.ST
    gender: str = "Male"
    annual_income: float
    education_level: str
    academic_percentage: float
    age: int
    state: str
    district: str
    institution: str
    aadhaar_masked: str

class SchemeRule(BaseModel):
    field: str
    operator: str  # ==, <=, >=, IN
    value: Any
    label: str
    failure_reason: str

class SchemeConfig(BaseModel):
    id: str
    code: str
    name: str
    description: str
    version: str
    is_active: bool = True
    eligibility_rules: List[SchemeRule]
    required_documents: List[str]
    max_income_limit: float
    min_academic_score: float
    max_age_limit: int

class ExtractedField(BaseModel):
    field_name: str
    value: str
    confidence: float
    source: str
    page: int = 1
    bounding_box: Optional[Dict[str, int]] = None

class ApplicationDocument(BaseModel):
    id: str
    application_id: str
    doc_type: DocTypeEnum
    file_name: str
    quality: DocQualityEnum
    ocr_confidence: float
    extracted_fields: List[ExtractedField]
    uploaded_at: str
    is_valid: bool = True
    validation_issue: Optional[str] = None

class CrossDocValidationResult(BaseModel):
    dob_match: bool
    dob_details: Dict[str, str]
    name_match: bool
    name_details: Dict[str, str]
    income_match: bool
    income_details: Dict[str, Any]
    overall_status: str  # PASS, WARNING, FAIL
    flags: List[str]

class Deficiency(BaseModel):
    id: str
    application_id: str
    document_id: Optional[str] = None
    doc_type: str
    severity: DeficiencySeverityEnum
    problem: str
    required_action: str
    deadline: str
    status: DeficiencyStatusEnum
    created_at: str
    created_by: str
    resolved_at: Optional[str] = None

class Application(BaseModel):
    id: str
    application_number: str
    student_id: str
    student_name: str
    scheme_id: str
    scheme_code: str
    scheme_name: str
    scheme_version: str
    status: AppStatusEnum
    submitted_at: str
    updated_at: str
    assigned_officer_id: Optional[str] = None
    assigned_officer_name: Optional[str] = None
    eligibility_pass: bool
    eligibility_explanation: List[Dict[str, Any]]
    cross_doc_status: CrossDocValidationResult
    anomaly_score: float = 0.0
    anomaly_flags: List[str] = []
    documents: List[ApplicationDocument] = []
    deficiencies: List[Deficiency] = []
    current_stage_label: str = "Submitted"

class Fellowship(BaseModel):
    id: str
    application_id: str
    student_id: str
    student_name: str
    scheme_name: str
    status: FellowshipStatusEnum
    current_year: int
    total_years: int = 4
    next_renewal_date: str
    dbt_payment_status: str
    stipend_amount_monthly: float
    contingency_annual: float
    reports_submitted: int

class AuditRecord(BaseModel):
    id: str
    application_id: str
    timestamp: str
    actor: str
    actor_role: str
    action: str
    reason: str
    scheme_version: str

class IntegrationStatus(BaseModel):
    service_name: str
    category: str
    status: str  # Verified, Synchronized, Received
    latency_ms: int
    last_sync: str
