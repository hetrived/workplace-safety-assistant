from fastapi import APIRouter
from pydantic import BaseModel
from services.genie_service import ask_genie, is_data_question
from services.knowledge_assistant import ask_knowledge_assistant

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    sources: list[str] = []
    source_type: str = "knowledge"

@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    question = request.message.strip()

    # Route data questions to Genie Space
    if is_data_question(question):
        genie_answer = ask_genie(question)
        if genie_answer:
            return ChatResponse(
                response=genie_answer,
                sources=["Databricks Genie Space", "safety_incidents Delta Table"],
                source_type="genie"
            )

    # Fall back to Knowledge Assistant (PDFs + Claude)
    answer = ask_knowledge_assistant(question)
    return ChatResponse(
        response=answer,
        sources=["OSHA PPE Requirements", "Chemical Safety & HAZMAT", "Fire Prevention",
                 "Electrical Safety & LOTO", "Fall Protection Standards"],
        source_type="knowledge"
    )
