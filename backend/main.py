import os
import datetime
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from dotenv import load_dotenv
load_dotenv()

from database import get_db, engine
from init_db import init_db
from models.domain import UserProfile, SchemeConfig, Application
from services.rules_engine import RulesEngine
from services.doc_intelligence import DocumentIntelligence
from services.anomaly_engine import AnomalyEngine
from services.groq_service import GroqChatService
from services.sarvam_service import SarvamLanguageService
from adapters.connected_adapters import (
    IdentityVerificationAdapter, DigiLockerAdapter, PFMSAdapter, NSPAdapter
)
import repositories.crud as crud

import contextlib

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(
    title="SAHA API",
    description="Intelligent Scholarship Verification & Lifecycle Platform API (Ministry of Tribal Affairs)",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

groq_service = GroqChatService()
sarvam_service = SarvamLanguageService()

@app.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    apps_count = len(crud.get_applications(db))
    return {
        "status": "HEALTHY",
        "platform": "SAHA",
        "tagline": "From application to opportunity.",
        "timestamp": datetime.datetime.now().isoformat(),
        "total_applications": apps_count,
        "database": "CONNECTED"
    }

# --- STUDENT & SCHEMES ---
@app.get("/api/student/profile")
def get_student_profile(db: Session = Depends(get_db)):
    profile = crud.get_student_profile(db)
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return profile

@app.get("/api/schemes")
def get_schemes(db: Session = Depends(get_db)):
    return crud.get_schemes(db)

@app.post("/api/schemes/evaluate")
def evaluate_eligibility(payload: Dict[str, Any], db: Session = Depends(get_db)):
    profile_data = payload.get("profile") or crud.get_student_profile(db)
    scheme_id = payload.get("scheme_id", "SCHEME-NFST")
    
    scheme_dict = crud.get_scheme_by_id(db, scheme_id)
    if not scheme_dict:
        raise HTTPException(status_code=404, detail="Scheme not found")
        
    scheme = SchemeConfig(**scheme_dict)
    profile = UserProfile(**profile_data)
    result = RulesEngine.evaluate(profile, scheme)
    return result

@app.post("/api/schemes/simulate")
def simulate_scheme_impact(payload: Dict[str, Any], db: Session = Depends(get_db)):
    old_income = float(payload.get("old_income_limit", 200000.0))
    new_income = float(payload.get("new_income_limit", 250000.0))
    
    apps_list = crud.get_applications(db)
    result = RulesEngine.simulate_impact(apps_list, old_income, new_income)
    return result

# --- APPLICATIONS ---
@app.get("/api/applications")
def get_applications(
    status: Optional[str] = None,
    officer_id: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return crud.get_applications(db, status=status, officer_id=officer_id, search=search)

@app.get("/api/applications/{app_id}")
def get_application_by_id(app_id: str, db: Session = Depends(get_db)):
    app = crud.get_application_by_id(db, app_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app

# --- DOCUMENT INTELLIGENCE ---
if os.getenv("VERCEL") or os.getenv("VERCEL_ENV"):
    UPLOAD_DIR = "/tmp/uploads"
else:
    UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/api/documents/upload")
async def upload_document(
    doc_type: str = Form(...),
    simulate_blurry: bool = Form(False),
    application_id: str = Form("NFST-2026-00821"),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    file_bytes = None
    if file:
        file_name = file.filename
        file_bytes = await file.read()
        # Save file to local uploads directory (outside git tracking)
        save_path = os.path.join(UPLOAD_DIR, file_name)
        with open(save_path, "wb") as f:
            f.write(file_bytes)
    else:
        file_name = f"{doc_type.replace(' ', '_')}_upload.pdf"
        if simulate_blurry:
            file_name = f"Blurry_{file_name}"

    res = DocumentIntelligence.process_upload(
        file_name=file_name, 
        doc_type=doc_type, 
        simulate_blurry=simulate_blurry,
        file_bytes=file_bytes
    )
    
    if res["success"]:
        app = crud.get_application_by_id(db, application_id)
        if app:
            docs = app.get("documents", [])
            new_doc = {
                "id": f"DOC-{len(docs) + 1}",
                "application_id": application_id,
                "doc_type": doc_type,
                "file_name": file_name,
                "quality": res.get("quality_status", "GOOD"),
                "ocr_confidence": res.get("ocr_confidence", 0.97),
                "is_valid": True,
                "extracted_fields": res["extracted_fields"]
            }
            docs.append(new_doc)
            app["documents"] = docs
            crud.update_application(db, app)

            crud.add_audit_record(db, {
                "id": f"AUD-{len(crud.get_audit_timeline(db, application_id))+1:02d}",
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
def resolve_deficiency(
    deficiency_id: str, 
    payload: Dict[str, Any], 
    db: Session = Depends(get_db)
):
    app_id = payload.get("application_id", "NFST-2026-00821")
    updated_app = crud.resolve_deficiency(db, app_id, deficiency_id)
    if updated_app:
        return {"success": True, "message": "Deficiency resolved and AI revalidated successfully", "application": updated_app}
    raise HTTPException(status_code=404, detail="Deficiency ID not found")

# --- OFFICER WORKBENCH ---
@app.get("/api/officer/queue")
def get_officer_queue(db: Session = Depends(get_db)):
    apps = crud.get_applications(db)
    scrutiny_apps = [a for a in apps if a["status"] in ["OFFICER_SCRUTINY", "SUBMITTED", "DEFICIENT"]]
    
    prioritized = []
    for a in scrutiny_apps:
        priority = "LOW"
        flags = a.get("cross_doc_status", {}).get("flags", [])
        dob_match = a.get("cross_doc_status", {}).get("dob_match", True)

        if a.get("anomaly_score", 0) > 0.8 or not dob_match:
            priority = "HIGH"
        elif a["status"] == "DEFICIENT":
            priority = "MEDIUM"

        prioritized.append({
            "priority": priority,
            "id": a["id"],
            "application_number": a["application_number"],
            "student_name": a["student_name"],
            "reason": flags[0] if flags else "Standard Document Review",
            "age_days": 2,
            "sla_days_remaining": 5 if priority != "HIGH" else 2,
            "assigned_officer": a.get("assigned_officer_name", "Dr. Rajeshwar Prasad"),
            "status": a["status"]
        })

    prioritized.sort(key=lambda x: 0 if x["priority"] == "HIGH" else (1 if x["priority"] == "MEDIUM" else 2))
    return prioritized

@app.post("/api/officer/decision")
def record_officer_decision(payload: Dict[str, Any], db: Session = Depends(get_db)):
    app_id = payload.get("application_id")
    action = payload.get("action")  # APPROVE, REQUEST_CORRECTION, ESCALATE, REJECT
    reason = payload.get("reason", "Officer review completed")

    updated_app = crud.record_officer_decision(db, app_id, action, reason)
    if updated_app:
        return {"success": True, "status": updated_app["status"], "application": updated_app}
    raise HTTPException(status_code=404, detail="Application not found")

# --- FELLOWSHIP LIFECYCLE ---
@app.get("/api/fellowship")
def get_fellowship_details(db: Session = Depends(get_db)):
    return crud.get_fellowship(db)

# --- MOTA COMMAND CENTER ---
@app.get("/api/mota/command-center")
def get_mota_command_center(db: Session = Depends(get_db)):
    apps = crud.get_applications(db)
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
def get_audit_timeline(application_id: str, db: Session = Depends(get_db)):
    return crud.get_audit_timeline(db, application_id)

# --- AI CHATBOT & SARVAM SERVICES ---
@app.post("/api/ai/chat")
def chatbot_query(payload: Dict[str, Any], db: Session = Depends(get_db)):
    query = payload.get("query") or payload.get("message") or "What is my application status?"
    app_id = payload.get("application_id", "NFST-2026-00821")
    target_lang = payload.get("language") or payload.get("lang") or "en"
    
    app_data = crud.get_application_by_id(db, app_id) or {}
    scheme_id = app_data.get("scheme_id", "SCHEME-NFST")
    scheme_data = crud.get_scheme_by_id(db, scheme_id) or {}
    profile_data = crud.get_student_profile(db) or {}
    fellowship_data = crud.get_fellowship(db) or {}

    # 1. Translate user query to canonical English if non-English
    canonical_query = query
    if target_lang != "en":
        canonical_query = sarvam_service.translate_text(query, source_lang=target_lang, target_lang="en")

    # 2. Get grounded answer from Groq / Deterministic DB fallback
    answer_res = groq_service.provider.ask(
        query=canonical_query,
        app_context=app_data,
        scheme_context=scheme_data,
        profile_context=profile_data,
        fellowship_context=fellowship_data
    )
    canonical_answer = answer_res["answer"]

    # 3. Translate grounded answer to user target language if non-English
    localized_answer = canonical_answer
    if target_lang != "en":
        localized_answer = sarvam_service.translate_text(canonical_answer, source_lang="en", target_lang=target_lang)

    # 4. Audit log metadata
    provider_info = answer_res["provider"]
    if target_lang != "en":
        provider_info += f" + Sarvam_Translate_{target_lang}"

    crud.add_audit_record(db, {
        "id": f"AUD-CHAT-{len(crud.get_audit_timeline(db, app_id))+1:02d}",
        "application_id": app_id,
        "timestamp": datetime.datetime.now().strftime("%d %b %H:%M"),
        "actor": "Arun Kumar (Student)",
        "actor_role": "STUDENT",
        "action": f"Grounded AI Chatbot Query ({target_lang.upper()})",
        "reason": f"Query: '{query[:40]}...' via {provider_info}",
        "scheme_version": app_data.get("scheme_version", "NFST-2026.1")
    })

    return {
        "query": query, 
        "canonical_query": canonical_query,
        "language": target_lang,
        "answer": localized_answer,
        "canonical_answer": canonical_answer,
        "provider": provider_info,
        "is_fallback": answer_res["is_fallback"],
        "grounded_facts": answer_res["grounded_facts"]
    }

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

if __name__ == "__main__":
    import uvicorn
    print("Starting SETU FastAPI Backend on http://127.0.0.1:8002...")
    uvicorn.run("main:app", host="127.0.0.1", port=8002, reload=True)
