import pytest

def test_feature_weights_honest_rebranding(client, auth_headers):
    response = client.get("/api/ml-analytics/feature-weights", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["model_version"] == "rule-based-scoring-v1.0"
    assert "heuristic" in data["accuracy_r2"].lower()


def test_price_predictions_cached(client, auth_headers):
    response1 = client.get("/api/ml-analytics/price-predictions", headers=auth_headers)
    assert response1.status_code == 200
    
    # Second hit should hit our custom cache
    response2 = client.get("/api/ml-analytics/price-predictions", headers=auth_headers)
    assert response2.status_code == 200
    assert response1.json() == response2.json()


def test_simulate_matching(client, auth_headers):
    response = client.post("/api/ml-analytics/simulate?crude_oil_price=80.0&freight_risk_index=1.5", headers=auth_headers)
    assert response.status_code == 200
    assert "adjusted_match_score" in response.json()
