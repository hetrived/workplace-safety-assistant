from fastapi import APIRouter
from services.databricks import get_notifications, mark_notification_read

router = APIRouter()

@router.get("/")
async def list_notifications():
    return get_notifications()

@router.patch("/{notification_id}/read")
async def read_notification(notification_id: str):
    mark_notification_read(notification_id)
    return {"success": True}
