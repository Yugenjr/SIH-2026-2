import { Application, SchemeConfig, UserProfile, Fellowship, AuditRecord, IntegrationStatus } from '../types';

const API_BASE = 'https://backend-ihon.vercel.app/api';

async function fetchJson(endpoint: string, options?: RequestInit) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`Backend fetch failed for ${endpoint}, using client state fallback`, err);
    return null;
  }
}

export const api = {
  getStudentProfile: async (): Promise<UserProfile> => {
    const data = await fetchJson('/student/profile');
    if (data) return data;
    return {
      id: "STU-88192",
      name: "Arun Kumar",
      email: "arun.kumar.st@university.edu.in",
      phone: "+91 98765 43210",
      role: "STUDENT",
      category: "ST",
      gender: "Male",
      annual_income: 180000.0,
      education_level: "Ph.D. Scholar (Biotechnology)",
      academic_percentage: 82.4,
      age: 27,
      state: "Tamil Nadu",
      district: "Salem",
      institution: "Indian Institute of Technology, Madras",
      aadhaar_masked: "XXXX-XXXX-8912"
    };
  },

  getSchemes: async (): Promise<SchemeConfig[]> => {
    const data = await fetchJson('/schemes');
    if (data) return data;
    return [
      {
        id: "SCHEME-NFST",
        code: "NFST",
        name: "National Fellowship for ST Students",
        description: "Financial assistance for ST students to pursue higher education (M.Phil / Ph.D) in Indian Universities.",
        version: "NFST-2026.1",
        is_active: true,
        max_income_limit: 250000.0,
        min_academic_score: 60.0,
        max_age_limit: 35,
        required_documents: ["Caste Certificate", "Income Certificate", "Academic Marksheet", "Admission Proof", "Bonafide Certificate"],
        eligibility_rules: [
          { field: "category", operator: "==", value: "ST", label: "ST Category Mandatory", failure_reason: "Only ST category students eligible" },
          { field: "annual_income", operator: "<=", value: 250000, label: "Income <= ₹2,50,000", failure_reason: "Income exceeds threshold" },
          { field: "academic_percentage", operator: ">=", value: 60, label: "Academic Score >= 60%", failure_reason: "Score below minimum required percentage" }
        ]
      },
      {
        id: "SCHEME-NOS",
        code: "NOS",
        name: "National Overseas Scholarship for ST Students",
        description: "Financial assistance to ST students selected for pursuing Master's / Ph.D. level courses abroad.",
        version: "NOS-2026.1",
        is_active: true,
        max_income_limit: 600000.0,
        min_academic_score: 65.0,
        max_age_limit: 35,
        required_documents: ["Caste Certificate", "Income Certificate", "Academic Marksheet", "Foreign University Offer Letter", "Aadhaar Identity"],
        eligibility_rules: [
          { field: "category", operator: "==", value: "ST", label: "ST Category Mandatory", failure_reason: "Only ST category students eligible" },
          { field: "annual_income", operator: "<=", value: 600000, label: "Income <= ₹6,00,000", failure_reason: "Income exceeds threshold" }
        ]
      }
    ];
  },

  getApplications: async (): Promise<Application[]> => {
    const data = await fetchJson('/applications');
    return data || [];
  },

  getApplicationById: async (id: string): Promise<Application | null> => {
    const data = await fetchJson(`/applications/${id}`);
    return data;
  },

  uploadDocument: async (docType: string, simulateBlurry: boolean = false, appId: string = "NFST-2026-00821") => {
    const formData = new FormData();
    formData.append('doc_type', docType);
    formData.append('simulate_blurry', simulateBlurry ? 'true' : 'false');
    formData.append('application_id', appId);

    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      body: formData
    });
    return await res.json();
  },

  resolveDeficiency: async (deficiencyId: string, appId: string = "NFST-2026-00821") => {
    const data = await fetchJson(`/deficiencies/${deficiencyId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ application_id: appId })
    });
    return data;
  },

  officerDecision: async (appId: string, action: string, reason: string) => {
    const data = await fetchJson('/officer/decision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ application_id: appId, action, reason })
    });
    return data;
  },

  getOfficerQueue: async () => {
    const data = await fetchJson('/officer/queue');
    return data || [];
  },

  simulateImpact: async (oldLimit: number, newLimit: number) => {
    const data = await fetchJson('/schemes/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ old_income_limit: oldLimit, new_income_limit: newLimit })
    });
    return data;
  },

  getFellowship: async (): Promise<Fellowship | null> => {
    const data = await fetchJson('/fellowship');
    return data;
  },

  getMotaCommandCenter: async () => {
    const data = await fetchJson('/mota/command-center');
    return data;
  },

  getAuditTimeline: async (appId: string): Promise<AuditRecord[]> => {
    const data = await fetchJson(`/audit/${appId}`);
    return data || [];
  },

  askChatbot: async (query: string, appId: string = "NFST-2026-00821") => {
    const data = await fetchJson('/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, application_id: appId })
    });
    return data;
  },

  translateText: async (text: string, targetLang: string) => {
    const data = await fetchJson('/language/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, source_lang: 'en', target_lang: targetLang })
    });
    return data?.translated || text;
  },

  getIntegrations: async (): Promise<IntegrationStatus[]> => {
    const data = await fetchJson('/integrations/status');
    if (data) return data;
    return [
      { service_name: "Identity Verification", category: "Identity", status: "Verified", latency_ms: 140, last_sync: "2026-09-29 10:15" },
      { service_name: "Document Registry", category: "DigiLocker", status: "Synchronized", latency_ms: 195, last_sync: "2026-09-29 10:15" },
      { service_name: "Payment Service", category: "DBT / PFMS", status: "Received", latency_ms: 210, last_sync: "2026-09-29 10:15" },
      { service_name: "NSP Synchronization", category: "Central Registry", status: "Synchronized", latency_ms: 180, last_sync: "2026-09-29 10:15" }
    ];
  }
};
