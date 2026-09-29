from sqlalchemy import Column, String, Float, Integer, Boolean, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base

class UserProfileModel(Base):
    __tablename__ = "user_profiles"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    role = Column(String, nullable=False, default="STUDENT")
    category = Column(String, nullable=False, default="ST")
    gender = Column(String, nullable=False, default="Male")
    annual_income = Column(Float, nullable=False)
    education_level = Column(String, nullable=False)
    academic_percentage = Column(Float, nullable=False)
    age = Column(Integer, nullable=False)
    state = Column(String, nullable=False)
    district = Column(String, nullable=False)
    institution = Column(String, nullable=False)
    aadhaar_masked = Column(String, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "role": self.role,
            "category": self.category,
            "gender": self.gender,
            "annual_income": self.annual_income,
            "education_level": self.education_level,
            "academic_percentage": self.academic_percentage,
            "age": self.age,
            "state": self.state,
            "district": self.district,
            "institution": self.institution,
            "aadhaar_masked": self.aadhaar_masked
        }

class SchemeConfigModel(Base):
    __tablename__ = "scheme_configs"

    id = Column(String, primary_key=True, index=True)
    code = Column(String, nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    version = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    max_income_limit = Column(Float, nullable=False)
    min_academic_score = Column(Float, nullable=False)
    max_age_limit = Column(Integer, nullable=False)
    required_documents = Column(JSON, nullable=False)
    eligibility_rules = Column(JSON, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "code": self.code,
            "name": self.name,
            "description": self.description,
            "version": self.version,
            "is_active": self.is_active,
            "max_income_limit": self.max_income_limit,
            "min_academic_score": self.min_academic_score,
            "max_age_limit": self.max_age_limit,
            "required_documents": self.required_documents or [],
            "eligibility_rules": self.eligibility_rules or []
        }

class ApplicationModel(Base):
    __tablename__ = "applications"

    id = Column(String, primary_key=True, index=True)
    application_number = Column(String, unique=True, index=True, nullable=False)
    student_id = Column(String, ForeignKey("user_profiles.id"), nullable=False)
    student_name = Column(String, nullable=False)
    annual_income = Column(Float, nullable=False)
    academic_percentage = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    scheme_id = Column(String, ForeignKey("scheme_configs.id"), nullable=False)
    scheme_code = Column(String, nullable=False)
    scheme_name = Column(String, nullable=False)
    scheme_version = Column(String, nullable=False)
    status = Column(String, nullable=False)
    current_stage_label = Column(String, nullable=False)
    submitted_at = Column(String, nullable=False)
    updated_at = Column(String, nullable=False)
    assigned_officer_id = Column(String, nullable=True)
    assigned_officer_name = Column(String, nullable=True)
    eligibility_pass = Column(Boolean, default=True)
    eligibility_explanation = Column(JSON, nullable=False, default=list)
    cross_doc_status = Column(JSON, nullable=False, default=dict)
    anomaly_score = Column(Float, default=0.0)
    anomaly_flags = Column(JSON, nullable=False, default=list)
    documents = Column(JSON, nullable=False, default=list)
    deficiencies = Column(JSON, nullable=False, default=list)

    def to_dict(self):
        return {
            "id": self.id,
            "application_number": self.application_number,
            "student_id": self.student_id,
            "student_name": self.student_name,
            "annual_income": self.annual_income,
            "academic_percentage": self.academic_percentage,
            "category": self.category,
            "scheme_id": self.scheme_id,
            "scheme_code": self.scheme_code,
            "scheme_name": self.scheme_name,
            "scheme_version": self.scheme_version,
            "status": self.status,
            "current_stage_label": self.current_stage_label,
            "submitted_at": self.submitted_at,
            "updated_at": self.updated_at,
            "assigned_officer_id": self.assigned_officer_id,
            "assigned_officer_name": self.assigned_officer_name,
            "eligibility_pass": self.eligibility_pass,
            "eligibility_explanation": self.eligibility_explanation or [],
            "cross_doc_status": self.cross_doc_status or {},
            "anomaly_score": self.anomaly_score or 0.0,
            "anomaly_flags": self.anomaly_flags or [],
            "documents": self.documents or [],
            "deficiencies": self.deficiencies or []
        }

class FellowshipModel(Base):
    __tablename__ = "fellowships"

    id = Column(String, primary_key=True, index=True)
    application_id = Column(String, ForeignKey("applications.id"), nullable=False)
    student_id = Column(String, ForeignKey("user_profiles.id"), nullable=False)
    student_name = Column(String, nullable=False)
    scheme_name = Column(String, nullable=False)
    status = Column(String, nullable=False)
    current_year = Column(Integer, nullable=False, default=1)
    total_years = Column(Integer, nullable=False, default=4)
    next_renewal_date = Column(String, nullable=False)
    dbt_payment_status = Column(String, nullable=False)
    stipend_amount_monthly = Column(Float, nullable=False)
    contingency_annual = Column(Float, nullable=False)
    reports_submitted = Column(Integer, nullable=False, default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "application_id": self.application_id,
            "student_id": self.student_id,
            "student_name": self.student_name,
            "scheme_name": self.scheme_name,
            "status": self.status,
            "current_year": self.current_year,
            "total_years": self.total_years,
            "next_renewal_date": self.next_renewal_date,
            "dbt_payment_status": self.dbt_payment_status,
            "stipend_amount_monthly": self.stipend_amount_monthly,
            "contingency_annual": self.contingency_annual,
            "reports_submitted": self.reports_submitted
        }

class AuditRecordModel(Base):
    __tablename__ = "audit_records"

    id = Column(String, primary_key=True, index=True)
    application_id = Column(String, index=True, nullable=False)
    timestamp = Column(String, nullable=False)
    actor = Column(String, nullable=False)
    actor_role = Column(String, nullable=False)
    action = Column(String, nullable=False)
    reason = Column(Text, nullable=False)
    scheme_version = Column(String, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "application_id": self.application_id,
            "timestamp": self.timestamp,
            "actor": self.actor,
            "actor_role": self.actor_role,
            "action": self.action,
            "reason": self.reason,
            "scheme_version": self.scheme_version
        }
