"""
IBM watsonx.ai — Symptom Risk Evaluation Service.
Uses Granite-3.3-8B-Instruct for clinical decision support.
HIPAA-compliant: no PII sent to LLM; only anonymized symptom data.
"""

import os
import json
import requests
from datetime import datetime

from config import Config


# ── Escalation rules (rule-based layer — runs BEFORE LLM) ──────────────────
CRITICAL_THRESHOLDS = {
    "temperature_f": 104.0,      # Immediate emergency
    "severity":      9.5,         # Near-maximum pain
}

HIGH_THRESHOLDS = {
    "temperature_f": Config.FEVER_ESCALATION_THRESHOLD,  # 101.5°F
    "severity":      Config.PAIN_ESCALATION_THRESHOLD,    # 7.0
}

RED_FLAG_SYMPTOMS = [
    "chest pain", "shortness of breath", "severe bleeding",
    "unconscious", "stroke", "seizure", "cannot breathe",
]


def evaluate_symptom_risk(symptom_data: dict) -> dict:
    """
    Evaluate patient symptom severity and determine escalation.

    Args:
        symptom_data: {symptom_type, severity, temperature_f, notes, patient_id}

    Returns:
        {risk_level: low|medium|high|critical, escalation_flag: bool, reason: str, recommendation: str}
    """
    severity      = float(symptom_data.get("severity", 0) or 0)
    temperature_f = float(symptom_data.get("temperature_f") or 0)
    notes         = (symptom_data.get("notes") or "").lower()

    # ── Layer 1: Hard rule-based checks (no LLM cost) ──────────────────────
    # Check for critical thresholds
    if temperature_f >= CRITICAL_THRESHOLDS["temperature_f"] or severity >= CRITICAL_THRESHOLDS["severity"]:
        return {
            "risk_level":      "critical",
            "escalation_flag": True,
            "reason":          f"Critical threshold exceeded: temp={temperature_f}°F, severity={severity}/10",
            "recommendation":  "Call 911 or go to emergency room immediately.",
        }

    # Check for red-flag keywords in free text
    for flag in RED_FLAG_SYMPTOMS:
        if flag in notes:
            return {
                "risk_level":      "high",
                "escalation_flag": True,
                "reason":          f"Red-flag symptom detected: '{flag}'",
                "recommendation":  "Nurse notification triggered. Seek immediate medical attention if symptoms worsen.",
            }

    # High thresholds
    if temperature_f >= HIGH_THRESHOLDS["temperature_f"] or severity >= HIGH_THRESHOLDS["severity"]:
        return {
            "risk_level":      "high",
            "escalation_flag": True,
            "reason":          f"High-risk threshold exceeded: temp={temperature_f}°F, severity={severity}/10",
            "recommendation":  "Nurse has been notified. Monitor closely and rest.",
        }

    # ── Layer 2: LLM contextual evaluation (anonymized data only) ──────────
    if _should_use_llm(symptom_data):
        try:
            return _llm_evaluate(symptom_data)
        except Exception as e:
            # Fallback to rule-based if LLM unavailable
            pass

    # ── Layer 3: Low/Medium classification ─────────────────────────────────
    if severity >= 5 or temperature_f >= 99.5:
        return {
            "risk_level":      "medium",
            "escalation_flag": False,
            "reason":          "Moderate symptoms detected — monitoring recommended",
            "recommendation":  "Rest, stay hydrated, and monitor symptoms. Contact us if they worsen.",
        }

    return {
        "risk_level":      "low",
        "escalation_flag": False,
        "reason":          "Symptoms within normal recovery range",
        "recommendation":  "Keep following your recovery plan. You're doing great! 💚",
    }


def _should_use_llm(symptom_data: dict) -> bool:
    """Determine if LLM evaluation is warranted (avoid unnecessary API calls)."""
    severity     = float(symptom_data.get("severity", 0) or 0)
    has_notes    = bool(symptom_data.get("notes", "").strip())
    return severity >= 3 or has_notes


def _llm_evaluate(symptom_data: dict) -> dict:
    """
    Call IBM watsonx.ai Granite model for contextual risk evaluation.
    Sends ONLY anonymized clinical data — no patient PII.
    """
    api_key    = Config.WATSONX_API_KEY
    url        = Config.WATSONX_URL
    project_id = Config.WATSONX_PROJECT_ID
    model_id   = Config.WATSONX_MODEL_ID

    # Get IAM token
    iam_token = _get_iam_token(api_key)

    prompt = f"""You are a clinical AI assistant evaluating post-discharge patient symptoms.
Analyze the following anonymized symptom data and classify risk level.

Symptom type: {symptom_data.get('symptom_type', 'unspecified')}
Severity (0-10): {symptom_data.get('severity', 0)}
Temperature (°F): {symptom_data.get('temperature_f', 'not measured')}
Patient notes: {symptom_data.get('notes', 'none')}

Respond ONLY with valid JSON:
{{
  "risk_level": "low|medium|high",
  "escalation_flag": true|false,
  "reason": "brief clinical reason",
  "recommendation": "patient-friendly recommendation"
}}

Do NOT diagnose. Do NOT prescribe. Flag high-risk for nurse review."""

    response = requests.post(
        f"{url}/ml/v1/text/generation?version=2023-05-29",
        headers={
            "Authorization": f"Bearer {iam_token}",
            "Content-Type":  "application/json",
        },
        json={
            "model_id":  model_id,
            "project_id": project_id,
            "input":     prompt,
            "parameters": {
                "decoding_method": "greedy",
                "max_new_tokens":  200,
                "temperature":     0.1,  # Low temperature for clinical consistency
            },
        },
        timeout=10,
    )

    result_text = response.json()["results"][0]["generated_text"].strip()

    # ── Layer 3: Output guardrails ──────────────────────────────────────────
    # Strip any markdown fences
    if "```" in result_text:
        result_text = result_text.split("```")[1].replace("json", "").strip()

    parsed = json.loads(result_text)

    # Validate output — never trust LLM output blindly
    valid_risk_levels = {"low", "medium", "high"}
    if parsed.get("risk_level") not in valid_risk_levels:
        parsed["risk_level"] = "medium"
        parsed["escalation_flag"] = True

    return parsed


def _get_iam_token(api_key: str) -> str:
    """Get IBM Cloud IAM access token."""
    response = requests.post(
        "https://iam.cloud.ibm.com/identity/token",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data=f"grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey={api_key}",
        timeout=10,
    )
    return response.json()["access_token"]
