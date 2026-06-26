"""Configuration for Post-Discharge Patient Care Agent backend."""

import os
from datetime import timedelta


class Config:
    # Flask
    SECRET_KEY = os.environ.get("SECRET_KEY", "change-me-in-production")
    DEBUG = os.environ.get("FLASK_DEBUG", "false").lower() == "true"

    # Database
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/postdischarge"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "jwt-secret-change-me")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    # IBM watsonx.ai
    WATSONX_API_KEY    = os.environ.get("WATSONX_API_KEY", "")
    WATSONX_PROJECT_ID = os.environ.get("WATSONX_PROJECT_ID", "956f2ec4-dc14-4a45-8146-baa650cea97e")
    WATSONX_URL        = os.environ.get("WATSONX_URL", "https://us-south.ml.cloud.ibm.com")
    WATSONX_MODEL_ID   = os.environ.get("WATSONX_MODEL_ID", "ibm/granite-3-3-8b-instruct")

    # IBM watsonx Orchestrate
    ORCHESTRATE_AGENT_ID = os.environ.get(
        "ORCHESTRATE_AGENT_ID", "2828b79e-8ed4-474a-bff4-b4c5d7d455c1"
    )
    ORCHESTRATE_URL = os.environ.get(
        "ORCHESTRATE_URL", "https://au-syd.watson-orchestrate.cloud.ibm.com"
    )

    # MLflow
    MLFLOW_TRACKING_URI  = os.environ.get("MLFLOW_TRACKING_URI", "http://localhost:5001")
    MLFLOW_EXPERIMENT    = os.environ.get("MLFLOW_EXPERIMENT", "postdischarge-care-agent")

    # Escalation thresholds
    PAIN_ESCALATION_THRESHOLD = int(os.environ.get("PAIN_ESCALATION_THRESHOLD", "7"))
    FEVER_ESCALATION_THRESHOLD = float(os.environ.get("FEVER_ESCALATION_THRESHOLD", "101.5"))

    # Notifications (Twilio)
    TWILIO_ACCOUNT_SID  = os.environ.get("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN   = os.environ.get("TWILIO_AUTH_TOKEN", "")
    TWILIO_PHONE_NUMBER = os.environ.get("TWILIO_PHONE_NUMBER", "")

    # SendGrid
    SENDGRID_API_KEY = os.environ.get("SENDGRID_API_KEY", "")
    FROM_EMAIL       = os.environ.get("FROM_EMAIL", "care@postdischarge.health")
