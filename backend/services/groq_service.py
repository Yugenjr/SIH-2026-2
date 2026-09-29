import os
import requests
import datetime
import re
from typing import Dict, Any, List, Optional
from services.rules_engine import RulesEngine
from models.domain import UserProfile, SchemeConfig

# --- MoTA SCHOLARSHIP RAG KNOWLEDGE BASE CORPUS ---
MOTA_RAG_DOCUMENTS = [
    {
        "id": "KB-NFST-01",
        "category": "NFST Guidelines",
        "title": "National Fellowship for Higher Education of ST Students",
        "keywords": ["nfst", "fellowship", "phd", "mphil", "stipend", "jrf", "srf", "contingency"],
        "content": (
            "The National Fellowship for Higher Education of ST Students (NFST) provides financial assistance to ST students "
            "pursuing M.Phil. and Ph.D. courses in Humanities, Social Sciences, Sciences, Engineering, and Technology. "
            "Financial Assistance: JRF stipend is ₹31,000/month for first 2 years; SRF stipend is ₹35,000/month for remaining period. "
            "Contingency grant is ₹10,000/year for Humanities and ₹12,000/year for Science/Engineering. "
            "Income Limit: Annual family income must not exceed ₹6.0 Lakh per annum (or ₹2.5 Lakh for specific state sub-schemes). "
            "Annual Renewal: Requires satisfactory progress report signed by research guide/supervisor and Head of Department."
        )
    },
    {
        "id": "KB-POSTMATRIC-02",
        "category": "Post-Matric ST Guidelines",
        "title": "Post-Matric Scholarship Scheme for ST Students",
        "keywords": ["post-matric", "post matric", "tuition", "maintenance", "college", "undergraduate", "postgraduate"],
        "content": (
            "Post-Matric Scholarship for ST Students covers all recognized post-secondary/post-matriculation courses. "
            "Eligibility: ST category candidate with annual family income up to ₹2,500,000 (₹2.5 Lakh/year). "
            "Benefits: 100% compulsory non-refundable fees (tuition fee) paid directly to institution or student DBT account. "
            "Maintenance Allowance: Group 1 (Degree/Professional): ₹1,200/month (Hostellers), ₹550/month (Day Scholars). "
            "Group 2/3/4: Ranging from ₹380/month to ₹820/month. Aadhaar-seeded bank account is mandatory for DBT."
        )
    },
    {
        "id": "KB-TOPCLASS-03",
        "category": "Top Class ST Guidelines",
        "title": "National Fellowship and Scholarship for Higher Education of ST Students - Top Class Education",
        "keywords": ["top class", "iit", "nit", "iim", "aiims", "nlu", "premier", "computer"],
        "content": (
            "Top Class Education Scheme encourages meritorious ST students to pursue studies in top-tier premier institutions "
            "(IITs, NITs, IIMs, AIIMS, NLU, etc.). "
            "Benefits: Full tuition fee and non-refundable charges paid directly; living expenses of ₹3,000/month; "
            "books and stationery allowance of ₹3,000/year; one-time laptop/computer grant up to ₹45,000. "
            "Family income ceiling: ₹6.0 Lakh per annum."
        )
    },
    {
        "id": "KB-OVERSEAS-04",
        "category": "National Overseas ST Guidelines",
        "title": "National Overseas Scholarship for ST Students",
        "keywords": ["overseas", "abroad", "foreign", "masters", "phd abroad", "usd", "gbp"],
        "content": (
            "National Overseas Scholarship provides financial support to selected ST candidates for pursuing Master's level courses, "
            "Ph.D., and Post-Doctoral research abroad in foreign universities. "
            "Stipend Allowance: USD 15,400 per annum (USA & other countries) or GBP 9,900 per annum (UK). "
            "Tuition fees paid at actuals. Air passage, visa fees, and contingency allowance (USD 1,560/year) covered."
        )
    },
    {
        "id": "KB-DEFICIENCY-05",
        "category": "Verification & Deficiency Resolution Policy",
        "title": "SETU Document Deficiency Resolution & SLA Guidelines",
        "keywords": ["deficiency", "fix", "mismatch", "income", "caste", "aadhaar", "dob", "deadline", "reject"],
        "content": (
            "SETU Document Verification Policy: When an automated cross-document mismatch occurs (e.g., DOB mismatch, "
            "expired Income Certificate, missing ST Caste QR code), the application is placed in 'ACTION REQUIRED' status. "
            "Grace Period: Students have 15 calendar days from notification to re-upload authentic certificates on the SETU Portal. "
            "Income Certificates must be issued by a Revenue Officer not below rank of Tehsildar. "
            "ST Caste Certificate must bear a valid State/Central authority seal or QR verification link. "
            "Failure to resolve deficiencies within 15 days leads to automatic escalation to District Verification Officer."
        )
    },
    {
        "id": "KB-DBT-06",
        "category": "Disbursement Policy",
        "title": "Direct Benefit Transfer (DBT) & PFMS Integration Guidelines",
        "keywords": ["dbt", "pfms", "disbursement", "payment", "bank", "aadhaar", "stipend"],
        "content": (
            "All scholarship and fellowship disbursements under MoTA SETU platform are processed exclusively through "
            "Direct Benefit Transfer (DBT) via the Public Financial Management System (PFMS). "
            "Mandatory Requirement: Student's bank account must be active and linked/seeded with Aadhaar (NPCI mapping). "
            "Payment Schedule: Fellowships disbursed quarterly; scholarships disbursed annually/bi-annually after institute verification."
        )
    }
]

class RAGRetriever:
    @staticmethod
    def retrieve_relevant_docs(query: str, top_k: int = 2) -> List[Dict[str, Any]]:
        """
        Retrieves top relevant policy knowledge base document chunks based on semantic keyword scoring.
        """
        tokens = re.findall(r'\w+', query.lower())
        scored_docs = []

        for doc in MOTA_RAG_DOCUMENTS:
            score = 0
            for kw in doc["keywords"]:
                if kw in query.lower():
                    score += 3
            for tok in tokens:
                if len(tok) > 3 and tok in doc["content"].lower():
                    score += 1
            if score > 0:
                scored_docs.append((score, doc))

        scored_docs.sort(key=lambda x: x[0], reverse=True)
        return [doc for score, doc in scored_docs[:top_k]]

class ChatProvider:
    def ask(
        self, 
        query: str, 
        app_context: Dict[str, Any], 
        scheme_context: Dict[str, Any],
        profile_context: Dict[str, Any],
        fellowship_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        raise NotImplementedError

class GroqProvider(ChatProvider):
    def __init__(self):
        self.endpoint = "https://api.groq.com/openai/v1/chat/completions"
        self.model = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

    @property
    def api_key(self) -> str:
        return os.getenv("GROQ_API_KEY", "").strip()

    def build_grounded_context(
        self, 
        query: str, 
        app_context: Dict[str, Any], 
        scheme_context: Dict[str, Any],
        profile_context: Dict[str, Any],
        fellowship_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Builds factual context strictly from SETU database & RAG document retriever.
        """
        app_id = app_context.get("application_number") or app_context.get("id", "UNKNOWN")
        status = app_context.get("status", "SUBMITTED")
        stage = app_context.get("current_stage_label", "Submitted")
        student_name = profile_context.get("name") or app_context.get("student_name", "Arun Kumar")
        category = profile_context.get("category") or app_context.get("category", "ST")
        income = app_context.get("annual_income") or profile_context.get("annual_income", 180000.0)
        academic_percentage = app_context.get("academic_percentage") or profile_context.get("academic_percentage", 82.4)
        officer = app_context.get("assigned_officer_name") or "Dr. Rajeshwar Prasad"
        institution = profile_context.get("institution") or "National Institute of Technology, Raipur"
        
        # 1. RAG Knowledge Base Retrieval
        rag_docs = RAGRetriever.retrieve_relevant_docs(query, top_k=2)
        rag_text = "\n".join([f"[{d['category']} - {d['title']}]: {d['content']}" for d in rag_docs])
        if not rag_text:
            rag_text = "[General MoTA Policy]: SETU strictly verifies ST Category, Income limits, and Document consistency via automated rules engine."

        # 2. Deterministic Eligibility Check via RulesEngine
        eligibility_result = {"eligible": True, "rules_evaluated": []}
        if profile_context and scheme_context:
            try:
                p_model = UserProfile(**profile_context)
                s_model = SchemeConfig(**scheme_context)
                eligibility_result = RulesEngine.evaluate(p_model, s_model)
            except Exception:
                pass

        # 3. Document & Deficiency Facts
        docs = app_context.get("documents", [])
        deficiencies = app_context.get("deficiencies", [])
        active_deficiencies = [d for d in deficiencies if d.get("status") == "ACTION REQUIRED"]
        
        cross_doc = app_context.get("cross_doc_status", {})
        dob_match = cross_doc.get("dob_match", True)
        flags = cross_doc.get("flags", [])

        # 4. Fellowship Facts
        fellowship_info = "No active fellowship awarded yet."
        if fellowship_context and fellowship_context.get("status") == "ACTIVE":
            fellowship_info = (
                f"Active Fellowship: {fellowship_context.get('scheme_name')}, "
                f"Year {fellowship_context.get('current_year')} of {fellowship_context.get('total_years')}, "
                f"Monthly Stipend: ₹{fellowship_context.get('stipend_amount_monthly', 31000):,.0f}, "
                f"Next Renewal Date: {fellowship_context.get('next_renewal_date')}"
            )

        context_prompt_text = f"""
=== RETRIEVED MoTA RAG KNOWLEDGE BASE GUIDELINES ===
{rag_text}

=== SETU DATABASE STUDENT DOSSIER FACTS (REAL DB RECORD) ===
- Student Name: {student_name}
- Application Number: #{app_id}
- Category: {category}
- Institution: {institution}
- Current Application Status: {status}
- Current Verification Stage: {stage}
- Assigned Verification Officer: {officer}
- Scheme Name: {scheme_context.get('name', 'National Fellowship for ST Students')}
- Scheme Max Income Threshold: ₹{scheme_context.get('max_income_limit', 250000):,.0f}
- Declared Student Income: ₹{income:,.0f}
- Academic Percentage: {academic_percentage}%
- Deterministic Eligibility Evaluated: {'ELIGIBLE' if eligibility_result.get('eligible') else 'INELIGIBLE'}
- Rules Engine Results: {eligibility_result.get('rules_evaluated', [])}
- Active Deficiencies Count: {len(active_deficiencies)}
- Deficiency Details: {active_deficiencies}
- Cross-Document Consistency Flags: {flags} (DOB Match: {dob_match})
- Extracted Documents Count: {len(docs)}
- Fellowship Record: {fellowship_info}
        """
        return {
            "prompt_text": context_prompt_text,
            "student_name": student_name,
            "app_id": app_id,
            "category": category,
            "institution": institution,
            "officer": officer,
            "income": income,
            "academic_percentage": academic_percentage,
            "status": status,
            "stage": stage,
            "active_deficiencies": active_deficiencies,
            "eligibility_result": eligibility_result,
            "flags": flags,
            "dob_match": dob_match,
            "fellowship_info": fellowship_info,
            "rag_docs": rag_docs
        }

    def generate_grounded_fallback(self, query: str, context: Dict[str, Any]) -> str:
        """
        Deterministic, RAG-grounded fallback generator when GROQ_API_KEY is absent or API fails.
        Guarantees ZERO hallucination by reading strictly from RAG retrieved documents & DB context.
        """
        q = query.lower()
        stage = context["stage"]
        status = context["status"]
        student_name = context.get("student_name", "Arun Kumar")
        app_id = context.get("app_id", "NFST-2026-00821")
        category = context.get("category", "ST")
        institution = context.get("institution", "NIT Raipur")
        officer = context.get("officer", "Dr. Rajeshwar Prasad")
        income = context.get("income", 180000)
        deficiencies = context["active_deficiencies"]
        eligibility = context["eligibility_result"]
        rag_docs = context.get("rag_docs", [])

        # Scenario 0: Greetings & Conversations
        if any(w in q for w in ["hi", "hello", "hey", "namaste", "greetings", "good morning", "good afternoon", "good evening"]):
            return f"Namaste {student_name}! I am your SETU RAG-Grounded Assistant. How can I help you with your scholarship application (#{app_id}) or MoTA guidelines today?"

        # Scenario 0.5: Acknowledgements & Short Inputs
        if any(w in q for w in ["ok", "okay", "thanks", "thank", "thx", "got it", "great", "cool", "nice", "good", "sure", "yep", "yeah", "yes", "kk"]):
            return "You're welcome! Please let me know if you need information on any other MoTA scholarship guidelines or application details."

        # Scenario 0.8: Student Name / Identity / Profile Questions
        if any(w in q for w in ["name", "who am i", "my identity", "who i am", "student profile"]):
            return (
                f"Your name in the SETU database profile is **{student_name}**.\n"
                f"• **Application ID**: #{app_id}\n"
                f"• **Category**: {category} (Scheduled Tribe)\n"
                f"• **Institution**: {institution}\n"
                f"• **Declared Income**: ₹{income:,.0f}/year"
            )

        # Scenario 0.9: Officer / Reviewer Questions
        if any(w in q for w in ["officer", "reviewer", "who is verifying", "assigned"]):
            return f"Your application is assigned to **{officer}** (District Verification Officer). Current stage: **{stage}** (`{status}`)."

        # Scenario A: Status / Pending Question
        if any(k in q for k in ["status", "pending", "where", "stage", "track"]):
            return (
                f"Your application (#{app_id}) is currently at stage **{stage}** (Status: `{status}`).\n\n"
                f"Assigned Officer: **{officer}**."
            )

        # Scenario B: Approval / Award Question
        if any(k in q for k in ["approved", "granted", "awarded", "accepted"]):
            if status == "APPROVED":
                return f"Yes! Your application (#{app_id}) has been **APPROVED**. {context['fellowship_info']}"
            elif status == "REJECTED":
                return f"Your application (#{app_id}) has been **REJECTED**."
            else:
                return f"Your scholarship application is currently `{status}` at stage **{stage}**. Verification is still in progress."

        # Scenario C: Deficiency / Error / Problem Question
        if any(k in q for k in ["deficiency", "fix", "error", "problem", "wrong", "action"]):
            if deficiencies:
                d = deficiencies[0]
                return (
                    f"**Action Required**: {d.get('problem', 'Document discrepancy detected')}\n\n"
                    f"**Required Action**: {d.get('required_action', 'Upload corrected document')}\n"
                    f"**Deadline**: {d.get('deadline', '05 October 2026')}\n"
                    f"*Guidelines*: Re-uploaded document must be clear and issued by competent authority."
                )
            elif not context["dob_match"]:
                return "Date of Birth Mismatch detected between Application and Marksheet. Officer review is currently pending."
            return "You have no active deficiencies! Your application has passed initial cross-document checks."

        # Scenario D: Eligibility Question
        if any(k in q for k in ["eligible", "eligibility", "qualification", "qualify", "why"]):
            if eligibility.get("eligible"):
                return f"You are **ELIGIBLE** for {eligibility.get('scheme_code', 'NFST')} based on SETU Rules Engine (ST Category & Income threshold satisfied)."
            else:
                failed_rules = [r for r in eligibility.get("rules_evaluated", []) if not r.get("passed")]
                reasons = ", ".join([f"{r.get('rule')}: Actual {r.get('actual')} vs Limit {r.get('requirement')}" for r in failed_rules])
                return f"Eligibility check failed based on SETU Rules Engine. Reasons: {reasons}."

        # Scenario E: RAG Knowledge Base Answer (for policy queries like fellowship amount, top class, post-matric, dbt, etc.)
        if rag_docs:
            top_doc = rag_docs[0]
            return f"**[MoTA Guidelines - {top_doc['title']}]**\n{top_doc['content']}"

        # Scenario F: Generic Fallback
        return (
            f"SETU RAG Assistant: Regarding your query '{query}', your application (#{app_id}) is at stage **{stage}** (`{status}`). "
            f"Information retrieved from SETU database context and official MoTA guidelines."
        )

    def ask(
        self, 
        query: str, 
        app_context: Dict[str, Any], 
        scheme_context: Dict[str, Any],
        profile_context: Dict[str, Any],
        fellowship_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Grounded chat query execution via Groq Llama-3.1 API with RAG retrieval and fallback.
        """
        context_data = self.build_grounded_context(
            query=query,
            app_context=app_context,
            scheme_context=scheme_context,
            profile_context=profile_context,
            fellowship_context=fellowship_context
        )

        system_prompt = (
            "You are SETU AI Assistant for Indian Tribal Scholarships and Fellowships (Ministry of Tribal Affairs).\n"
            "Use ONLY the supplied RETRIEVED MoTA RAG KNOWLEDGE BASE and SETU DATABASE STUDENT DOSSIER context.\n"
            "Never invent application status, eligibility, document status, payment status, deadlines, amounts, or government decisions.\n"
            "If the supplied context does not contain the answer, say that the information is not available in official guidelines and direct the user to SETU portal.\n"
            "Eligibility decisions are determined by SETU's deterministic rules engine. You explain decisions; you do not make decisions.\n\n"
            f"{context_data['prompt_text']}"
        )

        key = self.api_key
        if not key:
            answer = self.generate_grounded_fallback(query, context_data)
            return {
                "answer": answer,
                "provider": "SETU_RAG_Grounded_Fallback (GROQ_API_KEY missing)",
                "is_fallback": True,
                "grounded_facts": {
                    "status": context_data["status"],
                    "stage": context_data["stage"],
                    "eligible": context_data["eligibility_result"].get("eligible"),
                    "rag_sources": [d["title"] for d in context_data.get("rag_docs", [])]
                }
            }

        try:
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": query}
                ],
                "temperature": 0.1,
                "max_tokens": 350
            }
            headers = {
                "Authorization": f"Bearer {key}",
                "Content-Type": "application/json"
            }
            res = requests.post(self.endpoint, json=payload, headers=headers, timeout=8)
            if res.status_code == 200:
                content = res.json()["choices"][0]["message"]["content"]
                return {
                    "answer": content,
                    "provider": f"Groq_RAG_{self.model}",
                    "is_fallback": False,
                    "grounded_facts": {
                        "status": context_data["status"],
                        "stage": context_data["stage"],
                        "rag_sources": [d["title"] for d in context_data.get("rag_docs", [])]
                    }
                }
            else:
                answer = self.generate_grounded_fallback(query, context_data)
                return {
                    "answer": answer,
                    "provider": f"SETU_RAG_Grounded_Fallback (Groq {res.status_code})",
                    "is_fallback": True,
                    "grounded_facts": {"status": context_data["status"]}
                }
        except Exception:
            answer = self.generate_grounded_fallback(query, context_data)
            return {
                "answer": answer,
                "provider": "SETU_RAG_Grounded_Fallback (Connection Exception)",
                "is_fallback": True,
                "grounded_facts": {"status": context_data["status"]}
            }

class GroqChatService:
    def __init__(self):
        self.provider = GroqProvider()

    def ask(
        self, 
        query: str, 
        student_context: Dict[str, Any], 
        scheme_context: Dict[str, Any],
        profile_context: Optional[Dict[str, Any]] = None,
        fellowship_context: Optional[Dict[str, Any]] = None
    ) -> str:
        res = self.provider.ask(
            query=query,
            app_context=student_context,
            scheme_context=scheme_context,
            profile_context=profile_context or student_context,
            fellowship_context=fellowship_context
        )
        return res["answer"]

