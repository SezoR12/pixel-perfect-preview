import pytest


def test_jwt_tampering_rejection(client):
    tampered_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZXhwIjoxNzgxODY5NTA0fQ.INVALID_SIGNATURE_HASH_TAMPERED"
    res = client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {tampered_token}"})
    assert res.status_code == 401


def test_csrf_protection_headers(client):
    res = client.post("/api/v1/auth/login", data={})
    assert "frame-ancestors" in res.headers.get("Content-Security-Policy", "")
    assert res.headers.get("X-Content-Type-Options") == "nosniff"


def test_file_upload_vulnerability_sanitization(client, auth_headers):
    malicious_url = "javascript:alert('file_hacked')"
    res = client.post("/api/v1/kyc/submit", json={
        "document_type": "passport",
        "document_url": malicious_url,
        "document_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    }, headers=auth_headers)
    assert res.status_code in (400, 422)


def test_authentication_bypass_rejection(client):
    res = client.post("/api/v1/auth/login", data={
        "username": "buyer.turkey@tureep.ai",
        "password": "' OR '1'='1"
    })
    assert res.status_code == 401


def test_authorization_bypass_rejection(client, auth_headers):
    # Standard buyer attempting to access compliance admin screening pools
    res = client.get("/api/v1/kyc/pending", headers=auth_headers)
    assert res.status_code in (403, 404)
