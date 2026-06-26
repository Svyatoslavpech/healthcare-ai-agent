# 🏥 Post-Discharge Patient Care Agent

> **AI-powered virtual nurse for patients after hospital discharge.**  
> Built on IBM watsonx Orchestrate + watsonx.ai by team **Spiritual Techies**  
> IBM AI Experiential Learning Lab 2025 — Healthcare Track, Challenge 1

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![IBM watsonx](https://img.shields.io/badge/IBM-watsonx-0062FF)](https://www.ibm.com/watsonx)
[![Model](https://img.shields.io/badge/Model-Granite--3.3--8B--Instruct-green)](https://www.ibm.com/granite)
[![HIPAA](https://img.shields.io/badge/Compliance-HIPAA--Ready-red)](docs/architecture.md)
[![Portfolio](https://img.shields.io/badge/Portfolio-svyatsolutions.com-1F3864)](https://svyatsolutions.com)

---

## 🎯 The Problem

Patients discharged from hospitals often fail to follow care instructions or recognize worsening symptoms early — leading to unnecessary readmissions. Human capacity for 24/7 follow-up is limited, and wrong AI answers in a clinical context can be life-threatening.

**Standard LLM systems lack the safety architecture to operate in this environment.**

## 💡 The Solution

An autonomous **Post-Discharge Patient Care Agent** that acts as a virtual follow-up nurse:

- 📋 **Daily structured check-ins** — collects symptoms (pain, fever, swelling, mobility)
- 💊 **Adaptive medication reminders** — personalized schedules with adherence verification
- 🚨 **Escalation workflows** — high-risk symptoms trigger immediate nurse notification
- 📊 **Recovery dashboard** — visual tracking of adherence and recovery trends
- 🧠 **Multi-turn memory** — context-aware interactions across sessions
- 💙 **Empathetic messaging** — warm, clinical, HIPAA-compliant responses

---

## 🏗️ Architecture

```
Patient App (React/Flutter)
        ↓
IBM Watsonx Orchestrate (PostDischargePatient_CareAgent)
        ↓                    ↓
watsonx.ai               Tools (OpenAPI)
(Risk Evaluation)    ┌────────────────────┐
        ↓            │ post__symptoms     │
Escalation Flag      │ get__medications   │
        ↓            │ post__escalate     │
Nurse Dashboard      │ post__appointments │
        ↓            │ get__procedures    │
    MLflow           └────────────────────┘
(KPI Logging)
        ↓
PostgreSQL / IBM Cloud DB2
```

**Live Agent:** IBM watsonx Orchestrate (au-syd region)  
**Status:** 🟢 LIVE  
**Model:** `llama-3-2-90b-vision-instruct` → migrating to `Granite-3.3-8B-Instruct`

---

## 🔬 4-Layer Safety Architecture

| Layer | Component | Implementation |
|-------|-----------|----------------|
| **Layer 1** | Input Validation | Classify patient intent, flag emergencies BEFORE LLM processes query |
| **Layer 2** | RAG Constraints | Verified clinical sources only (PostDischarge_Guidelines.pdf, HF-Symptom-Tracker.pdf) |
| **Layer 3** | Output Guardrails | Block unverified medical references, enforce HIPAA boundaries |
| **Layer 4** | Audit Logging | MLflow records every decision for compliance review |

**Result: Zero critical findings across 55+ test scenarios including adversarial prompts.**

---

## 🤖 Agent Tools (OpenAPI)

| Tool | Operation | Description |
|------|-----------|-------------|
| Submit patient symptoms | `post__symptoms` | Structured symptom input and severity scoring |
| Get patient medications | `get__medications` | Retrieve patient medication schedule |
| Send medication reminder | `post__medications_remind` | Trigger personalized reminder |
| Escalate patient case | `post__escalate` | Nurse notification for high-risk cases |
| Schedule appointment | `post__appointments` | Book follow-up visits |
| Get estimated procedure cost | `get__procedures_cost` | Insurance/cost queries |
| Historical procedures | `get__historical_procedures` | Past procedure analysis |
| Available procedures | `get__available_procedures` | Current procedure options |
| Get member profile | `get__member_profile` | Patient plan and contact data |
| Edit appointment | `patch__appointments` | Reschedule existing appointments |
| Cancel appointment | `delete__appointments` | Cancel appointments |

---

## 🧠 Knowledge Base (18 Documents)

The agent references verified clinical documents uploaded to WatsonX Orchestrate:

- `PostDischarge_Guidelines.pdf` — discharge protocols, symptom escalation criteria
- `HF-Symptom-Tracker.pdf` — heart failure symptom monitoring
- `HFMonitoringHandout.pdf` — patient monitoring guidance
- `Symptom_Checklist_Template.pdf` — structured daily check-in questions
- `PI_PreOp_How-to-recognise-complications.pdf` — complication recognition
- `HR_Policy_Medicalbenefits.pdf` — insurance and benefits queries
- `11376-Your-Discharge-Planning-Checklist.pdf` — discharge planning
- + 11 additional clinical reference documents

---

## 📊 KPIs & Metrics

| KPI | Target | Status |
|-----|--------|--------|
| Critical symptom detection accuracy | ≥ 90% | ✅ Validated |
| Average agent response time | ≤ 3 seconds | ✅ Validated |
| Conversation completion rate | ≥ 85% | ✅ Validated |
| Ethical compliance (IBM mentor review) | Confirmed | ✅ Confirmed |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **AI Core** | IBM watsonx Orchestrate + watsonx.ai |
| **LLM** | IBM Granite-3.3-8B-Instruct |
| **Backend** | Python (Flask) |
| **Frontend** | React.js (Web) + Flutter (Mobile) |
| **Database** | PostgreSQL / IBM Cloud DB2 |
| **Analytics** | MLflow + Tableau / Power BI |
| **Infrastructure** | Docker, Docker Compose, GitHub Actions |
| **Compliance** | HIPAA-ready, Apache 2.0 License |

---

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 16+
- Docker & Docker Compose
- IBM Cloud account with watsonx.ai access

### Local Setup (Docker)

```bash
git clone https://github.com/Svyatoslavpech/healthcare-ai-agent.git
cd healthcare-ai-agent

# Copy and configure environment
cp .env.example .env
# Edit .env with your IBM Cloud credentials

# Start all services
docker-compose up --build
```

**Services after startup:**
- Backend API: `http://localhost:5000`
- Frontend: `http://localhost:3000`
- API Docs: `http://localhost:5000/api/docs`

### Manual Setup

```bash
# Backend
cd src/backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
flask run

# Frontend (new terminal)
cd frontend
npm install
npm start
```

---

## 📁 Repository Structure

```
healthcare-ai-agent/
├── README.md
├── LICENSE
├── requirements.txt
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── .gitignore
│
├── agent-config/                    # IBM watsonx Orchestrate agent config
│   ├── persistent_prompt.txt        # Production-ready system prompt
│   ├── tools_openapi.yaml           # OpenAPI spec for all 11 tools
│   ├── knowledge_sources.json       # Knowledge base metadata
│   └── guidelines.md                # Agent behavior guidelines
│
├── src/
│   └── backend/
│       ├── app.py                   # Flask application entry point
│       ├── config.py                # Configuration management
│       ├── models/
│       │   ├── patient.py           # Patient Profile model
│       │   ├── symptom.py           # Symptom Report model
│       │   ├── medication.py        # Medication Adherence Log
│       │   ├── escalation.py        # Escalation Log model
│       │   └── dashboard.py         # Dashboard Metrics model
│       ├── routes/
│       │   ├── auth.py              # JWT authentication
│       │   ├── patients.py          # Patient CRUD endpoints
│       │   ├── checkins.py          # Daily check-in endpoints
│       │   ├── medications.py       # Medication management
│       │   ├── alerts.py            # Escalation alerts
│       │   └── dashboard.py         # KPI dashboard
│       └── services/
│           ├── watsonx_assistant.py # watsonx Orchestrate integration
│           ├── watsonx_ai.py        # watsonx.ai risk evaluation
│           ├── notification.py      # SMS/Email/Push notifications
│           └── mlflow_logger.py     # MLflow KPI logging
│
├── frontend/
│   ├── package.json
│   └── src/
│       ├── App.jsx
│       └── components/
│           ├── Login.jsx            # Patient login screen
│           ├── Onboarding.jsx       # Preference setup
│           ├── Checkin.jsx          # Daily symptom check-in
│           ├── Feedback.jsx         # AI feedback cards
│           ├── Dashboard.jsx        # Recovery trends
│           └── Settings.jsx         # Notification preferences
│
├── tests/
│   ├── unit/
│   │   ├── test_checkins.py         # Symptom collection tests
│   │   ├── test_escalation.py       # Escalation logic tests
│   │   └── test_models.py           # Data model tests
│   └── integration/
│       ├── test_adversarial.py      # Adversarial prompt testing
│       └── test_api_endpoints.py    # Full API integration tests
│
├── docs/
│   ├── architecture.md              # System architecture
│   ├── api_spec.yaml                # OpenAPI 3.0 specification
│   ├── user_guide.md                # Patient & nurse guide
│   └── deployment_guide.md          # IBM Cloud deployment
│
└── .github/
    └── workflows/
        └── ci.yml                   # GitHub Actions CI/CD
```

---

## 🧪 Test Scenarios

### Single-Step
```
"Remind me when to take my antibiotics"
→ get__medications → post__medications_remind

"How should I monitor my swelling today?"
→ Symptoms_Check + PostDischarge_Guidelines.pdf

"I feel dizzy and feverish"
→ post__symptoms → post__escalate
```

### Multi-Step (from live demo)
```
Patient: "I had viral fever and now I'm recovering from it"
Agent:   "What symptoms are you still experiencing?"
Patient: "temperature"
Agent:   "How high is your current temperature?"
Patient: "102 degree"
Agent:   "Have you taken any medication to reduce the fever?"
Patient: "no"
Agent:   "What is your age?"
Patient: "65"
→ Risk evaluation → Escalation triggered → Recovery guidance provided
```

---

## 🏆 Running Tests

```bash
cd src/backend
pytest tests/unit -v
pytest tests/integration -v --coverage
```

---

## 👥 Team — Spiritual Techies

| Role | Name |
|------|------|
| Project Lead / Scrum Master | **Sviatoslav Pechenevskyi** |
| AI / Backend Developer | Sylvester Edmond Saidu |
| Frontend / Chatbot Developer | Huu Hung Nguyen |
| Data & QA Engineer | Dipayan Samanta |
| Documentation Lead | Sviatoslav Pechenevskyi |

**Contact:** svyatoslavpech@gmail.com  
**LinkedIn:** [linkedin.com/in/svyatsolution](https://linkedin.com/in/svyatsolution)  
**Portfolio:** [svyatsolutions.com](https://svyatsolutions.com)

---

## 🔗 Related Projects

- **GRADE Framework** — [retail-ai-store-level-intelligence](https://github.com/Svyatoslavpech/retail-ai-store-level-intelligence): 10 failure patterns for AI agents in production
- **Weather App QA Demo** — 6 Mocha/Chai tests + PromptFoo evaluation suite

---

## 📄 License

Apache 2.0 — Copyright 2025 Sviatoslav Pechenevskyi

---

*IBM AI Experiential Learning Lab 2025 | Spiritual Techies | Healthcare Track Challenge 1*
