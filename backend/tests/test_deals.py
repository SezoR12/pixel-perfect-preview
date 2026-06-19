import pytest

def test_run_matching_endpoint(client, auth_headers):
    response = client.post("/api/deals/match", json={"product_id": 1}, headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_generate_pre_deals_endpoint(client, auth_headers):
    response = client.post("/api/deals/generate-pre-deals", json={}, headers=auth_headers)
    assert response.status_code == 200
    assert "created_pre_deal_ids" in response.json()


def test_list_pre_deals_unauthorized_without_token(client):
    response = client.get("/api/deals/pre-deals")
    assert response.status_code == 401
