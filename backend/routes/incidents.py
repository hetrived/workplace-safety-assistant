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
    if data.severity == "high":
        create_notification(
            title="High Severity Incident",
            message=f"New high severity incident reported: {data.title} at {data.location}",
            notif_type="critical"
        )
    return incident

@router.patch("/{incident_id}/status")
async def update_status(incident_id: str, body: StatusUpdate):
    update_incident_status(incident_id, body.status)
    return {"success": True}
