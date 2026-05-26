# SafetyAI — Workplace Safety Assistant

> An AI-powered workplace safety management platform built for manufacturing plants, construction sites, and industrial environments. Combines Claude AI, Databricks Delta Tables, and real-time analytics into a production-ready web application.

**Live Demo:** [workplace-safety-assistant.vercel.app](https://workplace-safety-assistant.vercel.app)

---

## Overview

SafetyAI helps safety managers report incidents, query OSHA compliance guidelines via AI, monitor real-time analytics, and receive instant notifications — all from a single dashboard backed by Databricks Delta Lake.

---

## Features

- **AI Safety Chat** — Conversational interface powered by Claude AI (Anthropic) with RAG over OSHA guidelines. Ask anything about PPE requirements, chemical handling, electrical safety, LOTO procedures, and more.
- **Incident Management** — Report, track, and update safety incidents with severity levels (high/medium/low) and status workflows (open → investigating → resolved).
- **Live Analytics Dashboard** — Real-time charts showing incident trends, severity breakdown, and compliance rate. Auto-refreshes every 15 seconds.
- **Smart Notifications** — Bell icon updates instantly when incidents are created or statuses change. Notifications stored in Databricks.
- **Knowledge Base** — Searchable library of 10 OSHA safety protocol documents covering PPE, Chemical Hazards, Fall Protection, Electrical Safety, and more.
- **Databricks Integration** — All data persisted in Delta Tables on Databricks SQL Warehouse with automatic UUID-based seeding on first run.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Recharts |
| Backend | FastAPI (Python), Uvicorn |
| AI | Claude AI (`claude-haiku-4-5`) via Anthropic SDK |
| Database | Databricks Delta Lake (SQL Warehouse) |
| Deployment | Vercel (frontend) + Render (backend) |
| Data Layer | `databricks-sql-connector`, ACID Delta Tables |

---

## Architecture

```
┌─────────────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│   React Frontend    │────▶│   FastAPI Backend     │────▶│  Databricks Delta   │
│   (Vercel)          │     │   (Render)            │     │  Lake (SQL Warehouse)│
│                     │     │                       │     │                     │
│  Dashboard          │     │  /api/chat/           │     │  safety_incidents   │
│  Safety Chat        │     │  /api/incidents/      │     │  notifications      │
│  Incidents          │     │  /api/analytics/      │     │  safety_protocols   │
│  Knowledge Base     │     │  /api/notifications/  │     │                     │
│  Notifications      │     │                       │     └─────────────────────┘
└─────────────────────┘     │  Claude AI (Anthropic)│
                            └──────────────────────┘
```

---

## Screenshots

### Dashboard
Real-time analytics with incident trends, severity breakdown, and compliance rate.

### Safety Chat
AI-powered Q&A grounded in OSHA guidelines with markdown-formatted responses.

### Incident Management
Full CRUD for safety incidents with severity filters and instant status updates.

### Notifications
Live notification bell that updates instantly on every incident action.

---

## Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- Databricks account (Community Edition works)
- Anthropic API key

### Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Create .env file
ANTHROPIC_API_KEY=your_key
DATABRICKS_HOST=your_host
DATABRICKS_HTTP_PATH=your_path
DATABRICKS_TOKEN=your_token

python -m uvicorn main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173` with backend at `http://localhost:8000`.

---

## Databricks Setup

1. Create a SQL Warehouse in Databricks
2. Copy the Server Hostname and HTTP Path from Connection Details
3. Generate a Personal Access Token
4. Add credentials to `backend/.env`

On first startup, the backend automatically:
- Creates `safety_incidents`, `notifications`, and `safety_protocols` Delta Tables
- Seeds realistic sample data with proper UUID IDs
- Falls back to in-memory mock data if Databricks is unavailable

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health/` | Health check + Databricks status |
| POST | `/api/chat/` | AI safety Q&A |
| GET | `/api/incidents/` | List all incidents |
| POST | `/api/incidents/` | Report new incident |
| PATCH | `/api/incidents/{id}/status` | Update incident status |
| GET | `/api/analytics/` | Dashboard analytics |
| GET | `/api/notifications/` | List notifications |
| PATCH | `/api/notifications/{id}/read` | Mark notification read |

---

## Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | [workplace-safety-assistant.vercel.app](https://workplace-safety-assistant.vercel.app) |
| Backend | Render | [workplace-safety-backend.onrender.com](https://workplace-safety-backend.onrender.com) |
| Database | Databricks | Delta Lake SQL Warehouse |

---

## Key Design Decisions

- **Mock fallback** — App works fully offline with in-memory data if Databricks is unavailable, ensuring zero downtime demos.
- **UUID IDs** — All records use UUID primary keys, auto-generated and auto-seeded on first run.
- **RAG pattern** — Claude AI is grounded with 10 OSHA documents loaded as context, preventing hallucination on safety-critical queries.
- **Event-driven notifications** — Frontend fires custom browser events on incident actions, so the notification bell updates in under 1 second without polling.

---

## Built With

- [Anthropic Claude API](https://anthropic.com) — AI responses
- [Databricks](https://databricks.com) — Delta Lake storage
- [FastAPI](https://fastapi.tiangolo.com) — Python backend
- [React](https://react.dev) + [Vite](https://vitejs.dev) — Frontend
- [Tailwind CSS](https://tailwindcss.com) — Styling
- [Recharts](https://recharts.org) — Data visualization

---

*Built as a portfolio project demonstrating full-stack AI application development with enterprise data infrastructure.*
