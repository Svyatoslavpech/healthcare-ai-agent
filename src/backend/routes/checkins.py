"""
Check-in routes — daily symptom collection and risk evaluation.
POST /checkins        → submit new check-in
GET  /checkins        → get patient check-in history
GET  /checkins/latest → get today's check-in
"""

from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from models.patient import db, SymptomReport, DashboardMetrics, EscalationLog
from services.watsonx_ai import evaluate_symptom_risk
from services.mlflow_logger import log_checkin_event
from services.notification import send_escalation_alert
from config import Config

checkins_bp = Blueprint("checkins", __name__)


@checkins_bp.route("", methods=["POST"])
@jwt_required()
def submit_checkin():
    """
    Submit daily symptom check-in.
    Layer 1: Input validation before any LLM processing.
    Layer 2: Risk evaluation via watsonx.ai.
    Layer 3: Escalation if risk >= HIGH.
    Layer 4: MLflow audit logging.
    """
    patient_id = get_jwt_identity()
    data = request.get_json()

    # --- Layer 1: Input Validation ---
    required = ["symptom_type", "severity"]
    missing = [f for f in required if f not in data]
    if missing:
        return jsonify({"error": f"Missing fields: {missing}"}), 400

    severity = float(data.get("severity", 0))
    if not (0 <= severity <= 10):
        return jsonify({"error": "Severity must be between 0 and 10"}), 400

    temperature_f = data.get("temperature_f")
    if temperature_f and float(temperature_f) > 104:
        # Immediate emergency escalation — do not wait for LLM
        return jsonify({
            "alert": "CRITICAL",
            "message": "Temperature above 104°F requires immediate emergency care. Call 911 or go to emergency room.",
            "escalation": True
        }), 200

    # --- Create symptom report ---
    report = SymptomReport(
        patient_id    = patient_id,
        report_date   = datetime.utcnow().date(),
        symptom_type  = data.get("symptom_type"),
        severity      = severity,
        temperature_f = temperature_f,
        notes         = data.get("notes", ""),
    )

    # --- Layer 2: RAG-constrained risk evaluation ---
    risk_result = evaluate_symptom_risk({
        "symptom_type":  report.symptom_type,
        "severity":      report.severity,
        "temperature_f": report.temperature_f,
        "notes":         report.notes,
        "patient_id":    patient_id,
    })

    report.risk_level      = risk_result.get("risk_level", "low")
    report.escalation_flag = risk_result.get("escalation_flag", False)

    db.session.add(report)
    db.session.flush()  # Get ID before commit

    # --- Layer 3: Output guardrails + Escalation ---
    escalation_created = False
    if report.escalation_flag:
        escalation = EscalationLog(
            patient_id        = patient_id,
            symptom_report_id = report.id,
            risk_level        = report.risk_level,
            trigger_reason    = risk_result.get("reason", "High-risk symptoms detected"),
        )
        db.session.add(escalation)

        # Notify nurse (non-blocking)
        send_escalation_alert(patient_id, risk_result)
        escalation_created = True

    # Update dashboard metrics
    _update_dashboard(patient_id, report)

    db.session.commit()

    # --- Layer 4: MLflow audit logging ---
    log_checkin_event(patient_id, report.to_dict(), risk_result)

    response = {
        "checkin_id":    report.id,
        "risk_level":    report.risk_level,
        "escalation":    escalation_created,
        "message":       _get_feedback_message(report.risk_level, severity),
        "next_checkin":  "Tomorrow at your scheduled check-in time",
    }

    return jsonify(response), 201


@checkins_bp.route("", methods=["GET"])
@jwt_required()
def get_checkins():
    """Get patient check-in history."""
    patient_id = get_jwt_identity()
    limit  = request.args.get("limit", 30, type=int)
    offset = request.args.get("offset", 0, type=int)

    reports = (
        SymptomReport.query
        .filter_by(patient_id=patient_id)
        .order_by(SymptomReport.report_date.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )

    return jsonify({
        "checkins": [r.to_dict() for r in reports],
        "total":    SymptomReport.query.filter_by(patient_id=patient_id).count(),
    }), 200


@checkins_bp.route("/latest", methods=["GET"])
@jwt_required()
def get_latest_checkin():
    """Get today's most recent check-in."""
    patient_id = get_jwt_identity()
    today = datetime.utcnow().date()

    report = (
        SymptomReport.query
        .filter_by(patient_id=patient_id, report_date=today)
        .order_by(SymptomReport.report_time.desc())
        .first()
    )

    if not report:
        return jsonify({"message": "No check-in today yet"}), 404

    return jsonify(report.to_dict()), 200


def _update_dashboard(patient_id, report):
    """Update aggregated dashboard metrics after each check-in."""
    metrics = DashboardMetrics.query.filter_by(patient_id=patient_id).first()
    if not metrics:
        metrics = DashboardMetrics(patient_id=patient_id, pain_trend=[])
        db.session.add(metrics)

    pain_trend = metrics.pain_trend or []
    pain_trend.append({
        "date":     str(report.report_date),
        "severity": report.severity,
    })
    # Keep last 30 data points
    metrics.pain_trend = pain_trend[-30:]
    metrics.checkins_completed += 1
    if report.escalation_flag:
        metrics.high_risk_flags += 1
    metrics.last_updated = datetime.utcnow()


def _get_feedback_message(risk_level, severity):
    """Generate empathetic feedback based on risk level."""
    messages = {
        "low": (
            "Great job completing your check-in! "
            "Your symptoms look manageable. Keep following your recovery plan. 💚"
        ),
        "medium": (
            "Thank you for your check-in. We noticed some symptoms that need monitoring. "
            "Please rest and stay hydrated. We'll check in with you again tomorrow. 🟡"
        ),
        "high": (
            "Your symptoms have been reviewed and flagged for priority attention. "
            "A nurse has been notified and will contact you shortly. "
            "If symptoms worsen, call your doctor immediately. 🔴"
        ),
    }
    return messages.get(risk_level, messages["low"])
