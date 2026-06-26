"""
MLflow KPI Logging — Layer 4 Audit Trail.
Logs every AI-patient interaction for compliance, performance tracking,
and continuous improvement.
"""

import mlflow
import mlflow.tracking
from datetime import datetime
from config import Config


def init_mlflow():
    """Initialize MLflow tracking."""
    mlflow.set_tracking_uri(Config.MLFLOW_TRACKING_URI)
    mlflow.set_experiment(Config.MLFLOW_EXPERIMENT)


def log_checkin_event(patient_id: str, symptom_data: dict, risk_result: dict):
    """
    Log a check-in event with full audit trail.
    Anonymized — patient_id is hashed for HIPAA compliance.
    """
    import hashlib
    anon_id = hashlib.sha256(patient_id.encode()).hexdigest()[:12]

    with mlflow.start_run(run_name=f"checkin_{anon_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"):
        # Symptom metrics
        mlflow.log_metric("symptom_severity", float(symptom_data.get("severity") or 0))
        mlflow.log_metric("temperature_f",    float(symptom_data.get("temperature_f") or 0))
        mlflow.log_metric("escalation_flag",  int(risk_result.get("escalation_flag", False)))

        # Risk classification
        risk_map = {"low": 0, "medium": 1, "high": 2, "critical": 3}
        mlflow.log_metric("risk_level_numeric", risk_map.get(risk_result.get("risk_level", "low"), 0))

        # Tags (non-PII metadata)
        mlflow.set_tags({
            "patient_anon_id": anon_id,
            "symptom_type":    symptom_data.get("symptom_type", "unknown"),
            "risk_level":      risk_result.get("risk_level", "low"),
            "event_type":      "daily_checkin",
        })


def log_escalation_event(patient_id: str, risk_level: str, reason: str):
    """Log an escalation event for compliance audit."""
    import hashlib
    anon_id = hashlib.sha256(patient_id.encode()).hexdigest()[:12]

    with mlflow.start_run(run_name=f"escalation_{anon_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"):
        mlflow.log_metric("escalation_triggered", 1)
        mlflow.set_tags({
            "patient_anon_id": anon_id,
            "risk_level":      risk_level,
            "reason":          reason[:200],
            "event_type":      "escalation",
        })


def log_medication_adherence(patient_id: str, adherence_status: str, medication_name: str):
    """Log medication adherence event."""
    import hashlib
    anon_id = hashlib.sha256(patient_id.encode()).hexdigest()[:12]

    with mlflow.start_run(run_name=f"medication_{anon_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"):
        mlflow.log_metric("adherence_taken", 1 if adherence_status == "taken" else 0)
        mlflow.set_tags({
            "patient_anon_id":  anon_id,
            "adherence_status": adherence_status,
            "medication":       medication_name,
            "event_type":       "medication_adherence",
        })
