import pytest

def test_list_orders_paginated(client, auth_headers):
    response = client.get("/api/orders/", headers=auth_headers)
    assert response.status_code == 200
    assert "items" in response.json()


def test_get_order_not_found(client, auth_headers):
    response = client.get("/api/orders/9999", headers=auth_headers)
    assert response.status_code == 404
