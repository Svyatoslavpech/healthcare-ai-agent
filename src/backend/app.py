"""
Post-Discharge Patient Care Agent — Backend API
IBM AI Experiential Learning Lab 2025 | Spiritual Techies
"""

from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import Config
from models.patient import db
from routes.auth import auth_bp
from routes.patients import patients_bp
from routes.checkins import checkins_bp
from routes.medications import medications_bp
from routes.alerts import alerts_bp
from routes.dashboard import dashboard_bp
from services.mlflow_logger import init_mlflow


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Extensions
    db.init_app(app)
    CORS(app)
    JWTManager(app)

    # Blueprints
    app.register_blueprint(auth_bp,        url_prefix="/auth")
    app.register_blueprint(patients_bp,    url_prefix="/patients")
    app.register_blueprint(checkins_bp,    url_prefix="/checkins")
    app.register_blueprint(medications_bp, url_prefix="/medications")
    app.register_blueprint(alerts_bp,      url_prefix="/alerts")
    app.register_blueprint(dashboard_bp,   url_prefix="/dashboard")

    # Watsonx webhook
    from routes.webhook import webhook_bp
    app.register_blueprint(webhook_bp, url_prefix="/webhook")

    @app.route("/health")
    def health():
        return jsonify({"status": "ok", "agent": "PostDischargePatient_CareAgent"})

    with app.app_context():
        db.create_all()
        init_mlflow()

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=False)
