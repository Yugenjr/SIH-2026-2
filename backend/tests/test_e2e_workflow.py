import unittest
from sqlalchemy.orm import Session
from database import engine, Base, SessionLocal
from init_db import init_db
import repositories.crud as crud
from services.rules_engine import RulesEngine
from models.domain import UserProfile, SchemeConfig
from services.groq_service import GroqChatService
from services.sarvam_service import SarvamLanguageService

class TestE2EWorkflowAndIntegration(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # Force fresh demo database for integration test suite
        init_db(force_reset=True)
        cls.db = SessionLocal()
        cls.groq_service = GroqChatService()
        cls.sarvam_service = SarvamLanguageService()

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_01_canonical_demo_student_and_application(self):
        """1. Verify canonical demo student (Arun Kumar) & app #NFST-2026-00821"""
        profile = crud.get_student_profile(self.db)
        self.assertIsNotNone(profile)
        self.assertEqual(profile["name"], "Arun Kumar")
        self.assertEqual(profile["category"], "ST")

        app = crud.get_application_by_id(self.db, "NFST-2026-00821")
        self.assertIsNotNone(app)
        self.assertEqual(app["student_name"], "Arun Kumar")
        self.assertEqual(app["scheme_code"], "NFST")

    def test_02_deterministic_rules_engine_eligibility(self):
        """2. Verify deterministic rules engine evaluates profile facts correctly"""
        profile_dict = crud.get_student_profile(self.db)
        scheme_dict = crud.get_scheme_by_id(self.db, "SCHEME-NFST")
        
        p = UserProfile(**profile_dict)
        s = SchemeConfig(**scheme_dict)
        res = RulesEngine.evaluate(p, s)

        self.assertTrue(res["eligible"])
        self.assertEqual(res["scheme_code"], "NFST")
        self.assertEqual(len(res["rules_evaluated"]), 4)

    def test_03_deficiency_and_revalidation_loop(self):
        """3. Test student deficiency resolution & automatic AI revalidation"""
        app_before = crud.get_application_by_id(self.db, "NFST-2026-00821")
        self.assertIsNotNone(app_before)

        # Resolve deficiency
        resolved_app = crud.resolve_deficiency(self.db, "NFST-2026-00821", "DEF-821-01")
        self.assertIsNotNone(resolved_app)
        self.assertEqual(resolved_app["status"], "OFFICER_SCRUTINY")
        self.assertTrue(resolved_app["cross_doc_status"]["dob_match"])
        self.assertEqual(resolved_app["cross_doc_status"]["overall_status"], "PASS")

    def test_04_officer_approval_and_fellowship_activation(self):
        """4. Test officer approval action activates post-award fellowship lifecycle"""
        approved_app = crud.record_officer_decision(
            self.db, 
            app_id="NFST-2026-00821", 
            action="APPROVE", 
            reason="All document evidence verified. Marksheet revalidated successfully."
        )
        self.assertIsNotNone(approved_app)
        self.assertEqual(approved_app["status"], "APPROVED")

        # Verify Fellowship state updated to ACTIVE
        fel = crud.get_fellowship(self.db)
        self.assertIsNotNone(fel)
        self.assertEqual(fel["status"], "ACTIVE")

    def test_05_audit_timeline_traceability(self):
        """5. Verify decision replay audit logs reflect complete traceable timeline"""
        timeline = crud.get_audit_timeline(self.db, "NFST-2026-00821")
        self.assertGreaterEqual(len(timeline), 3)

        # Verify latest decision action is logged
        actions = [log["action"] for log in timeline]
        self.assertTrue(any("Officer Decision: APPROVE" in a or "Deficiency" in a for a in actions))

    def test_06_chatbot_state_awareness(self):
        """6. Verify chatbot answer updates dynamically when application state changes"""
        app = crud.get_application_by_id(self.db, "NFST-2026-00821")
        scheme = crud.get_scheme_by_id(self.db, "SCHEME-NFST")
        profile = crud.get_student_profile(self.db)

        answer = self.groq_service.ask("Has my scholarship been approved?", app, scheme, profile)
        self.assertIn("APPROVED", answer)

    def test_07_multilingual_query_translation(self):
        """7. Verify Tamil query translation & localized response generation"""
        app = crud.get_application_by_id(self.db, "NFST-2026-00821")
        scheme = crud.get_scheme_by_id(self.db, "SCHEME-NFST")
        profile = crud.get_student_profile(self.db)

        canonical_query = self.sarvam_service.translate_text("என் application இப்போ எங்க இருக்கு?", source_lang="ta", target_lang="en")
        answer_en = self.groq_service.ask(canonical_query, app, scheme, profile)
        answer_ta = self.sarvam_service.translate_text(answer_en, source_lang="en", target_lang="ta")

        self.assertIsNotNone(answer_ta)
        self.assertGreater(len(answer_ta), 5)

    def test_08_sql_persistence_across_sessions(self):
        """8. Verify SQL database persistence remains intact"""
        apps = crud.get_applications(self.db)
        self.assertEqual(len(apps), 100)

if __name__ == "__main__":
    unittest.main()
