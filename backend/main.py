from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import chat, incidents, analytics, notifications
from services.databricks import init_tables

app = FastAPI(title="Workplace Safety Assistant API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(incidents.router, prefix="/api/incidents", tags=["Incidents"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])

@app.on_event("startup")
async def startup():
    init_tables()

@app.get("/")
def root():
    return {"status": "ok", "message": "Workplace Safety Assistant API"}

@app.get("/health")
def health():
    return {"status": "healthy"}
