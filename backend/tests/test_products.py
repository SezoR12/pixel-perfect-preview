import pytest

def test_list_products_paginated(client):
    response = client.get("/api/products/")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert data["page"] == 1


def test_create_product_success(client, seller_headers):
    response = client.post("/api/products/", json={
        "name": "Basra Harvest Medjool",
        "description": "Exquisite Iraqi Medjool dates",
        "category": "dates",
        "price": "2.80",
        "quantity": 100,
        "unit": "ton",
        "origin": "Iraq",
        "location": "Basra Port"
    }, headers=seller_headers)
    assert response.status_code == 201
    assert response.json()["name"] == "Basra Harvest Medjool"


def test_update_product_unauthorized(client, auth_headers):
    # Standard buyer cannot update seller's product
    response = client.put("/api/products/1", json={
        "name": "Hacked Title",
        "category": "dates",
        "price": "1.00",
        "quantity": 50,
        "unit": "ton",
        "origin": "Iraq",
        "location": "Basra"
    }, headers=auth_headers)
    assert response.status_code in (403, 404)
