"""
Run: python test_app.py
Tests every layer of the SafetyAI backend end-to-end.
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
from pathlib import Path
load_dotenv(dotenv_path=Path(__file__).parent / '.env', override=True)

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

results = []

def check(name, passed, detail=""):
    tag = "PASS" if passed else "FAIL"
    msg = f"  [{tag}] {name}"
    if detail:
        msg += f"\n         {detail}"
    print(msg)
    results.append((name, passed))

# ── 1. Health ────────────────────────────────────────────────────────────────
print("\n[1] Health Check")
r = client.get("/api/health/")
check("GET /api/health/ returns 200",        r.status_code == 200)
check("status field is 'healthy'",           r.json().get("status") == "healthy")
db_mode = r.json().get("databricks", "")
check("databricks field present",            bool(db_mode), f"databricks={db_mode}")

# ── 2. Incidents ─────────────────────────────────────────────────────────────
print("\n[2] Incidents")
r = client.get("/api/incidents/")
check("GET /api/incidents/ returns 200",     r.status_code == 200)
check("response is a list",                  isinstance(r.json(), list))
incidents_before = len(r.json())
check("at least 1 seeded incident exists",   incidents_before >= 1,
      f"found {incidents_before} incidents")

new_incident = {
    "title":       "Test Chemical Spill",
    "description": "Automated test incident - chemical spill in lab B",
    "severity":    "high",
    "location":    "Lab B",
    "reported_by": "TestRunner"
}
r = client.post("/api/incidents/", json=new_incident)
check("POST /api/incidents/ returns 200",    r.status_code == 200)
body = r.json()
check("new incident has 'id' field",         "id" in body)
check("id is a UUID (len > 10)",             len(str(body.get("id", ""))) > 10,
      f"id={body.get('id')}")
check("title matches submitted value",       body.get("title") == new_incident["title"])
check("severity matches",                    body.get("severity") == "high")
check("status defaults to 'open'",           body.get("status") == "open")

incident_id = body.get("id", "")

r2 = client.get("/api/incidents/")
check("incident count increased by 1",       len(r2.json()) == incidents_before + 1)

r = client.patch(f"/api/incidents/{incident_id}/status", json={"status": "investigating"})
check("PATCH status -> investigating 200",   r.status_code == 200)
check("returns success=True",               r.json().get("success") is True)

r = client.patch(f"/api/incidents/{incident_id}/status", json={"status": "resolved"})
check("PATCH status -> resolved 200",        r.status_code == 200)

# ── 3. Analytics ─────────────────────────────────────────────────────────────
print("\n[3] Analytics")
r = client.get("/api/analytics/")
check("GET /api/analytics/ returns 200",     r.status_code == 200)
data = r.json()
check("total_incidents key present",         "total_incidents" in data,
      f"keys={list(data.keys())}")
check("total_incidents >= 1",                data.get("total_incidents", 0) >= 1,
      f"total={data.get('total_incidents')}")
check("compliance_rate is a number",         isinstance(data.get("compliance_rate"), (int, float)))
check("compliance_rate 0-100",               0 <= data.get("compliance_rate", -1) <= 100,
      f"rate={data.get('compliance_rate')}")
check("monthly_trend is a list",             isinstance(data.get("monthly_trend"), list))
check("by_severity present",                 "by_severity" in data)
check("open_incidents key present",          "open_incidents" in data)

# ── 4. Notifications ─────────────────────────────────────────────────────────
print("\n[4] Notifications")
r = client.get("/api/notifications/")
check("GET /api/notifications/ returns 200", r.status_code == 200)
notifs = r.json()
check("notifications is a list",             isinstance(notifs, list))
check("at least 3 notifications exist",      len(notifs) >= 3,
      f"found {len(notifs)} notifications")

unread = [n for n in notifs if not n.get("is_read", False)]
check("unread notifications exist",          len(unread) >= 1,
      f"unread={len(unread)}")

if unread:
    nid = unread[0]["id"]
    r = client.patch(f"/api/notifications/{nid}/read")
    check("PATCH notification/read 200",     r.status_code == 200)
    check("returns success=True",            r.json().get("success") is True)

# ── 5. Chat — routing ─────────────────────────────────────────────────────────
print("\n[5] Chat Routing")

r = client.post("/api/chat/", json={"message": "how many open incidents do we have?"}, timeout=90)
check("POST /api/chat/ data question 200",   r.status_code == 200)
body = r.json()
check("data question -> source_type=genie",  body.get("source_type") == "genie",
      f"got source_type={body.get('source_type')}")
check("genie response is non-empty",         len(body.get("response", "")) > 10)
check("genie sources list non-empty",        len(body.get("sources", [])) >= 1)
print(f"         Genie: {body.get('response', '')[:120]}")

r = client.post("/api/chat/", json={"message": "What PPE is required for chemical handling?"}, timeout=90)
check("POST /api/chat/ knowledge question 200", r.status_code == 200)
body = r.json()
check("knowledge question -> source_type=knowledge", body.get("source_type") == "knowledge",
      f"got source_type={body.get('source_type')}")
check("knowledge response is non-empty",     len(body.get("response", "")) > 10)
check("sources reference PDF documents",     any(s for s in body.get("sources", [])
                                               if "PPE" in s or "Chemical" in s or "OSHA" in s))
print(f"         Knowledge: {body.get('response', '')[:120]}")

r = client.post("/api/chat/", json={"message": "Explain fire extinguisher types and PASS technique"}, timeout=90)
check("fire safety question 200",            r.status_code == 200)
check("fire question -> knowledge type",     r.json().get("source_type") == "knowledge")

r = client.post("/api/chat/", json={"message": "show me high severity incidents"}, timeout=90)
check("severity data question -> genie",     r.json().get("source_type") == "genie")

# ── 6. Databricks connectivity ───────────────────────────────────────────────
print("\n[6] Databricks Connectivity")
from services.databricks import get_connection, USE_MOCK
check("Databricks live mode (not mock)",     not USE_MOCK,
      "WARN: running in mock mode - check .env credentials" if USE_MOCK else "live")

if not USE_MOCK:
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM safety_incidents")
        count = cursor.fetchone()[0]
        cursor.close(); conn.close()
        check("safety_incidents table reachable", True, f"rows={count}")
        check("safety_incidents has data",        count >= 1)
    except Exception as e:
        check("safety_incidents table reachable", False, str(e))

    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM safety_documents")
        count = cursor.fetchone()[0]
        cursor.close(); conn.close()
        check("safety_documents table reachable", True, f"rows={count}")
        check("safety_documents has >= 5 chunks", count >= 5,
              f"expected >= 5 chunks (5 PDFs), found {count}")
    except Exception as e:
        check("safety_documents table reachable", False, str(e))

# ── 7. Genie routing unit ────────────────────────────────────────────────────
print("\n[7] Genie Routing Logic")
from services.genie_service import is_data_question
check("'how many incidents' -> data",        is_data_question("how many incidents do we have?"))
check("'show open incidents' -> data",       is_data_question("show open incidents"))
check("'total resolved cases' -> data",      is_data_question("total resolved cases this month"))
check("'what is PPE' -> NOT data",           not is_data_question("what is PPE?"))
check("'explain lockout tagout' -> NOT data",not is_data_question("explain lockout tagout procedure"))
check("'fire extinguisher' -> NOT data",     not is_data_question("fire extinguisher types"))

# ── 8. Knowledge Assistant search ───────────────────────────────────────────
print("\n[8] Knowledge Assistant Search")
from services.knowledge_assistant import search_documents

ctx = search_documents("chemical spill response procedure")
check("chemical spill -> context returned",  len(ctx) > 50, f"{len(ctx)} chars")
check("context mentions chemical/spill",     any(w in ctx.lower() for w in ["chemical", "spill", "hazmat", "sds"]),
      f"preview: {ctx[:100]}")

ctx2 = search_documents("lockout tagout electrical safety")
check("LOTO -> context returned",            len(ctx2) > 50, f"{len(ctx2)} chars")
check("context mentions lockout/electrical", any(w in ctx2.lower() for w in ["lockout", "electrical", "energy", "loto"]),
      f"preview: {ctx2[:100]}")

ctx3 = search_documents("fall protection harness height")
check("fall protection -> context returned", len(ctx3) > 50, f"{len(ctx3)} chars")
check("context mentions fall/harness",       any(w in ctx3.lower() for w in ["fall", "harness", "anchor", "pfas"]))

# ── Summary ───────────────────────────────────────────────────────────────────
passed = sum(1 for _, p in results if p)
total  = len(results)
failed = total - passed

print(f"\n{'='*55}")
print(f"  Results: {passed}/{total} passed", end="")
if failed:
    print(f"  |  {failed} FAILED:")
    for name, p in results:
        if not p:
            print(f"    X  {name}")
else:
    print("  -- all checks passed!")
print(f"{'='*55}\n")

sys.exit(0 if failed == 0 else 1)
