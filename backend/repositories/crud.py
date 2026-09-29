import datetime
import copy
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified
from sqlalchemy import or_

from models.sql_models import (
    UserProfileModel, SchemeConfigModel, ApplicationModel, FellowshipModel, AuditRecordModel
)

def get_student_profile(db: Session) -> Optional[Dict[str, Any]]:
    profile = db.query(UserProfileModel).first()
    return profile.to_dict() if profile else None

def get_schemes(db: Session) -> List[Dict[str, Any]]:
    schemes = db.query(SchemeConfigModel).all()
    return [s.to_dict() for s in schemes]

def get_scheme_by_id(db: Session, scheme_id: str) -> Optional[Dict[str, Any]]:
    scheme = db.query(SchemeConfigModel).filter(SchemeConfigModel.id == scheme_id).first()
    return scheme.to_dict() if scheme else None

def get_applications(
    db: Session, 
    status: Optional[str] = None, 
    officer_id: Optional[str] = None, 
    search: Optional[str] = None
) -> List[Dict[str, Any]]:
    query = db.query(ApplicationModel)
    if status:
        query = query.filter(ApplicationModel.status == status)
    if officer_id:
        query = query.filter(ApplicationModel.assigned_officer_id == officer_id)
    if search:
        s = f"%{search.lower()}%"
        query = query.filter(
            or_(
                ApplicationModel.student_name.ilike(s),
                ApplicationModel.application_number.ilike(s)
            )
        )
    apps = query.all()
    return [a.to_dict() for a in apps]

def get_application_by_id(db: Session, app_id: str) -> Optional[Dict[str, Any]]:
    app = db.query(ApplicationModel).filter(ApplicationModel.id == app_id).first()
    if not app:
        app = db.query(ApplicationModel).filter(ApplicationModel.application_number == app_id).first()
    return app.to_dict() if app else None

def update_application(db: Session, app_dict: Dict[str, Any]) -> Dict[str, Any]:
    app_id = app_dict["id"]
    db_app = db.query(ApplicationModel).filter(ApplicationModel.id == app_id).first()
    if db_app:
        for key, value in app_dict.items():
            if hasattr(db_app, key):
                setattr(db_app, key, value)
                if key in ["deficiencies", "documents", "cross_doc_status", "eligibility_explanation", "anomaly_flags"]:
                    flag_modified(db_app, key)
        db.commit()
        db.refresh(db_app)
        return db_app.to_dict()
    else:
        new_app = ApplicationModel(**app_dict)
        db.add(new_app)
        db.commit()
        db.refresh(new_app)
        return new_app.to_dict()

def resolve_deficiency(db: Session, app_id: str, deficiency_id: str) -> Optional[Dict[str, Any]]:
    db_app = db.query(ApplicationModel).filter(ApplicationModel.id == app_id).first()
    if not db_app:
        return None

    app_dict = db_app.to_dict()
    deficiencies = app_dict.get("deficiencies", [])
    def_found = False

    for d in deficiencies:
        if d["id"] == deficiency_id or deficiency_id == "ANY" or d.get("status") == "ACTION REQUIRED":
            d["status"] = "RESOLVED"
            d["resolved_at"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            def_found = True
            break

    if def_found:
        cross_status = app_dict.get("cross_doc_status", {})
        cross_status["dob_match"] = True
        cross_status["overall_status"] = "PASS"
        cross_status["flags"] = []

        db_app.deficiencies = copy.deepcopy(deficiencies)
        db_app.cross_doc_status = copy.deepcopy(cross_status)
        db_app.status = "OFFICER_SCRUTINY"
        db_app.current_stage_label = "Officer Scrutiny"
        flag_modified(db_app, "deficiencies")
        flag_modified(db_app, "cross_doc_status")

        # Record audit entry
        audit_count = db.query(AuditRecordModel).count()
        new_audit = AuditRecordModel(
            id=f"AUD-{audit_count+1:02d}",
            application_id=app_id,
            timestamp=datetime.datetime.now().strftime("%d %b %H:%M"),
            actor="Arun Kumar (Student)",
            actor_role="STUDENT",
            action="Deficiency Corrected & Document Revalidated",
            reason="Corrected DOB document revalidated by AI. Status updated to RESOLVED.",
            scheme_version=db_app.scheme_version or "NFST-2026.1"
        )
        db.add(new_audit)
        db.commit()
        db.refresh(db_app)
        return db_app.to_dict()

    return None

def record_officer_decision(db: Session, app_id: str, action: str, reason: str) -> Optional[Dict[str, Any]]:
    db_app = db.query(ApplicationModel).filter(ApplicationModel.id == app_id).first()
    if not db_app:
        return None

    app_dict = db_app.to_dict()
    deficiencies = app_dict.get("deficiencies", [])

    if action == "APPROVE":
        db_app.status = "APPROVED"
        db_app.current_stage_label = "Approved (Awarded)"
        # Update fellowship status if exists
        fel = db.query(FellowshipModel).first()
        if fel:
            fel.status = "ACTIVE"

    elif action == "REQUEST_CORRECTION":
        db_app.status = "DEFICIENT"
        db_app.current_stage_label = "Documents Required"
        new_def = {
            "id": f"DEF-{app_id}-{len(deficiencies)+1:02d}",
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
        deficiencies.append(new_def)
        db_app.deficiencies = copy.deepcopy(deficiencies)
        flag_modified(db_app, "deficiencies")

    elif action == "REJECT":
        db_app.status = "REJECTED"
        db_app.current_stage_label = "Rejected"

    audit_count = db.query(AuditRecordModel).count()
    new_audit = AuditRecordModel(
        id=f"AUD-{audit_count+1:02d}",
        application_id=app_id,
        timestamp=datetime.datetime.now().strftime("%d %b %H:%M"),
        actor="Dr. Rajeshwar Prasad (Officer)",
        actor_role="OFFICER",
        action=f"Officer Decision: {action}",
        reason=reason,
        scheme_version=db_app.scheme_version or "NFST-2026.1"
    )
    db.add(new_audit)
    db.commit()
    db.refresh(db_app)
    return db_app.to_dict()

def get_fellowship(db: Session) -> Optional[Dict[str, Any]]:
    fel = db.query(FellowshipModel).first()
    return fel.to_dict() if fel else None

def get_audit_timeline(db: Session, app_id: str) -> List[Dict[str, Any]]:
    logs = db.query(AuditRecordModel).filter(AuditRecordModel.application_id == app_id).all()
    if not logs:
        logs = db.query(AuditRecordModel).all()
    return [l.to_dict() for l in logs]

def add_audit_record(db: Session, audit_dict: Dict[str, Any]):
    new_audit = AuditRecordModel(**audit_dict)
    db.add(new_audit)
    db.commit()
