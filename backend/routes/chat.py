from fastapi import APIRouter
from pydantic import BaseModel
from services.groq_ai import get_safety_response

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    sources: list[str] = []

@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    response = get_safety_response(request.message)
    return ChatResponse(response=response, sources=["OSHA Guidelines", "Safety Manual v2.1"])
