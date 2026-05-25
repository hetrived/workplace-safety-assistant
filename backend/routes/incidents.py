from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.databricks import get_all_incidents, create_incident, update_incident_status, create_notification

router = APIRouter()

class IncidentCreate(BaseModel):
    title: str
    description: str
    severity: str
    location: str
    reported_by: str

class StatusUpdate(BaseModel):
    status: str

@router.get("/")
async def list_incidents():
    return get_all_incidents()

@router.post("/")
async def add_incident(data: IncidentCreate):
    incident = create_incident(data.model_dump())
    type_map = {"high": "critical", "medium": "warning", "low": "info"}
    create_notification(
        title=f"New Incident Reported",
        message=f"{data.title} — {data.severity.upper()} severity at {data.location}",
        notif_type=type_map.get(data.severity, "info")
    )
    return incident

@router.patch("/{incident_id}/status")
async def update_status(incident_id: str, body: StatusUpdate):
    update_incident_status(incident_id, body.status)
    status_map = {
        "resolved": ("Incident Resolved", "success"),
        "investigating": ("Incident Under Investigation", "warning"),
        "open": ("Incident Reopened", "warning"),
    }
    title, notif_type = status_map.get(body.status, ("Incident Updated", "info"))
    create_notification(
        title=title,
        message=f"Incident status changed to {body.status}",
        notif_type=notif_type
    )
    return {"success": True}
