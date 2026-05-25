from fastapi import APIRouter
from services.databricks import get_analytics

router = APIRouter()

@router.get("/")
async def analytics():
    return get_analytics()
