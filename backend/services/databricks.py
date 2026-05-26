import os
import uuid
from datetime import datetime
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(dotenv_path=Path(__file__).parent.parent / '.env')

USE_MOCK = False

def get_connection():
    from databricks import sql
    return sql.connect(
        server_hostname=os.getenv("DATABRICKS_HOST"),
        http_path=os.getenv("DATABRICKS_HTTP_PATH"),
        access_token=os.getenv("DATABRICKS_TOKEN")
    )

SEED_INCIDENTS = [
    {"title": "Chemical Spill - Zone B",    "description": "Minor acid spill near storage unit 3",            "severity": "high",   "location": "Zone B",          "reported_by": "John Smith",  "status": "open",          "created_at": "2026-05-24T09:30:00"},
    {"title": "Forklift Near-Miss",         "description": "Forklift passed too close to pedestrian walkway", "severity": "medium", "location": "Warehouse",        "reported_by": "Sarah Lee",   "status": "investigating", "created_at": "2026-05-23T14:15:00"},
    {"title": "PPE Non-Compliance",         "description": "Worker found without hard hat in mandatory zone",  "severity": "low",    "location": "Zone A",           "reported_by": "Mike Brown",  "status": "resolved",      "created_at": "2026-05-22T11:00:00"},
    {"title": "Equipment Malfunction",      "description": "Conveyor belt emergency stop triggered",           "severity": "high",   "location": "Production Floor", "reported_by": "Anna Davis",  "status": "open",          "created_at": "2026-05-21T16:45:00"},
    {"title": "Electrical Hazard Reported", "description": "Exposed wiring found near workstation 7",          "severity": "high",   "location": "Assembly Line",    "reported_by": "Tom Wilson",  "status": "resolved",      "created_at": "2026-05-20T08:20:00"},
]

SEED_NOTIFICATIONS = [
    {"title": "Critical Alert",     "message": "Chemical spill reported in Zone B - immediate response required", "type": "critical", "is_read": False, "created_at": "2026-05-25T10:00:00"},
    {"title": "Safety Reminder",    "message": "Monthly fire drill scheduled for tomorrow at 10 AM",              "type": "info",     "is_read": False, "created_at": "2026-05-25T08:00:00"},
    {"title": "Compliance Due",     "message": "PPE inspection reports due by end of week",                       "type": "warning",  "is_read": True,  "created_at": "2026-05-24T09:00:00"},
    {"title": "Incident Resolved",  "message": "Electrical hazard at workstation 7 has been resolved",            "type": "success",  "is_read": True,  "created_at": "2026-05-23T15:00:00"},
]

def _seed_table(cursor, conn):
    # Auto-remove any old numeric-style IDs (UUIDs are 36 chars, numeric IDs are short)
    cursor.execute("DELETE FROM safety_incidents WHERE LENGTH(id) < 10")
    cursor.execute("DELETE FROM notifications WHERE LENGTH(id) < 10")
    conn.commit()

    cursor.execute("SELECT COUNT(*) FROM safety_incidents")
    if cursor.fetchone()[0] == 0:
        for s in SEED_INCIDENTS:
            cursor.execute(
                "INSERT INTO safety_incidents VALUES (?,?,?,?,?,?,?,?)",
                [str(uuid.uuid4()), s["title"], s["description"], s["severity"], s["location"], s["reported_by"], s["status"], s["created_at"]]
            )
        conn.commit()
        print("Seeded safety_incidents with UUID ids")

    cursor.execute("SELECT COUNT(*) FROM notifications")
    if cursor.fetchone()[0] == 0:
        for n in SEED_NOTIFICATIONS:
            cursor.execute(
                "INSERT INTO notifications VALUES (?,?,?,?,?,?)",
                [str(uuid.uuid4()), n["title"], n["message"], n["type"], n["is_read"], n["created_at"]]
            )
        conn.commit()
        print("Seeded notifications with UUID ids")

def init_tables():
    global USE_MOCK
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS safety_incidents (
                id STRING,
                title STRING,
                description STRING,
                severity STRING,
                location STRING,
                reported_by STRING,
                status STRING,
                created_at STRING
            ) USING DELTA
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS safety_protocols (
                id STRING,
                title STRING,
                category STRING,
                content STRING,
                last_updated STRING
            ) USING DELTA
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS notifications (
                id STRING,
                title STRING,
                message STRING,
                type STRING,
                is_read BOOLEAN,
                created_at STRING
            ) USING DELTA
        """)
        conn.commit()
        _seed_table(cursor, conn)
        cursor.close()
        conn.close()
        print("Databricks tables initialized successfully")
    except Exception as e:
        print(f"Databricks unavailable, using mock data: {e}")
        USE_MOCK = True

# ── Incidents ──────────────────────────────────────────────

MOCK_INCIDENTS = [
    {"id": "1", "title": "Chemical Spill - Zone B", "description": "Minor acid spill near storage unit 3", "severity": "high", "location": "Zone B", "reported_by": "John Smith", "status": "open", "created_at": "2026-05-24T09:30:00"},
    {"id": "2", "title": "Forklift Near-Miss", "description": "Forklift passed too close to pedestrian walkway", "severity": "medium", "location": "Warehouse", "reported_by": "Sarah Lee", "status": "investigating", "created_at": "2026-05-23T14:15:00"},
    {"id": "3", "title": "PPE Non-Compliance", "description": "Worker found without hard hat in mandatory zone", "severity": "low", "location": "Zone A", "reported_by": "Mike Brown", "status": "resolved", "created_at": "2026-05-22T11:00:00"},
    {"id": "4", "title": "Equipment Malfunction", "description": "Conveyor belt emergency stop triggered", "severity": "high", "location": "Production Floor", "reported_by": "Anna Davis", "status": "open", "created_at": "2026-05-21T16:45:00"},
    {"id": "5", "title": "Electrical Hazard Reported", "description": "Exposed wiring found near workstation 7", "severity": "high", "location": "Assembly Line", "reported_by": "Tom Wilson", "status": "resolved", "created_at": "2026-05-20T08:20:00"},
]

def get_all_incidents():
    if USE_MOCK:
        return MOCK_INCIDENTS
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM safety_incidents ORDER BY created_at DESC")
        rows = cursor.fetchall()
        cols = [d[0] for d in cursor.description]
        cursor.close()
        conn.close()
        return [dict(zip(cols, row)) for row in rows]
    except Exception:
        return MOCK_INCIDENTS

def create_incident(data: dict):
    incident = {
        "id": str(uuid.uuid4()),
        "title": data["title"],
        "description": data["description"],
        "severity": data["severity"],
        "location": data["location"],
        "reported_by": data["reported_by"],
        "status": "open",
        "created_at": datetime.now().isoformat()
    }
    if USE_MOCK:
        print("[DEBUG] Using mock — skipping Databricks")
        MOCK_INCIDENTS.insert(0, incident)
        return incident
    try:
        print(f"[DEBUG] Inserting to Databricks: {incident['title']}")
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO safety_incidents VALUES (?,?,?,?,?,?,?,?)",
            list(incident.values())
        )
        conn.commit()
        cursor.close()
        conn.close()
        print("[DEBUG] Insert complete")
    except Exception as e:
        print(f"[Databricks INSERT error] {e}")
        MOCK_INCIDENTS.insert(0, incident)
    return incident

def update_incident_status(incident_id: str, status: str):
    if USE_MOCK:
        for inc in MOCK_INCIDENTS:
            if inc["id"] == incident_id:
                inc["status"] = status
        return
    try:
        print(f"[DEBUG] Updating status in Databricks: {incident_id} -> {status}")
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE safety_incidents SET status=? WHERE id=?",
            [status, incident_id]
        )
        conn.commit()
        cursor.close()
        conn.close()
        print("[DEBUG] Status update complete")
    except Exception as e:
        print(f"[Databricks UPDATE error] {e}")
        for inc in MOCK_INCIDENTS:
            if inc["id"] == incident_id:
                inc["status"] = status

# ── Notifications ──────────────────────────────────────────

MOCK_NOTIFICATIONS = [
    {"id": "1", "title": "Critical Alert", "message": "Chemical spill reported in Zone B - immediate response required", "type": "critical", "is_read": False, "created_at": "2026-05-25T10:00:00"},
    {"id": "2", "title": "Safety Reminder", "message": "Monthly fire drill scheduled for tomorrow at 10 AM", "type": "info", "is_read": False, "created_at": "2026-05-25T08:00:00"},
    {"id": "3", "title": "Compliance Due", "message": "PPE inspection reports due by end of week", "type": "warning", "is_read": True, "created_at": "2026-05-24T09:00:00"},
    {"id": "4", "title": "Incident Resolved", "message": "Electrical hazard at workstation 7 has been resolved", "type": "success", "is_read": True, "created_at": "2026-05-23T15:00:00"},
]

def get_notifications():
    if USE_MOCK:
        return MOCK_NOTIFICATIONS
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 20")
        rows = cursor.fetchall()
        cols = [d[0] for d in cursor.description]
        cursor.close()
        conn.close()
        return [dict(zip(cols, row)) for row in rows]
    except Exception:
        return MOCK_NOTIFICATIONS

def mark_notification_read(notification_id: str):
    if USE_MOCK:
        for n in MOCK_NOTIFICATIONS:
            if n["id"] == notification_id:
                n["is_read"] = True
        return
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE notifications SET is_read=true WHERE id=?", [notification_id])
        conn.commit()
        cursor.close()
        conn.close()
    except Exception:
        for n in MOCK_NOTIFICATIONS:
            if n["id"] == notification_id:
                n["is_read"] = True

def create_notification(title: str, message: str, notif_type: str):
    notif = {
        "id": str(uuid.uuid4()),
        "title": title,
        "message": message,
        "type": notif_type,
        "is_read": False,
        "created_at": datetime.now().isoformat()
    }
    if USE_MOCK:
        MOCK_NOTIFICATIONS.insert(0, notif)
        return notif
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO notifications VALUES (?,?,?,?,?,?)",
            [notif["id"], notif["title"], notif["message"], notif["type"], False, notif["created_at"]]
        )
        conn.commit()
        cursor.close()
        conn.close()
    except Exception:
        MOCK_NOTIFICATIONS.insert(0, notif)
    return notif

# ── Analytics ─────────────────────────────────────────────

def get_analytics():
    incidents = get_all_incidents()
    total = len(incidents)
    open_count = sum(1 for i in incidents if i["status"] == "open")
    resolved = sum(1 for i in incidents if i["status"] == "resolved")
    high_severity = sum(1 for i in incidents if i["severity"] == "high")
    compliance_rate = round((resolved / total * 100) if total > 0 else 95, 1)

    by_severity = {"high": 0, "medium": 0, "low": 0}
    for i in incidents:
        sev = i.get("severity", "low")
        by_severity[sev] = by_severity.get(sev, 0) + 1

    monthly_trend = [
        {"month": "Jan", "incidents": 8},
        {"month": "Feb", "incidents": 5},
        {"month": "Mar", "incidents": 12},
        {"month": "Apr", "incidents": 7},
        {"month": "May", "incidents": total},
    ]

    by_category = [
        {"category": "Equipment Safety", "count": 12},
        {"category": "Chemical Hazards", "count": 7},
        {"category": "Fall Protection", "count": 5},
        {"category": "PPE Compliance", "count": 9},
        {"category": "Electrical", "count": 4},
    ]

    return {
        "total_incidents": total,
        "open_incidents": open_count,
        "resolved_incidents": resolved,
        "high_severity": high_severity,
        "compliance_rate": compliance_rate,
        "monthly_trend": monthly_trend,
        "by_severity": by_severity,
        "by_category": by_category,
    }
