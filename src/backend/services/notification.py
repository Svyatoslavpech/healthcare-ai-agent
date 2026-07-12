"""
Notification Service — SMS (Twilio) + Email (SendGrid)
Post-Discharge Patient Care Agent

Sends escalation alerts to nursing staff and medication
reminders to patients via configured channels.
HIPAA-compliant: minimal PHI in notifications.
"""

import os
import hashlib
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# ── Disable notifications in test environments ──────────────────────────────
NOTIFICATIONS_ENABLED = os.environ.get("NOTIFICATIONS_ENABLED", "true").lower() == "true"


# ── SMS via Twilio ────────────────────────────────────────────────────────────

def send_sms(to_phone: str, message: str) -> bool:
    """Send SMS via Twilio. Returns True on success."""
    if not NOTIFICATIONS_ENABLED:
        logger.info("Notifications disabled — SMS skipped")
        return True

    account_sid = os.environ.get("TWILIO_ACCOUNT_SID", "")
    auth_token  = os.environ.get("TWILIO_AUTH_TOKEN", "")
    from_phone  = os.environ.get("TWILIO_PHONE_NUMBER", "")

    if not all([account_sid, auth_token, from_phone]):
        logger.warning("Twilio credentials not configured — SMS skipped")
        return False

    try:
        from twilio.rest import Client
        client = Client(account_sid, auth_token)
        client.messages.create(body=message, from_=from_phone, to=to_phone)
        logger.info(f"SMS sent to {to_phone[:6]}***")
        return True
    except Exception as e:
        logger.error(f"SMS failed: {e}")
        return False


# ── Email via SendGrid ────────────────────────────────────────────────────────

def send_email(to_email: str, subject: str, body: str) -> bool:
    """Send email via SendGrid. Returns True on success."""
    if not NOTIFICATIONS_ENABLED:
        logger.info("Notifications disabled — Email skipped")
        return True

    api_key    = os.environ.get("SENDGRID_API_KEY", "")
    from_email = os.environ.get("FROM_EMAIL", "care@postdischarge.health")

    if not api_key:
        logger.warning("SendGrid API key not configured — email skipped")
        return False

    try:
        import sendgrid
        from sendgrid.helpers.mail import Mail
        sg  = sendgrid.SendGridAPIClient(api_key=api_key)
        msg = Mail(
            from_email=from_email,
            to_emails=to_email,
            subject=subject,
            plain_text_content=body,
        )
        sg.send(msg)
        logger.info(f"Email sent to {to_email[:4]}***")
        return True
    except Exception as e:
        logger.error(f"Email failed: {e}")
        return False


# ── Escalation Alert ─────────────────────────────────────────────────────────

def send_escalation_alert(patient_id: str, risk_result: dict) -> None:
    """
    Notify nursing staff when patient is high-risk.
    Called by Layer 3 (Output Guardrails) in checkins.py.

    HIPAA note: Uses patient_id reference only — no PHI in message body.
    Nurse retrieves full patient context via dashboard.
    """
    if not NOTIFICATIONS_ENABLED:
        logger.info("Notifications disabled — escalation alert skipped")
        return

    risk_level = risk_result.get("risk_level", "high")
    reason     = risk_result.get("reason", "High-risk symptoms detected")
    timestamp  = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")

    # Short reference ID for HIPAA compliance (not full patient data)
    ref_id = hashlib.sha256(patient_id.encode()).hexdigest()[:8].upper()

    message = (
        f"⚠️ PATIENT ALERT [{risk_level.upper()}]\n"
        f"Reference: {ref_id}\n"
        f"Time: {timestamp}\n"
        f"Reason: {reason}\n"
        f"Action: Review patient dashboard immediately."
    )

    nurse_phone = os.environ.get("NURSE_ALERT_PHONE", "")
    nurse_email = os.environ.get("NURSE_ALERT_EMAIL", "")

    if nurse_phone:
        send_sms(nurse_phone, message)
    if nurse_email:
        send_email(
            to_email=nurse_email,
            subject=f"[{risk_level.upper()}] Patient Alert — Immediate Review Required",
            body=message,
        )

    logger.info(f"Escalation alert sent | ref={ref_id} | risk={risk_level}")


# ── Medication Reminder ───────────────────────────────────────────────────────

def send_medication_reminder(
    patient_id: str,
    medication_name: str,
    dose: str,
    channel: str = "sms",
    patient_phone: str = "",
    patient_email: str = "",
) -> bool:
    """
    Send medication reminder to patient.
    Called by POST /medications/remind endpoint.
    """
    if not NOTIFICATIONS_ENABLED:
        logger.info("Notifications disabled — medication reminder skipped")
        return True

    message = (
        f"💊 Medication Reminder\n"
        f"Time to take: {medication_name} — {dose}\n"
        f"Questions? Reply HELP or call your care team."
    )

    if channel == "sms" and patient_phone:
        return send_sms(patient_phone, message)

    if channel == "email" and patient_email:
        return send_email(
            to_email=patient_email,
            subject=f"Reminder: {medication_name}",
            body=message,
        )

    # App notification (placeholder — integrate with FCM/APNs)
    if channel == "app":
        logger.info(f"App push notification queued | med={medication_name}")
        return True

    logger.warning(f"No valid channel for reminder: channel={channel}")
    return False