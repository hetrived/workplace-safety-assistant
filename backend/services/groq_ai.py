import os
import json
import anthropic
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def load_safety_docs():
    try:
        base = os.path.dirname(os.path.dirname(__file__))
        with open(os.path.join(base, "data", "safety_docs.json"), "r") as f:
            return json.load(f)
    except Exception:
        return []

def get_safety_response(question: str) -> str:
    docs = load_safety_docs()
    context = "\n\n".join([
        f"[{doc['category']}] {doc['title']}:\n{doc['content']}"
        for doc in docs
    ])

    try:
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=600,
            system=f"""You are SafetyAI, an expert workplace safety assistant for manufacturing plants,
construction companies, and industrial environments. You help workers and safety managers
with safety protocols, incident response, equipment handling, and OSHA compliance.

Use the following official safety documentation to answer questions:

{context}

Guidelines:
- Always prioritize worker safety above all else
- Provide clear, step-by-step actionable guidance
- Reference specific OSHA standards when relevant
- For emergencies, always recommend calling emergency services first
- Keep responses concise but complete
- If a situation is unclear, recommend contacting a safety manager immediately""",
            messages=[
                {"role": "user", "content": question}
            ]
        )
        return response.content[0].text
    except Exception as e:
        return f"Safety AI is temporarily unavailable. For immediate safety concerns, contact your safety manager or call emergency services. Error: {str(e)}"
