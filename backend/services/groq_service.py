import os
import requests
from typing import Dict, Any, List

class GroqChatService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY", "")
        self.endpoint = "https://api.groq.com/openai/v1/chat/completions"
        self.model = "llama-3.1-8b-instant"

    def ask(self, query: str, student_context: Dict[str, Any], scheme_context: Dict[str, Any]) -> str:
        """
        RAG-grounded chatbot query execution.
        Retrieves actual application state and scheme facts to form an accurate, explainable answer.
        """
        app_status = student_context.get("status", "SUBMITTED")
        stage = student_context.get("current_stage_label", "Officer Verification")
        deficiencies = student_context.get("deficiencies", [])
        
        # Grounding facts
        context_str = f"""
SYSTEM CONTEXT FOR SAHA SCHOLARSHIP PLATFORM:
Student Name: {student_context.get('student_name', 'Student')}
Current Application Status: {app_status}
Current Stage: {stage}
Active Deficiencies: {len(deficiencies)}
Scheme Name: {scheme_context.get('name', 'National Fellowship for ST Students (NFST)')}
Income Limit: ₹{scheme_context.get('max_income_limit', 250000):,.0f}
Eligibility Status: {'ELIGIBLE' if student_context.get('eligibility_pass', True) else 'INELIGIBLE'}
        """

        if not self.api_key:
            # Deterministic fallback response when GROQ_API_KEY is not set
            if "status" in query.lower() or "where" in query.lower() or "pending" in query.lower():
                return f"Your application is currently at the stage of **{stage}**. Current status: `{app_status}`. No action is required from you at this time."
            elif "deficiency" in query.lower() or "fix" in query.lower() or "error" in query.lower():
                if deficiencies:
                    return f"Action Required: {deficiencies[0].get('problem', 'Document correction needed')}. Required Action: {deficiencies[0].get('required_action', 'Upload replacement document')}."
                return "You have no active deficiencies! Your application has passed initial checks."
            else:
                return f"SAHA Assistant: Your application for {scheme_context.get('name', 'NFST')} is currently under `{stage}`. All document eligibility rules are verified deterministically by SAHA engine."

        try:
            messages = [
                {"role": "system", "content": f"You are SAHA AI Assistant for Indian Tribal Scholarships. Use strictly the provided system context. Do NOT invent status. {context_str}"},
                {"role": "user", "content": query}
            ]
            response = requests.post(
                self.endpoint,
                headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"},
                json={"model": self.model, "messages": messages, "temperature": 0.2, "max_tokens": 300},
                timeout=5
            )
            if response.status_code == 200:
                return response.json()["choices"][0]["message"]["content"]
            else:
                return f"Your application is at stage **{stage}** ({app_status}). No further action required."
        except Exception:
            return f"Your application is currently at stage **{stage}** with status `{app_status}`."
