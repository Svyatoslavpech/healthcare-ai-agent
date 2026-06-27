"""
Integration tests for IBM watsonx.ai integration.
Uses `responses` library to mock external API calls.
HIPAA compliance validated: no PII sent to mock API.
"""

import pytest
import json
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../src/backend"))

try:
    import responses as responses_lib
    HAS_RESPONSES = True
except ImportError:
    HAS_RESPONSES = False

from services.watsonx_ai import evaluate_symptom_risk


pytestmark = pytest.mark.skipif(
    not HAS_RESPONSES, reason="responses library not installed"
)


# ── Fixtures ─────────────────────────────────────────────────────────────────

@pytest.fixture
def mock_watsonx_api():
    """Mock IBM watsonx.ai API responses."""
    with responses_lib.RequestsMock() as rsps:
        rsps.add(
            responses_lib.POST,
            "https://iam.cloud.ibm.com/identity/token",
            json={"access_token": "mock-iam-token", "expires_in": 3600},
            status=200,
        )
        rsps.add(
            responses_lib.POST,
            "https://us-south.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29",
            json={
                "results": [{
                    "generated_text": '{"risk_level": "high", "escalation_flag": true, "reason": "Severe symptoms detected", "recommendation": "Nurse notified"}'
                }]
            },
            status=200,
        )
        yield rsps


# ── Tests ─────────────────────────────────────────────────────────────────────

class TestWatsonxIntegration:

    def test_low_severity_no_llm_call(self, mock_watsonx_api):
        """LLM should be bypassed for low severity — cost optimization."""
        result = evaluate_symptom_risk({
            "symptom_type": "pain",
            "severity": 1.0,
            "notes": "",
            "patient_id": "test-001",
        })
        assert result["risk_level"] == "low"
        assert result["escalation_flag"] is False
        assert len(mock_watsonx_api.calls) == 0

    def test_red_flag_triggers_before_llm(self, mock_watsonx_api):
        """Red-flag keywords should escalate without LLM call."""
        result = evaluate_symptom_risk({
            "symptom_type": "pain",
            "severity": 3.0,
            "notes": "chest pain and dizziness",
            "patient_id": "test-002",
        })
        assert result["risk_level"] == "high"
        assert result["escalation_flag"] is True
        assert len(mock_watsonx_api.calls) == 0

    def test_critical_threshold_no_llm(self, mock_watsonx_api):
        """Critical thresholds should bypass LLM entirely."""
        result = evaluate_symptom_risk({
            "symptom_type": "fever",
            "severity": 5.0,
            "temperature_f": 104.5,
            "notes": "",
            "patient_id": "test-003",
        })
        assert result["risk_level"] == "critical"
        assert result["escalation_flag"] is True
        assert len(mock_watsonx_api.calls) == 0

    def test_pii_not_sent_to_llm(self, mock_watsonx_api):
        """HIPAA compliance: patient_id must not appear in LLM request."""
        evaluate_symptom_risk({
            "symptom_type": "pain",
            "severity": 5.0,
            "notes": "moderate pain in leg",
            "patient_id": "sensitive-patient-id-12345",
        })
        for call in mock_watsonx_api.calls:
            if "ml.cloud.ibm.com" in call.request.url:
                body = json.loads(call.request.body)
                input_text = body.get("input", "")
                assert "sensitive-patient-id-12345" not in input_text

    def test_llm_fallback_on_500_error(self, mock_watsonx_api):
        """Should fall back gracefully if LLM returns 500."""
        mock_watsonx_api.replace(
            responses_lib.POST,
            "https://us-south.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29",
            status=500,
        )
        result = evaluate_symptom_risk({
            "symptom_type": "pain",
            "severity": 5.0,
            "notes": "moderate pain",
            "patient_id": "test-004",
        })
        assert "risk_level" in result
        assert result["risk_level"] in ("low", "medium", "high")

    def test_llm_output_validation_guardrails(self, mock_watsonx_api):
        """Should sanitize invalid LLM output to safe defaults."""
        mock_watsonx_api.replace(
            responses_lib.POST,
            "https://us-south.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29",
            json={"results": [{"generated_text": '{"risk_level": "INVALID_VALUE"}'}]},
            status=200,
        )
        result = evaluate_symptom_risk({
            "symptom_type": "pain",
            "severity": 4.0,
            "notes": "some pain",
            "patient_id": "test-005",
        })
        assert result["risk_level"] in ("low", "medium", "high", "critical")

    def test_markdown_response_parsed_correctly(self, mock_watsonx_api):
        """Should strip markdown code fences from LLM response."""
        mock_watsonx_api.replace(
            responses_lib.POST,
            "https://us-south.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29",
            json={"results": [{"generated_text": '```json\n{"risk_level": "medium", "escalation_flag": false, "reason": "moderate", "recommendation": "rest"}\n```'}]},
            status=200,
        )
        result = evaluate_symptom_risk({
            "symptom_type": "fever",
            "severity": 4.0,
            "notes": "mild fever",
            "patient_id": "test-006",
        })
        assert result["risk_level"] == "medium"
        assert result["escalation_flag"] is False
