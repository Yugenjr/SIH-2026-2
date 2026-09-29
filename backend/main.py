from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import datetime

from models.domain import (
    UserProfile, SchemeConfig, Application, ApplicationDocument,
    Deficiency, Fellowship, AuditRecord, CrossDocValidationResult, ExtractedField
)
from services.rules_engine import RulesEngine
from services.doc_intelligence import DocumentIntelligence
from services.anomaly_engine import AnomalyEngine
from services.groq_service import GroqChatService
from services.sarvam_service import SarvamLanguageService
from adapters.connected_adapters import (
    IdentityVerificationAdapter, DigiLockerAdapter, PFMSAdapter, NSPAdapter
)
from seed import SEED_SCHEMES, SEED_STUDENT_PROFILE, generate_synthetic_applications, SEED_FELLOWSHIP, SEED_AUDIT_LOGS

app = FastAPI(
    title="SAHA API",
    description="Intelligent Scholarship Verification & Lifecycle Platform API (Ministry of Tribal Affairs)",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory database stores initialized with synthetic data
DB_SCHEMES = {s["id"]: SchemeConfig(**s) for s in SEED_SCHEMES}
DB_APPLICATIONS = {a["id"]: a for a in generate_synthetic_applications()}
DB_FELLOWSHIP = dict(SEED_FELLOWSHIP)
DB_AUDIT_LOGS = list(SEED_AUDIT_LOGS)

groq_service = GroqChatService()
sarvam_service = SarvamLanguageService()

@app.get("/api/health")
def health_check():
    return {
        "status": "HEALTHY",
        "platform": "SAHA",
        "tagline": "From application to opportunity.",
        "timestamp": datetime.datetime.now().isoformat(),
        "total_applications": len(DB_APPLICATIONS)
    }

# --- STUDENT & SCHEMES ---
@app.get("/api/student/profile")
def get_student_profile():
    return SEED_STUDENT_PROFILE

@app.get("/api/schemes")
def get_schemes():
    return list(DB_SCHEMES.values())

@app.post("/api/schemes/evaluate")
def evaluate_eligibility(payload: Dict[str, Any]):
    profile_data = payload.get("profile", SEED_STUDENT_PROFILE)
    scheme_id = payload.get("scheme_id", "SCHEME-NFST")
    
    scheme = DB_SCHEMES.get(scheme_id)
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
        
    profile = UserProfile(**profile_data)
    result = RulesEngine.evaluate(profile, scheme)
    return result

@app.post("/api/schemes/simulate")
def simulate_scheme_impact(payload: Dict[str, Any]):
    old_income = float(payload.get("old_income_limit", 200000.0))
    new_income = float(payload.get("new_income_limit", 250000.0))
    
    apps_list = list(DB_APPLICATIONS.values())
    result = RulesEngine.simulate_impact(apps_list, old_income, new_income)
    return result

# --- APPLICATIONS ---
@app.get("/api/applications")
def get_applications(
    status: Optional[str] = None,
    officer_id: Optional[str] = None,
    search: Optional[str] = None
):
    apps = list(DB_APPLICATIONS.values())
    if status:
        apps = [a for a in apps if a["status"] == status]
    if officer_id:
        apps = [a for a in apps if a.get("assigned_officer_id") == officer_id]
    if search:
        s = search.lower()
        apps = [a for a in apps if s in a["student_name"].lower() or s in a["application_number"].lower()]
    return apps

@app.get("/api/applications/{app_id}")
def get_application_by_id(app_id: str):
    app = DB_APPLICATIONS.get(app_id)
    if not app:
        # Try matching by application_number
        for a in DB_APPLICATIONS.values():
            if a["application_number"] == app_id:
                return a
        raise HTTPException(status_code=404, detail="Application not found")
    return app

# --- DOCUMENT INTELLIGENCE ---
@app.post("/api/documents/upload")
def upload_document(
    doc_type: str = Form(...),
    simulate_blurry: bool = Form(False),
    application_id: str = Form("NFST-2026-00821")
):
    file_name = f"{doc_type.replace(' ', '_')}_upload.pdf"
    if simulate_blurry:
        file_name = f"Blurry_{file_name}"

    res = DocumentIntelligence.process_upload(file_name, doc_type, simulate_blurry)
    
    if res["success"]:
        # Attach to application if exists
        app = DB_APPLICATIONS.get(application_id)
        if app:
            new_doc = {
                "id": f"DOC-{len(app['documents']) + 1}",
                "application_id": application_id,
                "doc_type": doc_type,
                "file_name": file_name,
                "quality": "GOOD",
                "ocr_confidence": 0.97,
                "is_valid": True,
                "extracted_fields": res["extracted_fields"]
            }
            app["documents"].append(new_doc)
            
            # Add audit record
            DB_AUDIT_LOGS.append({
                "id": f"AUD-{len(DB_AUDIT_LOGS)+1:02d}",
                "application_id": application_id,
                "timestamp": datetime.datetime.now().strftime("%d %b %H:%M"),
                "actor": "Student",
                "actor_role": "STUDENT",
                "action": f"Document Uploaded ({doc_type})",
                "reason": "Immediate OCR & pre-submission check passed",
                "scheme_version": app.get("scheme_version", "NFST-2026.1")
            })

    return res

# --- DEFICIENCY RESOLUTION LOOP ---
@app.post("/api/deficiencies/{deficiency_id}/resolve")
def resolve_deficiency(deficiency_id: str, payload: Dict[str, Any]):
    app_id = payload.get("application_id", "NFST-2026-00821")
    app = DB_APPLICATIONS.get(app_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    # Find deficiency
    def_found = None
    for d in app["deficiencies"]:
        if d["id"] == deficiency_id:
            d["status"] = "RESOLVED"
            d["resolved_at"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            def_found = d
            break

    if def_found:
        # Update application cross doc status
        app["cross_doc_status"]["dob_match"] = True
        app["cross_doc_status"]["overall_status"] = "PASS"
        app["cross_doc_status"]["flags"] = []
        app["status"] = "OFFICER_SCRUTINY"
        app["current_stage_label"] = "Officer Scrutiny"

        # Record decision replay audit
        DB_AUDIT_LOGS.append({
            "id": f"AUD-{len(DB_AUDIT_LOGS)+1:02d}",
            "application_id": app_id,
            "timestamp": datetime.datetime.now().strftime("%d %b %H:%M"),
            "actor": "Arun Kumar (Student)",
            "actor_role": "STUDENT",
            "action": "Deficiency Corrected & Document Revalidated",
            "reason": "Corrected DOB document revalidated by AI. Status updated to RESOLVED.",
            "scheme_version": app.get("scheme_version", "NFST-2026.1")
        })

        return {"success": True, "message": "Deficiency resolved and AI revalidated successfully", "application": app}

    raise HTTPException(status_code=404, detail="Deficiency ID not found")

# --- OFFICER WORKBENCH ---
@app.get("/api/officer/queue")
def get_officer_queue():
    apps = list(DB_APPLICATIONS.values())
    scrutiny_apps = [a for a in apps if a["status"] in ["OFFICER_SCRUTINY", "SUBMITTED", "DEFICIENT"]]
    
    # Priority sorting: high priority if anomaly or DOB mismatch
    prioritized = []
    for a in scrutiny_apps:
        priority = "LOW"
        if a.get("anomaly_score", 0) > 0.8 or not a["cross_doc_status"]["dob_match"]:
            priority = "HIGH"
        elif a["status"] == "DEFICIENT":
            priority = "MEDIUM"

        prioritized.append({
            "priority": priority,
            "id": a["id"],
            "application_number": a["application_number"],
            "student_name": a["student_name"],
            "reason": a["cross_doc_status"]["flags"][0] if a["cross_doc_status"]["flags"] else "Standard Document Review",
            "age_days": 2,
            "sla_days_remaining": 5 if priority != "HIGH" else 2,
            "assigned_officer": a.get("assigned_officer_name", "Dr. Rajeshwar Prasad"),
            "status": a["status"]
        })

    # Sort HIGH -> MEDIUM -> LOW
    prioritized.sort(key=lambda x: 0 if x["priority"] == "HIGH" else (1 if x["priority"] == "MEDIUM" else 2))
    return prioritized

@app.post("/api/officer/decision")
def record_officer_decision(payload: Dict[str, Any]):
    app_id = payload.get("application_id")
    action = payload.get("action")  # APPROVE, REQUEST_CORRECTION, ESCALATE, REJECT
    reason = payload.get("reason", "Officer review completed")

    app = DB_APPLICATIONS.get(app_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if action == "APPROVE":
        app["status"] = "APPROVED"
        app["current_stage_label"] = "Approved (Awarded)"
        # Update Fellowship state
        DB_FELLOWSHIP["status"] = "ACTIVE"
    elif action == "REQUEST_CORRECTION":
        app["status"] = "DEFICIENT"
        app["current_stage_label"] = "Documents Required"
        # Add new deficiency
        new_def = {
            "id": f"DEF-{app_id}-{len(app['deficiencies'])+1:02d}",
            "application_id": app_id,
            "doc_type": "Academic Marksheet",
            "severity": "WARNING",
            "problem": reason,
            "required_action": "Upload valid document resolving discrepancy",
            "deadline": "05 October 2026",
            "status": "ACTION REQUIRED",
            "created_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "created_by": "Dr. Rajeshwar Prasad",
            "resolved_at": None
        }
        app["deficiencies"].append(new_def)
    elif action == "REJECT":
        app["status"] = "REJECTED"
        app["current_stage_label"] = "Rejected"

    # Add audit entry
    DB_AUDIT_LOGS.append({
        "id": f"AUD-{len(DB_AUDIT_LOGS)+1:02d}",
        "application_id": app_id,
        "timestamp": datetime.datetime.now().strftime("%d %b %H:%M"),
        "actor": "Dr. Rajeshwar Prasad (Officer)",
        "actor_role": "OFFICER",
        "action": f"Officer Decision: {action}",
        "reason": reason,
        "scheme_version": app.get("scheme_version", "NFST-2026.1")
    })

    return {"success": True, "status": app["status"], "application": app}

# --- FELLOWSHIP LIFECYCLE ---
@app.get("/api/fellowship")
def get_fellowship_details():
    return DB_FELLOWSHIP

# --- MOTA COMMAND CENTER ---
@app.get("/api/mota/command-center")
def get_mota_command_center():
    apps = list(DB_APPLICATIONS.values())
    total = len(apps)
    approved = len([a for a in apps if a["status"] in ["APPROVED", "SELECTED"]])
    deficient = len([a for a in apps if a["status"] == "DEFICIENT"])
    scrutiny = len([a for a in apps if a["status"] == "OFFICER_SCRUTINY"])
    rejected = len([a for a in apps if a["status"] == "REJECTED"])

    return {
        "metrics": {
            "total_applications": total,
            "verified_eligible": approved + scrutiny,
            "pending_scrutiny": scrutiny,
            "active_deficiencies": deficient,
            "approved_awarded": approved,
            "rejected": rejected,
            "avg_processing_time_days": 4.7,
            "deficiency_cycle_reduction_pct": 68.0
        },
        "bottleneck_intelligence": {
            "highest_delay_stage": "Document Verification",
            "average_processing_days": 4.7,
            "applications_waiting": 421,
            "overdue_applications": 73,
            "recommended_action": "Redistribute 150 applications from Region-A to Region-B queue"
        },
        "state_distribution": [
            {"state": "Tamil Nadu", "count": 18, "approved": 12},
            {"state": "Jharkhand", "count": 24, "approved": 15},
            {"state": "Odisha", "count": 20, "approved": 11},
            {"state": "Chhattisgarh", "count": 15, "approved": 8},
            {"state": "Madhya Pradesh", "count": 23, "approved": 14}
        ]
    }

# --- DECISION REPLAY ---
@app.get("/api/audit/{application_id}")
def get_audit_timeline(application_id: str):
    timeline = [log for log in DB_AUDIT_LOGS if log["application_id"] == application_id]
    if not timeline:
        return DB_AUDIT_LOGS  # Fallback to demo timeline
    return timeline

# --- AI CHATBOT & SARVAM SERVICES ---
@app.post("/api/ai/chat")
def chatbot_query(payload: Dict[str, Any]):
    query = payload.get("query", "What is my application status?")
    app_id = payload.get("application_id", "NFST-2026-00821")
    
    app_data = DB_APPLICATIONS.get(app_id, {})
    scheme_data = DB_SCHEMES.get("SCHEME-NFST", {})
    
    answer = groq_service.ask(query, app_data, scheme_data)
    return {"query": query, "answer": answer}

@app.post("/api/language/translate")
def translate_text(payload: Dict[str, Any]):
    text = payload.get("text", "")
    source_lang = payload.get("source_lang", "en")
    target_lang = payload.get("target_lang", "ta")
    
    translated = sarvam_service.translate_text(text, source_lang, target_lang)
    return {"original": text, "translated": translated, "target_lang": target_lang}

@app.post("/api/language/stt")
def speech_to_text(payload: Dict[str, Any]):
    lang = payload.get("language_code", "ta-IN")
    res = sarvam_service.speech_to_text(language_code=lang)
    return res

# --- CONNECTED INTEGRATIONS STATUS ---
@app.get("/api/integrations/status")
def get_integration_statuses():
    return [
        IdentityVerificationAdapter.verify_aadhaar("XXXX-XXXX-8912"),
        DigiLockerAdapter.fetch_document("INCOME", "uri"),
        PFMSAdapter.get_dbt_status("NFST-2026-00821"),
        NSPAdapter.sync_scheme_data("NFST")
    ]
