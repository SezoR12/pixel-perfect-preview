import pytest


def test_full_user_journey_end_to_end(client, auth_headers):
    # 1. Inspect Products
    prod_res = client.get("/api/v1/products/")
    assert prod_res.status_code == 200
    
    # 2. Inspect active pre-deals
    deals_res = client.get("/api/v1/deals/pre-deals", headers=auth_headers)
    assert deals_res.status_code == 200
    
    # 3. Simulate deal match generation
    match_res = client.post("/api/v1/deals/generate-pre-deals", json={}, headers=auth_headers)
    assert match_res.status_code == 200


def test_kyc_submission_and_review_flow(client, admin_headers):
    # 1. Admin lists pending KYC
    pending = client.get("/api/v1/kyc/pending", headers=admin_headers)
    assert pending.status_code == 200
    assert isinstance(pending.json(), list)


def test_sanctions_screening_flow(client, auth_headers):
    # 1. Screen safe user
    safe_res = client.post("/api/v1/compliance/sanctions/screen", json={
        "entity_name": "Basra Dates Exporters",
        "entity_type": "company"
    }, headers=auth_headers)
    assert safe_res.status_code == 200
    assert safe_res.json()["match_found"] is False


def test_subscription_upgrade_flow(client, auth_headers):
    upg_res = client.post("/api/v1/billing/create-checkout-session", json={
        "tier": "platinum"
    }, headers=auth_headers)
    assert upg_res.status_code == 200
    assert upg_res.json()["tier"] == "platinum"


def test_trade_finance_lc_and_dp_flow(client, auth_headers):
    lc_res = client.get("/api/v1/trade-finance/lc", headers=auth_headers)
    assert lc_res.status_code == 200
    
    dp_res = client.get("/api/v1/trade-finance/dp", headers=auth_headers)
    assert dp_res.status_code == 200
