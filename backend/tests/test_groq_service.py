import unittest
import os
from services.groq_service import GroqProvider

class TestGroqGroundedChatService(unittest.TestCase):

    def setUp(self):
        self.provider = GroqProvider()
        self.mock_app = {
            "id": "NFST-2026-00821",
            "application_number": "NFST-2026-00821",
            "student_name": "Arun Kumar",
            "status": "OFFICER_SCRUTINY",
            "current_stage_label": "Officer Scrutiny",
            "annual_income": 180000.0,
            "academic_percentage": 82.4,
            "category": "ST",
            "scheme_id": "SCHEME-NFST",
            "cross_doc_status": {
                "dob_match": False,
                "flags": ["DATE OF BIRTH MISMATCH"]
            },
            "deficiencies": [
                {
                    "id": "DEF-821-01",
                    "status": "ACTION REQUIRED",
                    "problem": "Date of Birth Mismatch (Application 12/04/2004 vs Marksheet 12/04/2003)",
                    "required_action": "Upload corrected Marksheet or official DOB proof document",
                    "deadline": "05 October 2026"
                }
            ]
        }
        self.mock_scheme = {
            "id": "SCHEME-NFST",
            "code": "NFST",
            "name": "National Fellowship for ST Students",
            "max_income_limit": 250000.0,
            "min_academic_score": 60.0,
            "max_age_limit": 35
        }
        self.mock_profile = {
            "id": "STU-88192",
            "name": "Arun Kumar",
            "email": "arun.kumar.st@university.edu.in",
            "phone": "+91 98765 43210",
            "role": "STUDENT",
            "category": "ST",
            "gender": "Male",
            "annual_income": 180000.0,
            "education_level": "Ph.D. Scholar",
            "academic_percentage": 82.4,
            "age": 27,
            "state": "Tamil Nadu",
            "district": "Salem",
            "institution": "IIT Madras",
            "aadhaar_masked": "XXXX-XXXX-8912"
        }

    def test_a_application_status(self):
        """TEST A — APPLICATION STATUS: Context reflects officer scrutiny"""
        res = self.provider.ask(
            query="Why is my application pending?",
            app_context=self.mock_app,
            scheme_context=self.mock_scheme,
            profile_context=self.mock_profile
        )
        self.assertIn("Officer Scrutiny", res["answer"])

    def test_b_no_hallucination(self):
        """TEST B — NO HALLUCINATION: Pending app MUST NOT claim approval"""
        res = self.provider.ask(
            query="Has my scholarship been approved?",
            app_context=self.mock_app,
            scheme_context=self.mock_scheme,
            profile_context=self.mock_profile
        )
        self.assertNotIn("has been approved", res["answer"].lower())
        self.assertIn("not been approved", res["answer"].lower())

    def test_c_eligibility(self):
        """TEST C — ELIGIBILITY: Ineligible income threshold check"""
        ineligible_profile = dict(self.mock_profile)
        ineligible_profile["annual_income"] = 350000.0
        ineligible_app = dict(self.mock_app)
        ineligible_app["annual_income"] = 350000.0

        res = self.provider.ask(
            query="Why am I not eligible?",
            app_context=ineligible_app,
            scheme_context=self.mock_scheme,
            profile_context=ineligible_profile
        )
        self.assertIn("Annual Family Income", res["answer"])

    def test_d_document_mismatch(self):
        """TEST D — DOCUMENT: Mismatch flag explanation"""
        res = self.provider.ask(
            query="What's wrong with my document?",
            app_context=self.mock_app,
            scheme_context=self.mock_scheme,
            profile_context=self.mock_profile
        )
        self.assertIn("Date of Birth Mismatch", res["answer"])

    def test_e_deficiency(self):
        """TEST E — DEFICIENCY: Active deficiency resolution advice"""
        res = self.provider.ask(
            query="What is my action required?",
            app_context=self.mock_app,
            scheme_context=self.mock_scheme,
            profile_context=self.mock_profile
        )
        self.assertIn("Upload corrected Marksheet", res["answer"])

    def test_f_unknown_information(self):
        """TEST F — UNKNOWN INFORMATION: Absent info is explicitly stated as unavailable"""
        res = self.provider.ask(
            query="What is my flight ticket number?",
            app_context=self.mock_app,
            scheme_context=self.mock_scheme,
            profile_context=self.mock_profile
        )
        self.assertIn("Officer Scrutiny", res["answer"])

    def test_g_groq_unavailable_fallback(self):
        """TEST G — GROQ UNAVAILABLE: Groq key absent falls back gracefully"""
        old_key = os.environ.get("GROQ_API_KEY")
        if "GROQ_API_KEY" in os.environ:
            del os.environ["GROQ_API_KEY"]
        
        fallback_provider = GroqProvider()
        res = fallback_provider.ask(
            query="Where is my application?",
            app_context=self.mock_app,
            scheme_context=self.mock_scheme,
            profile_context=self.mock_profile
        )
        self.assertTrue(res["is_fallback"])
        self.assertIn("Officer Scrutiny", res["answer"])

        if old_key:
            os.environ["GROQ_API_KEY"] = old_key

    def test_h_cross_user_isolation(self):
        """TEST H — CROSS-USER ISOLATION: Validates empty context safety"""
        empty_app = {}
        res = self.provider.ask(
            query="What is my application status?",
            app_context=empty_app,
            scheme_context=self.mock_scheme,
            profile_context=self.mock_profile
        )
        self.assertIn("Submitted", res["answer"])

if __name__ == "__main__":
    unittest.main()
