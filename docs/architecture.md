# System Architecture — Post-Discharge Patient Care Agent

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Patient Interface                            │
│           React Web App  /  Flutter Mobile App                  │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS / JWT
┌────────────────────────▼────────────────────────────────────────┐
│            IBM Watsonx Orchestrate                              │
│         PostDischargePatient_CareAgent                          │
│   Model: llama-3-2-90b-vision-instruct → Granite-3.3-8B         │
│                                                                 │
│  ┌──────────────────┐    ┌──────────────────────────────────┐   │
│  │   Knowledge Base │    │           Agent Tools            │   │
│  │  18 clinical PDFs│    │  post__symptoms                  │   │
│  │  - PostDischarge │    │  get__medications                │   │
│  │  - HF-Symptom    │    │  post__medications_remind        │   │
│  │  - HR_Policy     │    │  post__escalate                  │   │
│  │  - Guidelines    │    │  post__appointments              │   │
│  └──────────────────┘    │  get__procedures_cost            │   │
│                          │  get__member_profile             │   │
│  ┌──────────────────┐    └──────────────────────────────────┘   │
│  │  Collaborators   │                                           │
│  │  AskOrchestrate  │                                           │
│  │  Dynamiq AI Med  │                                           │
│  │  Patient Facing  │                                           │
│  └──────────────────┘                                           │
└─────────────────────┬───────────────────────────────────────────┘
                      │ OpenAPI / REST
┌─────────────────────▼───────────────────────────────────────────┐
│                   Flask Backend API                             │
│                   (Python 3.11)                                 │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │               4-Layer Safety Architecture                │   │
│  │                                                          │   │
│  │  Layer 1: Input Validation                               │   │
│  │  ├── Intent classification                               │   │
│  │  ├── Emergency detection (temp ≥ 104°F → call 911)       │   │
│  │  └── Red-flag keyword matching                           │   │
│  │                                                          │   │
│  │  Layer 2: RAG Constraints                                │   │
│  │  ├── Only verified clinical sources                      │   │
│  │  └── watsonx.ai: Granite-3.3-8B risk evaluation          │   │
│  │                                                          │   │
│  │  Layer 3: Output Guardrails                              │   │
│  │  ├── No diagnoses, no prescriptions                      │   │
│  │  ├── Escalation routing                                  │   │
│  │  └── Nurse notification trigger                          │   │
│  │                                                          │   │
│  │  Layer 4: MLflow Audit Logging                           │   │
│  │  ├── Every interaction logged (anonymized)               │   │
│  │  └── HIPAA-compliant audit trail                         │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │PostgreSQL│  │  MLflow  │  │ Tableau/ │
  │/ DB2     │  │ Server   │  │ Power BI │
  │          │  │(Port 5001)│ │Dashboard │
  └──────────┘  └──────────┘  └──────────┘
```

## Data Flow

### Daily Check-in Flow

```
1. Patient opens app (React/Flutter)
2. JWT authentication via /auth/login
3. Agent presents structured check-in questions
4. Patient submits: symptom_type, severity (0-10), temperature_f, notes
5. Layer 1: Input validation — emergency keywords detected?
   └── YES → Return immediate emergency guidance (no LLM call)
   └── NO  → Continue
6. Layer 2: watsonx.ai Granite evaluates severity
   └── Generates: risk_level (low/medium/high/critical)
7. Layer 3: Output guardrails applied
   └── HIGH/CRITICAL → EscalationLog created → Nurse notified
   └── LOW/MEDIUM   → Adaptive reminders scheduled
8. DashboardMetrics updated
9. Layer 4: MLflow logs event (anonymized patient ID)
10. Empathetic feedback message returned to the patient
```

### Escalation Flow

```
High-risk detected
       ↓
EscalationLog created (DB)
       ↓
Nurse notification sent
├── Push notification (app)
├── SMS (Twilio)
└── Email (SendGrid)
       ↓
Nurse dashboard updated (Tableau)
       ↓
Patient receives: "A nurse has been notified..."
       ↓
MLflow: log_escalation_event()
```

## KPIs Tracked in MLflow

| Metric                     | Description                         | Target |
|----------------------------|-------------------------------------|--------|
| `symptom_severity`         | Pain level 0-10 per check-in        |   -    |
| `temperature_f`            | Fever measurement                   |   -    |
| `escalation_flag`          | 0 or 1 per interaction              |   -    |
| `risk_level_numeric`       | 0=low, 1=medium, 2=high, 3=critical |   -    |
| `adherence_taken`          | Medication taken (1) or missed (0)  | ≥85%   |
| Overall detection accuracy | Critical symptom detection          | ≥90%   |
| Average response time      | Seconds per agent response          | ≤3s    |
| Conversation completion    | % of check-ins completed            | ≥85%   |

## Security Architecture

- **Authentication:** JWT tokens (1hr access, 30d refresh)
- **API Key Security:** IBM Cloud API key stored in env variables ONLY
- **Data Anonymization:** SHA-256 hashed patient IDs in MLflow
- **HIPAA Compliance:** No PII sent to LLM, audit logs for all decisions
- **Rate Limiting:** /api/evaluate limited to 10 req/min
- **HTTPS Only:** All production traffic over TLS 1.3

## IBM Watsonx Orchestrate — Live Agent

- **URL:** `https://au-syd.watson-orchestrate.cloud.ibm.com`
- **Agent ID:** `2828b79e-8ed4-474a-bff4-b4c5d7d455c1`
- **Model:** `llama-3-2-90b-vision-instruct` → migrating to `Granite-3.3-8B-Instruct`
- **Region:** Australia Sydney (au-syd)
- **Status:** 🟢 LIVE (as of November 2025)
- **Knowledge Files:** 18 clinical documents connected
- **Collaborator Agents:** AskOrchestrate, Dynamiq AI Medical Agent, Patient Facing AI Agent

## Team

| Role                         | Name                    | Responsibility                            |
|------------------------------|-------------------------|-------------------------------------------|
| Project Lead / Scrum Master  | Sviatoslav Pechenevskyi | Architecture, coordination, documentation |
| AI / Backend Developer       | Sylvester Edmond Saidu  | watsonx.ai, escalation logic, APIs        |
| Frontend / Chatbot Developer | Huu Hung Nguyen         | React UI, conversation flow               |
| Data & QA Engineer           | Dipayan Samanta         | Testing, MLflow, data pipelines           |
