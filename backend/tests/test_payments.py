import pytest

def test_create_payment_order_not_found(client, auth_headers):
    response = client.post("/api/orders/9999/payments", json={
        "order_id": 9999,
        "method": "Escrow",
        "amount": "1000.00",
        "currency": "USD"
    }, headers=auth_headers)
    assert response.status_code == 404
