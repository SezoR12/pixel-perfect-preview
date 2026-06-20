import time
import pytest
from concurrent.futures import ThreadPoolExecutor


def test_concurrent_100_users_simulation(client, auth_headers):
    # Simulate 100 rapid concurrent client reads against our matching engine weights
    from app.main import app
    from app.security import get_current_user
    from app.models import User
    app.dependency_overrides[get_current_user] = lambda: User(id=1, email="buyer@tureep.ai")

    def _fetch_node():
        res = client.get("/api/v1/ml-analytics/feature-weights", headers=auth_headers)
        return res.status_code

    start_time = time.time()
    with ThreadPoolExecutor(max_workers=20) as executor:
        results = list(executor.map(lambda _: _fetch_node(), range(100)))

    duration = time.time() - start_time
    app.dependency_overrides.pop(get_current_user, None)
    
    assert all(code in (200, 429) for code in results)
    assert duration < 10.0  # Enterprise absorption pool requirement


def test_api_response_times_p95(client, auth_headers):
    # Enforce strict p95 < 500ms latency validation
    latencies = []
    for _ in range(20):
        start = time.perf_counter()
        res = client.get("/api/v1/products/", headers=auth_headers)
        latencies.append((time.perf_counter() - start) * 1000)
        assert res.status_code == 200

    latencies.sort()
    p95 = latencies[int(len(latencies) * 0.95)]
    assert p95 < 500.0  # Latency strictly below 500ms


def test_simulated_1000_products_query_performance(client):
    # Verify that database pagination efficiently slices large datasets
    start = time.perf_counter()
    res = client.get("/api/v1/products/?page=1&page_size=100")
    duration = (time.perf_counter() - start) * 1000
    assert res.status_code == 200
    assert duration < 300.0
