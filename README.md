# SafetyAI — Workplace Safety Assistant

> An AI-powered workplace safety management platform built for manufacturing plants, construction sites, and industrial environments. Combines **Databricks Genie Space**, **Claude AI Knowledge Assistant**, Delta Tables, and real-time analytics into a production-ready web application.

**Live Demo:** [workplace-safety-assistant.vercel.app](https://workplace-safety-assistant.vercel.app)  
**GitHub:** [github.com/hetrived/workplace-safety-assistant](https://github.com/hetrived/workplace-safety-assistant)

---

## Overview

SafetyAI helps safety managers report incidents, query live incident data through natural language, search indexed OSHA safety documents, monitor real-time analytics, and receive instant notifications — all backed by Databricks Delta Lake.

The AI chat intelligently routes questions to the right source:
- **Data questions** ("How many open incidents?") → **Databricks Genie Space** queries live Delta Tables
- **Safety knowledge** ("What PPE for chemical handling?") → **Knowledge Assistant** searches 5 indexed PDF documents via Claude AI

---

## Features

- **Intelligent AI Chat** — Automatically routes between Databricks Genie Space (live data queries) and Knowledge Assistant (PDF-grounded safety guidance). No manual switching required.
- **Databricks Genie Space** — Natural language interface over the `safety_incidents` Delta Table. Ask data questions and get real answers from live production data.
- **Knowledge Assistant** — Claude AI grounded in 5 official safety PDF documents indexed in Databricks. Covers PPE, chemical handling, fire prevention, electrical safety, and fall protection.
- **Incident Management** — Report, track, and update safety incidents with severity levels (high/medium/low) and status workflows (open → investigating → resolved).
- **Live Analytics Dashboard** — Real-time charts showing incident trends, severity breakdown, and compliance rate. Auto-refreshes every 15 seconds.
- **Smart Notifications** — Bell icon updates instantly when incidents are created or statuses change. Notifications stored in Databricks Delta Table.
- **Knowledge Base** — 5 generated PDF safety documents (OSHA-aligned) with a searchable in-app library.
- **Databricks Integration** — All data persisted in Delta Tables with automatic UUID seeding on first run.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Recharts |
| Backend | FastAPI (Python 3.11), Uvicorn |
| AI — Data Questions | Databricks Genie Space (NL → SQL over Delta Tables) |
| AI — Knowledge Questions | Claude AI (`claude-haiku-4-5`) via Anthropic SDK |
| Database | Databricks Delta Lake (SQL Warehouse) |
| PDF Generation | fpdf2 — 5 OSHA-aligned safety documents |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Architecture

```
┌─────────────────────┐     ┌──────────────────────────────┐     ┌─────────────────────────┐
│   React Frontend    │────▶│      FastAPI Backend          │────▶│   Databricks Delta Lake  │
│   (Vercel)          │     │      (Render)                 │     │   (SQL Warehouse)        │
│                     │     │                               │     │                         │
│  Dashboard          │     │  /api/chat/                   │     │  safety_incidents        │
│  Safety Chat        │     │    ├─ is_data_question?       │     │  notifications           │
│  Incidents          │     │    │    Yes → Genie Space ────┼────▶│  safety_documents        │
│  Knowledge Base     │     │    │    No  → Knowledge Asst  │     │                         │
│  Notifications      │     │  /api/incidents/              │     └─────────────────────────┘
└─────────────────────┘     │  /api/analytics/             │
                            │  /api/notifications/          │     ┌─────────────────────────┐
                            │                               │────▶│  Databricks Genie Space  │
                            │  Claude AI (claude-haiku-4-5) │     │  (NL → SQL, live data)   │
                            └──────────────────────────────┘     └─────────────────────────┘
```

**Intelligent routing logic:**
```python
if is_data_question(question):          # "how many", "show", "list", "count"...
    answer = ask_genie(question)        # Genie Space → live Delta Table query
else:
    answer = ask_knowledge_assistant()  # Claude + Databricks-indexed PDF context
```

---

## PDF Safety Documents

Five OSHA-aligned PDF documents generated, stored, and indexed in Databricks `safety_documents` Delta Table:

| File | Coverage |
|---|---|
| `OSHA_PPE_Requirements.pdf` | 29 CFR 1910.132–138 — Head, eye, hand, foot, respiratory protection |
| `Chemical_Safety_HAZMAT.pdf` | 29 CFR 1910.1200 — SDS, chemical storage, spill response, HAZMAT classes |
| `Fire_Prevention_Emergency.pdf` | 29 CFR 1910.157 — Fire extinguisher types, PASS technique, evacuation |
| `Electrical_Safety_LOTO.pdf` | 29 CFR 1910.147 — Lockout/Tagout steps, arc flash, GFCI requirements |
| `Fall_Protection_Standards.pdf` | 29 CFR 1926.502 — Guardrails, PFAS, ladder safety, scaffolding |

Each document is chunked by section and stored in Databricks. The Knowledge Assistant retrieves relevant chunks via keyword search and passes them as context to Claude AI.

---

## Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- Databricks account with SQL Warehouse
- Anthropic API key
- Databricks Genie Space ID (create one connected to `safety_incidents` table)

### Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Create backend/.env
ANTHROPIC_API_KEY=your_anthropic_key
DATABRICKS_HOST=your-workspace.cloud.databricks.com
DATABRICKS_HTTP_PATH=/sql/1.0/warehouses/your_warehouse_id
DATABRICKS_TOKEN=your_databricks_pat
DATABRICKS_GENIE_SPACE_ID=your_genie_space_id

# Generate PDFs and seed Databricks safety_documents table (run once)
python scripts/generate_pdfs.py

# Start backend
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

1. Create a SQL Warehouse → copy **Server Hostname** and **HTTP Path**
2. Generate a **Personal Access Token** (User Settings → Developer)
3. Create a **Genie Space** → connect it to the `safety_incidents` Delta Table → copy the Space ID from the URL
4. Add all credentials to `backend/.env`

On first startup, the backend automatically:
- Creates `safety_incidents`, `notifications`, and `safety_documents` Delta Tables
- Seeds realistic sample incidents with proper UUID IDs
- Run `python scripts/generate_pdfs.py` once to generate PDFs and seed `safety_documents`

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health/` | Health check + Databricks status |
| POST | `/api/chat/` | AI chat — routes to Genie or Knowledge Assistant |
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
| AI Data | Databricks Genie Space | Connected to `safety_incidents` Delta Table |

**Render environment variables required:**
```
ANTHROPIC_API_KEY
DATABRICKS_HOST
DATABRICKS_HTTP_PATH
DATABRICKS_TOKEN
DATABRICKS_GENIE_SPACE_ID
```

---

## Key Design Decisions

- **Dual AI routing** — Data questions go to Genie Space for live accuracy; knowledge questions go to Claude + indexed PDFs for compliance-grounded answers. Zero hallucination on safety-critical queries.
- **Databricks-first** — Both live incident data and PDF knowledge chunks live in Delta Tables, making Databricks the single source of truth for all AI context.
- **UUID IDs** — All records use UUID primary keys, auto-generated and auto-seeded on startup.
- **Event-driven notifications** — Frontend fires custom browser events on incident actions so the notification bell updates in under 1 second without polling.
- **Mock fallback** — App works fully with in-memory data if Databricks is unavailable, ensuring zero-downtime demos.

---

## Built With

- [Databricks Genie Space](https://databricks.com) — Natural language to SQL over Delta Tables
- [Anthropic Claude API](https://anthropic.com) — Knowledge Assistant AI responses
- [Databricks Delta Lake](https://databricks.com) — ACID-compliant data storage
- [FastAPI](https://fastapi.tiangolo.com) — Python backend
- [React](https://react.dev) + [Vite](https://vitejs.dev) — Frontend
- [Tailwind CSS](https://tailwindcss.com) — Styling
- [Recharts](https://recharts.org) — Data visualization
- [fpdf2](https://py-fpdf2.readthedocs.io) — PDF generation

---

*Built as a portfolio project demonstrating full-stack AI application development with enterprise data infrastructure.*
