# 🏥 Post-Discharge Patient Care Agent

## 📰 GRADE Framework Series — Featured Articles

This repository is the production implementation behind:

**Part 1:** "87% on USMLE. 52% Under-Triage Rate in Production. Same AI."
→ [Read on LinkedIn](https://www.linkedin.com/pulse/87-usmle-52-under-triage-rate-production-same-ai-pechenevskyi-nlx7c/)
What standard benchmarks miss — and why the gap matters.

**Part 2:** "How to Build the Tests That Actually Catch Healthcare AI Deployment Failures"
→ [Read on LinkedIn](ССЫЛКА_DEEP)
Dual-agent validation, adversarial test design, evaluation methodology.

**GRADE Framework:** 10 failure patterns, full benchmark suite
→ [github.com/Svyatoslavpech/retail-ai-store-level-intelligence](https://github.com/Svyatoslavpech/retail-ai-store-level-intelligence)


> **AI-powered virtual nurse for patients after hospital discharge.**  
> Built on IBM watsonx Orchestrate + watsonx.ai by team **Spiritual Techies**  
> IBM AI Experiential Learning Lab 2025 — Healthcare Track, Challenge 1

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![IBM watsonx](https://img.shields.io/badge/IBM-watsonx-0062FF)](https://www.ibm.com/watsonx)
[![Model](https://img.shields.io/badge/Model-Granite--3.3--8B--Instruct-green)](https://www.ibm.com/granite)
[![HIPAA](https://img.shields.io/badge/Compliance-HIPAA--Ready-red)](docs/architecture.md)
[![Status](https://img.shields.io/badge/Status-Backend%20Ready%20%7C%20Frontend%20In%20Progress-yellow)](https://github.com/Svyatoslavpech/healthcare-ai-agent)
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

## 🧭 Project Journey

This project began as a prototype developed during the **IBM AI Experiential Learning Lab** (Healthcare Track, Challenge 1). During the Lab, our team:

- Conducted user research and validated the concept with patients and nurses
- Designed the agent architecture and conversation flow
- Built a functional prototype using IBM WatsonX Orchestrate
- Ran 55+ test scenarios, achieving ≥90% accuracy in critical symptom detection
- Received confirmation from IBM mentors that the approach was clinically sound

**After the Lab**, we took the initiative to scale the prototype into a production-ready system:

- ✅ Built a full Flask backend with 4-layer safety architecture
- ✅ Implemented JWT authentication, database models, and REST API
- ✅ Added MLflow audit logging for HIPAA compliance
- ✅ Wrote comprehensive tests (55+ unit + adversarial + integration scenarios)
- ✅ Set up Docker, docker-compose, and GitHub Actions CI/CD
- ✅ Integrated with IBM watsonx.ai Granite-3.3-8B for risk evaluation

**Next steps (in progress):**

- 🔨 Developing React frontend (Login, Dashboard, Settings, Feedback)
- 📱 Flutter mobile app (basic screens for patient interaction)
- 📊 Monitoring (Prometheus + Grafana)
- 🚀 Deployment automation to IBM Cloud

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

| Layer       | Component         | Implementation                                                                        |
|-------------|-------------------|---------------------------------------------------------------------------------------|
| **Layer 1** | Input Validation  | Classify patient intent, flag emergencies BEFORE LLM processes query                  |
| **Layer 2** | RAG Constraints   | Verified clinical sources only (PostDischarge_Guidelines.pdf, HF-Symptom-Tracker.pdf) |
| **Layer 3** | Output Guardrails | Block unverified medical references, enforce HIPAA boundaries                         |
| **Layer 4** | Audit Logging     | MLflow records every decision for compliance review                                   |

**Result: Zero critical findings across 55+ test scenarios including adversarial prompts.**

---

## 🤖 Agent Tools (OpenAPI)

| Tool                         | Operation                    | Description                                   |
|------------------------------|------------------------------|-----------------------------------------------|
| Submit patient symptoms      | `post__symptoms`             | Structured symptom input and severity scoring |
| Get patient medications      | `get__medications`           | Retrieve patient medication schedule          |
| Send medication reminder     | `post__medications_remind`   | Trigger personalized reminder                 |
| Escalate patient case        | `post__escalate`             | Nurse notification for high-risk cases        |
| Schedule appointment         | `post__appointments`         | Book follow-up visits                         |
| Get estimated procedure cost | `get__procedures_cost`       | Insurance/cost queries                        |
| Historical procedures        | `get__historical_procedures` | Past procedure analysis                       |
| Available procedures         | `get__available_procedures`  | Current procedure options                     |
| Get member profile           | `get__member_profile`        | Patient plan and contact data                 |
| Edit appointment             | `patch__appointments`        | Reschedule existing appointments              |
| Cancel appointment           | `delete__appointments`       | Cancel appointments                           |

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

| KPI                                    | Target      | Status       |
|----------------------------------------|-------------|--------------|
| Critical symptom detection accuracy    | ≥ 90%       | ✅ Validated |
| Average agent response time            | ≤ 3 seconds | ✅ Validated |
| Conversation completion rate           | ≥ 85%       | ✅ Validated |
| Ethical compliance (IBM mentor review) | Confirmed   | ✅ Confirmed |

---

## 🛠️ Tech Stack — Status

| Layer              | Technology                             | Status              |
|--------------------|----------------------------------------|---------------------|
| **AI Core**        | IBM watsonx Orchestrate + watsonx.ai   | ✅ LIVE             |
| **LLM**            | IBM Granite-3.3-8B-Instruct            | ✅ Integrated       |
| **Backend**        | Python (Flask)                         | ✅ Production-ready |
| **Frontend**       | React.js (Web)                         | 🚧 In development   |
| **Mobile**         | Flutter                                | 🚧 Planned          |
| **Database**       | PostgreSQL / IBM Cloud DB2             | ✅ Ready            |
| **Analytics**      | MLflow + Tableau / Power BI            | ✅ Ready            |
| **Infrastructure** | Docker, Docker Compose, GitHub Actions | ✅ Ready            |
| **Compliance**     | HIPAA-ready, Apache 2.0 License        | ✅ Ready            |

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
- MLflow: `http://localhost:5001`

### Manual Setup

```bash
# Backend
cd src/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
flask run

# Frontend (new terminal)
cd frontend
npm install
npm start
```

---

## 🧪 Test Scenarios

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

### Running Tests

```bash
PYTHONPATH=src/backend pytest tests/unit -v
PYTHONPATH=src/backend pytest tests/integration -v
```

---

## 👥 Team — Spiritual Techies

| Role                         | Name                        |
|------------------------------|-----------------------------|
| Project Lead / Scrum Master  | **Sviatoslav Pechenevskyi** |
| AI / Backend Developer       | Sylvester Edmond Saidu      |
| Frontend / Chatbot Developer | Huu Hung Nguyen             |
| Data & QA Engineer           | Dipayan Samanta             |
| Documentation Lead           | Sviatoslav Pechenevskyi     |

**Contact:** svyatoslavpech@gmail.com  
**LinkedIn:** [linkedin.com/in/svyatsolution](https://linkedin.com/in/svyatsolution)  
**Portfolio:** [svyatsolutions.com](https://svyatsolutions.com)

---

## 🔗 Related Projects

- **GRADE Framework** — [retail-ai-store-level-intelligence](https://github.com/Svyatoslavpech/retail-ai-store-level-intelligence): 10 failure patterns for AI agents in production
- **Weather App QA Demo** — 6 Mocha/Chai tests

---

## 📄 License

Apache 2.0 — Copyright 2025 Sviatoslav Pechenevskyi

---

*IBM AI Experiential Learning Lab 2025 | Spiritual Techies | Healthcare Track Challenge 1*
