import unittest
import os
from services.sarvam_service import SarvamProvider

class TestSarvamMultilingualVoiceService(unittest.TestCase):

    def setUp(self):
        self.provider = SarvamProvider()

    def test_a_tamil_stt_canonical_query(self):
        """TEST A: Tamil STT returns transcript and translates to canonical query"""
        stt_res = self.provider.speech_to_text(language_code="ta-IN")
        self.assertTrue(stt_res["success"])
        self.assertIn("விண்ணப்பம்", stt_res["transcript"])

        canonical = self.provider.translate_text(stt_res["transcript"], source_lang="ta", target_lang="en")
        self.assertIn("status of my application", canonical.lower())

    def test_b_hindi_stt_canonical_query(self):
        """TEST B: Hindi STT returns transcript and translates to canonical query"""
        stt_res = self.provider.speech_to_text(language_code="hi-IN")
        self.assertTrue(stt_res["success"])

        canonical = self.provider.translate_text(stt_res["transcript"], source_lang="hi", target_lang="en")
        self.assertIn("status of my application", canonical.lower())

    def test_c_stt_fallback(self):
        """TEST C: STT operates gracefully when no audio bytes provided"""
        stt_res = self.provider.speech_to_text(audio_bytes=None, language_code="ta-IN")
        self.assertTrue(stt_res["success"])
        self.assertIsNotNone(stt_res["transcript"])

    def test_d_tamil_grounded_answer_translation(self):
        """TEST D: English grounded answer translates to Tamil accurately"""
        en_answer = "Your application is currently at the stage of Officer Scrutiny."
        ta_answer = self.provider.translate_text(en_answer, source_lang="en", target_lang="ta")
        self.assertIn("அதிகாரி சரிபார்ப்பு", ta_answer)

    def test_e_tts_metadata(self):
        """TEST E: Text to speech metadata returns audio sample URL"""
        tts_res = self.provider.text_to_speech("உங்கள் விண்ணப்பம் பரிசீலனையில் உள்ளது.", language_code="ta-IN")
        self.assertTrue(tts_res["success"])
        self.assertIn("audio_sample.mp3", tts_res["audio_url"])

    def test_f_sarvam_api_unavailable_fallback(self):
        """TEST F: Unset SARVAM_API_KEY falls back gracefully to dictionary lookup"""
        old_key = os.environ.get("SARVAM_API_KEY")
        if "SARVAM_API_KEY" in os.environ:
            del os.environ["SARVAM_API_KEY"]

        fallback_provider = SarvamProvider()
        translated = fallback_provider.translate_text("Income certificate needs replacement.", source_lang="en", target_lang="ta")
        self.assertEqual(translated, "வருமான சான்றிதழை மாற்ற வேண்டும்.")

        if old_key:
            os.environ["SARVAM_API_KEY"] = old_key

if __name__ == "__main__":
    unittest.main()
