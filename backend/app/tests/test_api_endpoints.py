"""
SwaraGPT - FastAPI Endpoints & Integration Tests
Uses TestClient with application lifespan context to verify all REST routes.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture(scope="module")
def client():
    """Initializes FastAPI application with startup lifespan events."""
    with TestClient(app) as test_client:
        yield test_client


def test_health_check(client):
    """Verify /health and /api/health returns healthy status."""
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["service"] == "SwaraGPT"


def test_22_shrutis_api(client):
    """Verify GET /api/analysis/shrutis returns 22 microtonal records."""
    res = client.get("/api/analysis/shrutis")
    assert res.status_code == 200
    shrutis = res.json()
    assert len(shrutis) == 22


def test_ragas_catalog_api(client):
    """Verify GET /api/ragas lists ragas with filters."""
    res = client.get("/api/ragas")
    assert res.status_code == 200
    ragas = res.json()
    assert len(ragas) >= 5
    assert any(r["name"] == "Yaman" for r in ragas)

    # Search filter
    search_res = client.get("/api/ragas?q=Bhairav")
    assert search_res.status_code == 200
    assert any("Bhairav" in r["name"] for r in search_res.json())


def test_practice_recommendations_api(client):
    """Verify GET /api/practice/recommendations yields structured Riyaz plan."""
    res = client.get("/api/practice/recommendations")
    assert res.status_code == 200
    plan = res.json()
    assert "practice_steps" in plan
    assert len(plan["practice_steps"]) == 4


def test_full_analysis_synthetic_fallback(client):
    """Verify POST /api/analysis/full returns complete MIR diagnostic report."""
    res = client.post(
        "/api/analysis/full",
        data={"target_raga": "Yaman", "user_sa_hz": 130.81}
    )
    assert res.status_code == 200
    data = res.json()
    assert "session_id" in data
    assert "score" in data
    assert "pitch_contour" in data
    assert "swara_timeline" in data
    assert "feedback_text" in data
    assert data["score"]["overall_score"] > 50.0


def test_chat_with_virtual_guru(client):
    """Verify POST /api/chat provides grounded response."""
    res = client.post(
        "/api/chat",
        json={"message": "What is the pakad of Raga Yaman?"}
    )
    assert res.status_code == 200
    chat_data = res.json()
    assert "content" in chat_data
    assert "Yaman" in chat_data["content"]
    assert "citations" in chat_data
