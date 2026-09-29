export type Role = 'STUDENT' | 'OFFICER' | 'SCHEME_ADMIN' | 'MOTA_ADMIN';

export type AppStatus = 
  | 'DRAFT' 
  | 'SUBMITTED' 
  | 'DOCUMENT_VERIFICATION' 
  | 'ELIGIBLE' 
  | 'DEFICIENT' 
  | 'OFFICER_SCRUTINY' 
  | 'SELECTED' 
  | 'APPROVED' 
  | 'REJECTED';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  category: string;
  gender: string;
  annual_income: number;
  education_level: string;
  academic_percentage: number;
  age: number;
  state: string;
  district: string;
  institution: string;
  aadhaar_masked: string;
}

export interface SchemeRule {
  field: string;
  operator: string;
  value: any;
  label: string;
  failure_reason: string;
}

export interface SchemeConfig {
  id: string;
  code: string;
  name: string;
  description: string;
  version: string;
  is_active: boolean;
  max_income_limit: number;
  min_academic_score: number;
  max_age_limit: number;
  required_documents: string[];
  eligibility_rules: SchemeRule[];
}

export interface ExtractedField {
  field_name: string;
  value: string;
  confidence: number;
  source: string;
  page?: number;
  bounding_box?: { x: number; y: number; w: number; h: number };
}

export interface ApplicationDocument {
  id: string;
  application_id: string;
  doc_type: string;
  file_name: string;
  quality: 'GOOD' | 'BLURRY' | 'POOR';
  ocr_confidence: number;
  is_valid: boolean;
  validation_issue?: string;
  extracted_fields: ExtractedField[];
}

export interface Deficiency {
  id: string;
  application_id: string;
  document_id?: string;
  doc_type: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  problem: string;
  required_action: string;
  deadline: string;
  status: 'ACTION REQUIRED' | 'RESOLVED' | 'REJECTED';
  created_at: string;
  created_by: string;
  resolved_at?: string | null;
}

export interface Application {
  id: string;
  application_number: string;
  student_id: string;
  student_name: string;
  annual_income: number;
  academic_percentage: number;
  category: string;
  scheme_id: string;
  scheme_code: string;
  scheme_name: string;
  scheme_version: string;
  status: AppStatus;
  current_stage_label: string;
  submitted_at: string;
  updated_at: string;
  assigned_officer_id?: string;
  assigned_officer_name?: string;
  eligibility_pass: boolean;
  eligibility_explanation: Array<{
    rule: string;
    requirement: string;
    actual: string;
    passed: boolean;
    status: string;
  }>;
  cross_doc_status: {
    dob_match: boolean;
    dob_details: { application: string; marksheet: string; identity: string };
    name_match: boolean;
    name_details: { application: string; documents: string };
    income_match: boolean;
    income_details: { declared: number; extracted: number };
    overall_status: string;
    flags: string[];
  };
  anomaly_score: number;
  anomaly_flags: string[];
  documents: ApplicationDocument[];
  deficiencies: Deficiency[];
}

export interface Fellowship {
  id: string;
  application_id: string;
  student_id: string;
  student_name: string;
  scheme_name: string;
  status: string;
  current_year: number;
  total_years: number;
  next_renewal_date: string;
  dbt_payment_status: string;
  stipend_amount_monthly: number;
  contingency_annual: number;
  reports_submitted: number;
}

export interface AuditRecord {
  id: string;
  application_id: string;
  timestamp: string;
  actor: string;
  actor_role: string;
  action: string;
  reason: string;
  scheme_version: string;
}

export interface IntegrationStatus {
  service_name: string;
  category: string;
  status: string;
  latency_ms: number;
  last_sync: string;
}
