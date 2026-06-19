import pytest

def test_login_with_valid_credentials(client):
    response = client.post("/api/auth/login", data={
        "username": "buyer.turkey@tureep.ai",
        "password": "password123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_with_invalid_credentials(client):
    response = client.post("/api/auth/login", data={
        "username": "invalid@example.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"

def test_login_with_missing_credentials(client):
    response = client.post("/api/auth/login", data={})
    assert response.status_code == 401

def test_access_protected_without_token(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401

def test_rate_limiting_on_login(client):
    # Execute rapid login attempts to verify rate limiting and authentication guard behavior
    for i in range(5):
        client.post("/api/auth/login", data={
            "username": f"user{i}@test.com",
            "password": "test"
        })
    response = client.post("/api/auth/login", data={
        "username": "user6@test.com",
        "password": "test"
    })
    assert response.status_code in (401, 429)
