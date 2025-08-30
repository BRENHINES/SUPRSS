# backend/tests/test_health.py
from fastapi.testclient import TestClient


def test_health_ok(monkeypatch):

    monkeypatch.setenv(
        "DATABASE_URL",
        "postgresql+psycopg2://suprss_admin:Medium_password@suprss-db.postgres.database.azure.com:5432/suprss",
    )

    from backend.app.main import app

    client = TestClient(app)
    r = client.get("/health")
    assert r.status_code == 200
    assert "Database connected" in r.json()["status"]
