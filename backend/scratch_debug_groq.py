import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GROQ_API_KEY", "").strip()
endpoint = "https://api.groq.com/openai/v1/chat/completions"
model = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

print(f"Key: {api_key[:10]}... Length: {len(api_key)}")
print(f"Model: {model}")

payload = {
    "model": model,
    "messages": [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "What is my name? The context says student name is Arun Kumar."}
    ],
    "temperature": 0.1,
    "max_tokens": 100
}
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

try:
    res = requests.post(endpoint, json=payload, headers=headers, timeout=10)
    print("Status Code:", res.status_code)
    print("Response Text:", res.text)
except Exception as e:
    print("Exception:", e)
