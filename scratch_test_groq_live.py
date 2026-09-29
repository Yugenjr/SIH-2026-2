import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'backend', '.env'))

from services.groq_service import GroqProvider

p = GroqProvider()
print("API Key present:", bool(p.api_key), f"Key snippet: {p.api_key[:8]}...")

res1 = p.ask(
    query="What is my name?",
    app_context={"id": "NFST-2026-00821", "status": "APPROVED", "student_name": "Arun Kumar"},
    scheme_context={"name": "NFST"},
    profile_context={"name": "Arun Kumar", "category": "ST", "institution": "NIT Raipur"}
)
print("\n--- QUERY: What is my name? ---")
print("Provider:", res1["provider"])
print("Answer:", res1["answer"])

res2 = p.ask(
    query="What is the stipend for NFST fellowship?",
    app_context={"id": "NFST-2026-00821", "status": "APPROVED"},
    scheme_context={"name": "NFST"},
    profile_context={"name": "Arun Kumar"}
)
print("\n--- QUERY: What is the stipend for NFST fellowship? ---")
print("Provider:", res2["provider"])
print("Answer:", res2["answer"])
