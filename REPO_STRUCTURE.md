# 📁 Repository Structure — healthcare-ai-agent

```
healthcare-ai-agent/
│
├── README.md                          # Project overview, KPIs, quick start
├── LICENSE                            # Apache 2.0
├── Dockerfile                         # Backend container (Python 3.11)
├── docker-compose.yml                 # Full stack: API + Frontend + DB + MLflow
├── requirements.txt                   # Python dependencies
├── .env.example                       # Environment variables template
├── .gitignore                         # Git ignore rules
│
├── agent-config/                      # IBM watsonx Orchestrate agent config
│   ├── persistent_prompt.txt          # Production system prompt (13 sections)
│   └── tools_openapi.yaml             # OpenAPI spec for all 11 agent tools
│
├── src/
│   └── backend/                       # Flask REST API (Python)
│       ├── app.py                     # Application factory, blueprints
│       ├── config.py                  # Config: watsonx, DB, JWT, thresholds
│       ├── models/
│       │   └── patient.py             # 5 data models (SQLAlchemy)
│       │                              #   PatientProfile
│       │                              #   SymptomReport
│       │                              #   MedicationAdherenceLog
│       │                              #   EscalationLog
│       │                              #   DashboardMetrics
│       ├── routes/
│       │   └── checkins.py            # POST /checkins — 4-layer safety flow
│       └── services/
│           ├── watsonx_ai.py          # IBM Granite risk evaluation (Layer 2)
│           └── mlflow_logger.py       # HIPAA audit logging (Layer 4)
│
├── frontend/
│   └── src/
│       └── components/
│           └── Checkin.jsx            # Daily check-in UI (IBM Blue design)
│
├── tests/
│   └── unit/
│       └── test_escalation.py         # 55+ test scenarios + adversarial
│
├── docs/
│   └── architecture.md               # System architecture + data flow diagrams
│
└── .github/
    └── workflows/
        └── ci.yml                     # CI/CD: tests + security scan + Docker
```

---

## 🔄 Data Flow Diagram

```
Patient App
    │
    ▼ POST /checkins
┌─────────────────────────────────────┐
│         Layer 1: Input Validation   │
│  • Emergency keyword check          │◄── temp ≥ 104°F → STOP → "Call 911"
│  • Range validation (severity 0-10) │
│  • Red-flag symptom detection       │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│      Layer 2: RAG + LLM Eval        │
│  • Granite-3.3-8B risk evaluation   │◄── Only anonymized clinical data
│  • Verified clinical sources only   │
│  • Returns: risk_level + reason     │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│      Layer 3: Output Guardrails     │
│  • No diagnoses, no prescriptions   │
│  • HIGH/CRITICAL → EscalationLog   │──► Nurse notified (SMS/Email/Push)
│  • Empathetic feedback generated    │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│      Layer 4: MLflow Audit Log      │
│  • Anonymized patient ID (SHA-256)  │──► Tableau Dashboard
│  • Every decision traceable         │
│  • HIPAA-compliant                  │
└──────────────────┬──────────────────┘
                   │
                   ▼
         Response to Patient
         {risk_level, message, escalation}
```

---

## 🎯 Risk Escalation Logic

```
Symptom Input
      │
      ├─ temp ≥ 104°F ──────────────────► CRITICAL → "Call 911"
      │
      ├─ severity ≥ 9.5 ────────────────► CRITICAL → Nurse alert
      │
      ├─ Red-flag keywords ─────────────► HIGH → Nurse notified
      │  (chest pain, seizure, stroke...)
      │
      ├─ temp ≥ 101.5°F ───────────────► HIGH → Nurse notified
      │
      ├─ severity ≥ 7.0 ────────────────► HIGH → Nurse notified
      │
      ├─ temp ≥ 99.5°F OR severity ≥ 5 ► MEDIUM → Monitor + advise
      │
      └─ All else ──────────────────────► LOW → 💚 Keep it up!
```

---

## 🤖 IBM watsonx Orchestrate Architecture

```
PostDischargePatient_CareAgent
├── Profile
│   ├── Welcome: "Hi! I'm your care assistant..."
│   └── Quick prompts: symptoms / medications / doctor visit
│
├── Knowledge (18 files)
│   ├── PostDischarge_Guidelines.pdf
│   ├── HF-Symptom-Tracker.pdf
│   ├── HFMonitoringHandout.pdf
│   ├── HR_Policy_Medicalbenefits.pdf
│   └── + 14 additional clinical documents
│
├── Toolset (11 tools)
│   ├── post__symptoms
│   ├── get__medications
│   ├── post__medications_remind
│   ├── post__escalate
│   ├── post__appointments
│   ├── get__procedures_cost
│   ├── get__historical_procedures
│   ├── get__available_procedures
│   ├── get__member_profile
│   ├── patch__appointments
│   └── delete__appointments
│
├── Behavior
│   ├── Instructions: Production system prompt
│   └── Guidelines: Symptoms / Medications / Escalation
│
├── Collaborators
│   ├── AskOrchestrate
│   ├── Dynamiq AI Medical Agent
│   └── Patient Facing AI Agent for Healthcare
│
└── Channels
    ├── Embedded agent (web)
    ├── Teams
    └── WhatsApp with Twilio
```
