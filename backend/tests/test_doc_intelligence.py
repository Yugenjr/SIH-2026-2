import unittest
try:
    import pymupdf as fitz  # PyMuPDF
except ImportError:
    import fitz
from services.doc_intelligence import DocumentIntelligence, DocumentOCRProvider

class TestDocumentIntelligence(unittest.TestCase):

    def test_case_a_text_native_pdf(self):
        """TEST A: Text-native Income Certificate PDF generated in memory"""
        doc = fitz.open()
        page = doc.new_page()
        page.insert_text((50, 100), "Government of Tamil Nadu - Revenue Department")
        page.insert_text((50, 140), "Income Certificate")
        page.insert_text((50, 180), "Full Name: Arun Kumar")
        page.insert_text((50, 220), "Annual Income: ₹1,80,000")
        page.insert_text((50, 260), "Certificate No: INC-2025-88912")
        pdf_bytes = doc.tobytes()

        res = DocumentIntelligence.process_upload(
            file_name="Synthetic_Income_Cert.pdf",
            doc_type="Income Certificate",
            simulate_blurry=False,
            file_bytes=pdf_bytes
        )

        self.assertTrue(res["success"])
        self.assertEqual(res["quality_status"], "GOOD")
        self.assertGreaterEqual(res["ocr_confidence"], 0.90)
        self.assertGreater(len(res["extracted_fields"]), 0)

        # Verify extracted fields match text in PDF
        name_field = next(f for f in res["extracted_fields"] if f["field_name"] == "Full Name")
        income_field = next(f for f in res["extracted_fields"] if f["field_name"] == "Annual Income")
        self.assertEqual(name_field["value"], "Arun Kumar")
        self.assertEqual(income_field["value"], "₹1,80,000")
        self.assertIn("x", name_field["bounding_box"])

    def test_case_b_blurry_document(self):
        """TEST B: Blurry image detection"""
        res = DocumentIntelligence.process_upload(
            file_name="Blurry_Income_Cert.pdf",
            doc_type="Income Certificate",
            simulate_blurry=True
        )
        self.assertFalse(res["success"])
        self.assertEqual(res["quality_status"], "BLURRY")
        self.assertIn("blurry", res["error_message"].lower())

    def test_case_c_dob_mismatch_cross_doc(self):
        """TEST C: Cross-document DOB mismatch detection"""
        cross_res = DocumentIntelligence.validate_cross_document(
            app_dob="12/04/2004",
            mark_dob="12/04/2003",
            id_dob="12/04/2004",
            app_name="Arun Kumar",
            doc_name="Arun Kumar"
        )
        self.assertFalse(cross_res["dob_match"])
        self.assertEqual(cross_res["overall_status"], "WARNING")
        self.assertIn("DATE OF BIRTH MISMATCH", cross_res["flags"])

    def test_case_d_wrong_document_type(self):
        """TEST D: Marksheet uploaded when Income Certificate expected"""
        doc = fitz.open()
        page = doc.new_page()
        page.insert_text((50, 100), "Academic Marksheet - Grade Sheet")
        page.insert_text((50, 140), "Roll No: 2022-PHD-ST-044")
        pdf_bytes = doc.tobytes()

        res = DocumentIntelligence.process_upload(
            file_name="Marksheet_Wrong.pdf",
            doc_type="Income Certificate",
            simulate_blurry=False,
            file_bytes=pdf_bytes
        )

        self.assertFalse(res["success"])
        self.assertEqual(res["quality_status"], "WRONG_DOCUMENT_TYPE")
        self.assertIn("Expected 'Income Certificate'", res["error_message"])

if __name__ == "__main__":
    unittest.main()
