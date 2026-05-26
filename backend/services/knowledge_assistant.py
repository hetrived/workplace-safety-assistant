import os
import anthropic
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(dotenv_path=Path(__file__).parent.parent / '.env')

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

PDF_DOCS = [
    {"file": "OSHA_PPE_Requirements.pdf",    "title": "OSHA Personal Protective Equipment (PPE) Requirements"},
    {"file": "Chemical_Safety_HAZMAT.pdf",   "title": "Chemical Safety and HAZMAT Handling Procedures"},
    {"file": "Fire_Prevention_Emergency.pdf","title": "Fire Prevention and Emergency Response Procedures"},
    {"file": "Electrical_Safety_LOTO.pdf",   "title": "Electrical Safety and Lockout/Tagout (LOTO) Procedures"},
    {"file": "Fall_Protection_Standards.pdf","title": "Fall Protection and Working at Heights Safety Standards"},
]

def search_documents(question: str) -> str:
    """Search safety_documents Delta Table, fall back to local doc list."""
    try:
        from services.databricks import get_connection
        conn   = get_connection()
        cursor = conn.cursor()
        keywords = [w.strip("?.,!") for w in question.lower().split() if len(w) > 3]
        conditions = " OR ".join([f"LOWER(content) LIKE '%{kw}%'" for kw in keywords[:5]])
        cursor.execute(
            f"SELECT doc_name, section, content FROM safety_documents WHERE {conditions} LIMIT 5"
        )
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        if rows:
            return "\n\n".join([f"[{r[0]} — {r[1]}]\n{r[2]}" for r in rows])
    except Exception as e:
        print(f"[KnowledgeAssistant] Databricks search failed: {e}")
    return ""

def ask_knowledge_assistant(question: str) -> str:
    context = search_documents(question)
    doc_list = "\n".join([f"- {d['title']}" for d in PDF_DOCS])

    context_block = f"Use this retrieved context to answer:\n\n{context}" if context else "Answer based on OSHA standards and safety best practices."
    system = f"""You are SafetyAI Knowledge Assistant, an expert workplace safety advisor.
You have access to 5 official safety documents:
{doc_list}

{context_block}

Format responses with markdown headers (##), bullet points (-), and **bold** for key terms.
Be specific, cite regulations where relevant, and keep answers actionable."""

    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=700,
        system=system,
        messages=[{"role": "user", "content": question}]
    )
    return response.content[0].text
