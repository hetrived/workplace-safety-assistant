import os, time, requests
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(dotenv_path=Path(__file__).parent.parent / '.env')

HOST        = os.getenv("DATABRICKS_HOST", "")
TOKEN       = os.getenv("DATABRICKS_TOKEN", "")
SPACE_ID    = os.getenv("DATABRICKS_GENIE_SPACE_ID", "")

def ask_genie(question: str) -> str | None:
    if not SPACE_ID:
        return None
    headers = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}
    base    = f"https://{HOST}/api/2.0/genie/spaces/{SPACE_ID}"
    try:
        r = requests.post(f"{base}/start-conversation", json={"content": question}, headers=headers, timeout=30)
        if r.status_code != 200:
            print(f"[Genie] start-conversation failed: {r.status_code} {r.text}")
            return None
        data = r.json()
        conv_id = data["conversation_id"]
        msg_id  = data["message_id"]

        for _ in range(20):
            time.sleep(2)
            r2 = requests.get(f"{base}/conversations/{conv_id}/messages/{msg_id}", headers=headers, timeout=15)
            if r2.status_code != 200:
                break
            msg    = r2.json()
            status = msg.get("status", "")
            if status == "COMPLETED":
                for att in msg.get("attachments", []):
                    if "text" in att:
                        return att["text"].get("content", "")
                    if "query" in att:
                        return _format_table(att["query"])
                return "Query completed — no data returned."
            if status in ["FAILED", "CANCELLED", "QUERY_RESULT_EXPIRED"]:
                return None
        return None
    except Exception as e:
        print(f"[Genie error] {e}")
        return None

def _format_table(q: dict) -> str:
    desc    = q.get("description", "")
    columns = [c.get("name", "") for c in q.get("columns", [])]
    rows    = q.get("rows", [])
    if not rows:
        return desc or "No results found."
    lines = [desc] if desc else []
    if columns:
        lines.append(" | ".join(columns))
        lines.append("-" * 50)
    for row in rows[:15]:
        vals = [str(v.get("str", "")) for v in row.get("values", [])]
        lines.append(" | ".join(vals))
    return "\n".join(lines)

DATA_KEYWORDS = {
    "incident", "incidents", "how many", "count", "total", "open", "resolved",
    "investigating", "severity", "high", "medium", "low", "reported", "status",
    "recent", "list", "show", "compliance", "rate", "zone", "location", "today",
    "last", "week", "month", "dashboard", "statistics", "stats", "trend"
}

def is_data_question(text: str) -> bool:
    lower = text.lower()
    return any(kw in lower for kw in DATA_KEYWORDS)
