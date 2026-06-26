"""
Data models for Post-Discharge Patient Care Agent.

Core structures (Week 4 specification):
  - PatientProfile
  - SymptomReport
  - MedicationAdherenceLog
  - EscalationLog
  - DashboardMetrics
"""

from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class PatientProfile(db.Model):
    """Stores patient info, recovery context, preferences."""
    __tablename__ = "patient_profiles"

    patient_id         = db.Column(db.String(36), primary_key=True)
    name               = db.Column(db.String(100), nullable=False)
    age                = db.Column(db.Integer, nullable=False)
    contact_phone      = db.Column(db.String(20))
    contact_email      = db.Column(db.String(120), unique=True, nullable=False)
    password_hash      = db.Column(db.String(256), nullable=False)
    discharge_date     = db.Column(db.Date, nullable=False)
    diagnosis          = db.Column(db.String(200))
    tech_skill_level   = db.Column(db.String(20), default="medium")  # low/medium/high
    checkin_time       = db.Column(db.String(10), default="09:00")    # HH:MM
    reminder_method    = db.Column(db.String(20), default="app")      # sms/email/app
    notification_on    = db.Column(db.Boolean, default=True)
    created_at         = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    symptoms           = db.relationship("SymptomReport",        back_populates="patient", lazy="dynamic")
    medications        = db.relationship("MedicationAdherenceLog", back_populates="patient", lazy="dynamic")
    escalations        = db.relationship("EscalationLog",        back_populates="patient", lazy="dynamic")
    dashboard          = db.relationship("DashboardMetrics",     back_populates="patient", uselist=False)

    def to_dict(self, include_sensitive=False):
        data = {
            "patient_id":       self.patient_id,
            "name":             self.name,
            "age":              self.age,
            "discharge_date":   str(self.discharge_date),
            "diagnosis":        self.diagnosis,
            "checkin_time":     self.checkin_time,
            "reminder_method":  self.reminder_method,
            "notification_on":  self.notification_on,
        }
        if include_sensitive:
            data["contact_email"] = self.contact_email
            data["contact_phone"] = self.contact_phone
        return data


class SymptomReport(db.Model):
    """Daily check-in data collected via AI."""
    __tablename__ = "symptom_reports"

    id               = db.Column(db.Integer, primary_key=True)
    patient_id       = db.Column(db.String(36), db.ForeignKey("patient_profiles.patient_id"), nullable=False)
    report_date      = db.Column(db.Date, default=datetime.utcnow().date)
    report_time      = db.Column(db.DateTime, default=datetime.utcnow)
    symptom_type     = db.Column(db.String(50))   # fever/pain/swelling/mobility/other
    severity         = db.Column(db.Float)         # 0–10 scale
    temperature_f    = db.Column(db.Float)         # Fahrenheit (e.g., 102.0)
    notes            = db.Column(db.Text)
    escalation_flag  = db.Column(db.Boolean, default=False)
    risk_level       = db.Column(db.String(10), default="low")  # low/medium/high

    patient          = db.relationship("PatientProfile", back_populates="symptoms")

    def to_dict(self):
        return {
            "id":              self.id,
            "patient_id":      self.patient_id,
            "report_date":     str(self.report_date),
            "symptom_type":    self.symptom_type,
            "severity":        self.severity,
            "temperature_f":   self.temperature_f,
            "notes":           self.notes,
            "escalation_flag": self.escalation_flag,
            "risk_level":      self.risk_level,
        }


class MedicationAdherenceLog(db.Model):
    """Tracks if patient takes prescribed medications."""
    __tablename__ = "medication_adherence_logs"

    id                = db.Column(db.Integer, primary_key=True)
    patient_id        = db.Column(db.String(36), db.ForeignKey("patient_profiles.patient_id"), nullable=False)
    medication_name   = db.Column(db.String(100), nullable=False)
    dose              = db.Column(db.String(50))
    scheduled_time    = db.Column(db.DateTime, nullable=False)
    actual_time       = db.Column(db.DateTime)
    adherence_status  = db.Column(db.String(20), default="pending")  # taken/missed/pending
    reminder_sent     = db.Column(db.Boolean, default=False)
    reminder_sent_at  = db.Column(db.DateTime)

    patient           = db.relationship("PatientProfile", back_populates="medications")

    def to_dict(self):
        return {
            "id":               self.id,
            "medication_name":  self.medication_name,
            "dose":             self.dose,
            "scheduled_time":   str(self.scheduled_time),
            "actual_time":      str(self.actual_time) if self.actual_time else None,
            "adherence_status": self.adherence_status,
            "reminder_sent":    self.reminder_sent,
        }


class EscalationLog(db.Model):
    """Tracks AI-triggered alerts to nursing staff."""
    __tablename__ = "escalation_logs"

    id               = db.Column(db.Integer, primary_key=True)
    patient_id       = db.Column(db.String(36), db.ForeignKey("patient_profiles.patient_id"), nullable=False)
    triggered_at     = db.Column(db.DateTime, default=datetime.utcnow)
    symptom_report_id= db.Column(db.Integer, db.ForeignKey("symptom_reports.id"))
    risk_level       = db.Column(db.String(10), nullable=False)  # medium/high/critical
    trigger_reason   = db.Column(db.Text)
    nurse_contacted  = db.Column(db.Boolean, default=False)
    nurse_contacted_at = db.Column(db.DateTime)
    resolved         = db.Column(db.Boolean, default=False)
    resolution_notes = db.Column(db.Text)

    patient          = db.relationship("PatientProfile", back_populates="escalations")

    def to_dict(self):
        return {
            "id":                self.id,
            "patient_id":        self.patient_id,
            "triggered_at":      str(self.triggered_at),
            "risk_level":        self.risk_level,
            "trigger_reason":    self.trigger_reason,
            "nurse_contacted":   self.nurse_contacted,
            "resolved":          self.resolved,
        }


class DashboardMetrics(db.Model):
    """Aggregated KPIs for patient & nurse view."""
    __tablename__ = "dashboard_metrics"

    id                    = db.Column(db.Integer, primary_key=True)
    patient_id            = db.Column(db.String(36), db.ForeignKey("patient_profiles.patient_id"), unique=True)
    pain_trend            = db.Column(db.JSON)       # [{date, score}, ...]
    adherence_percentage  = db.Column(db.Float, default=0.0)
    checkins_completed    = db.Column(db.Integer, default=0)
    milestones_completed  = db.Column(db.Integer, default=0)
    high_risk_flags       = db.Column(db.Integer, default=0)
    last_updated          = db.Column(db.DateTime, default=datetime.utcnow)

    patient               = db.relationship("PatientProfile", back_populates="dashboard")

    def to_dict(self):
        return {
            "patient_id":           self.patient_id,
            "pain_trend":           self.pain_trend or [],
            "adherence_percentage": self.adherence_percentage,
            "checkins_completed":   self.checkins_completed,
            "milestones_completed": self.milestones_completed,
            "high_risk_flags":      self.high_risk_flags,
            "last_updated":         str(self.last_updated),
        }
