from decimal import Decimal, ROUND_HALF_UP
from typing import List, Optional

from sqlalchemy.orm import Session

from app.models import Product, Demand, User, AccountType, PreDeal


TIER_DELAY_HOURS = {
    AccountType.FREE: 120,
    AccountType.BRONZE: 96,
    AccountType.SILVER: 72,
    AccountType.GOLD: 48,
    AccountType.PLATINUM: 24,
    AccountType.BLACK: 0,
}


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    import math

    R = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = (
        math.sin(dphi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


CITY_COORDS = {
    "basra": (30.5156, 47.7804),
    "baghdad": (33.3152, 44.3661),
    "erbil": (36.1911, 44.0092),
    "istanbul": (41.0082, 28.9784),
    "izmir": (38.4192, 27.1287),
    "mersin": (36.8121, 34.6415),
    "tehran": (35.6892, 51.3890),
    "bandar abbas": (27.1833, 56.2666),
}


def _location_distance_km(loc1: str, loc2: str) -> float:
    key1 = loc1.lower().split(",")[0].strip()
    key2 = loc2.lower().split(",")[0].strip()
    c1 = CITY_COORDS.get(key1)
    c2 = CITY_COORDS.get(key2)
    if c1 and c2:
        return _haversine_km(c1[0], c1[1], c2[0], c2[1])
    return 1500.0


def _estimate_shipping_cost(distance_km: float, quantity: int, unit: str) -> Decimal:
    base = 0.0
    if unit.lower() in ("ton", "tons", "tonne"):
        base = distance_km * 0.05 * quantity
    elif unit.lower() in ("kg", "kgs"):
        base = distance_km * 0.00005 * quantity
    elif unit.lower() in ("m2", "sqm", "square meter"):
        base = distance_km * 0.02 * quantity
    else:
        base = distance_km * 0.03 * quantity
    return Decimal(str(round(base, 2)))


def _payment_terms_by_value(value: Decimal) -> str:
    if value >= 50_000:
        return "L/C"
    if value >= 10_000:
        return "D/P"
    return "Escrow"


def compute_match_score(
    product: Product,
    demand: Demand,
    seller: User,
    buyer: User,
) -> Decimal:
    price_diff_pct = abs(float(product.price) - float(demand.budget)) / max(float(demand.budget), 1.0) * 100
    price_score = max(0, 100 - price_diff_pct * 5)  # tighter price alignment = higher score

    distance_km = _location_distance_km(product.location, demand.location)
    distance_score = max(0, 100 - distance_km / 50)  # shorter distance = higher score

    rep_score = (seller.reputation_score + buyer.reputation_score) / 2
    rep_score = min(100, rep_score)

    urgency_score = demand.urgency * 25  # 1=25, 2=50, 3=75

    category_match = 100 if product.category.lower() == demand.category.lower() else 0

    # Weighted total (out of 100)
    raw = (
        price_score * 0.35
        + distance_score * 0.20
        + rep_score * 0.20
        + urgency_score * 0.10
        + category_match * 0.15
    )
    score = Decimal(str(min(100, max(0, raw)))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return score


def find_matches(
    db: Session,
    product_id: Optional[int] = None,
    demand_id: Optional[int] = None,
    min_score: float = 60.0,
) -> List[dict]:
    products = []
    demands = []

    if product_id:
        products = db.query(Product).filter(Product.id == product_id, Product.is_available == True).all()
    else:
        products = db.query(Product).filter(Product.is_available == True).all()

    if demand_id:
        demands = db.query(Demand).filter(Demand.id == demand_id, Demand.is_active == True).all()
    else:
        demands = db.query(Demand).filter(Demand.is_active == True).all()

    matches = []
    for product in products:
        for demand in demands:
            if product.user_id == demand.user_id:
                continue
            if product.category.lower() != demand.category.lower():
                continue

            score = compute_match_score(product, demand, product.seller, demand.buyer)
            if score < min_score:
                continue

            qty = min(product.quantity, demand.quantity)
            suggested_price = (product.price + demand.budget) / 2
            distance_km = _location_distance_km(product.location, demand.location)
            shipping_cost = _estimate_shipping_cost(distance_km, qty, product.unit)
            value = suggested_price * qty

            priority = 0
            if value >= 100_000:
                priority = 5
            elif value >= 50_000:
                priority = 4
            elif value >= 20_000:
                priority = 3
            elif value >= 10_000:
                priority = 2
            elif value >= 5_000:
                priority = 1

            exclusive = value >= 50_000
            payment_terms = _payment_terms_by_value(value)

            matches.append(
                {
                    "product_id": product.id,
                    "demand_id": demand.id,
                    "seller_id": product.user_id,
                    "buyer_id": demand.user_id,
                    "match_score": score,
                    "suggested_price": suggested_price,
                    "quantity": qty,
                    "shipping_cost": shipping_cost,
                    "priority_level": priority,
                    "is_exclusive": exclusive,
                    "payment_terms": payment_terms,
                    "distance_km": round(distance_km, 1),
                }
            )

    matches.sort(key=lambda m: m["match_score"], reverse=True)
    return matches


def create_pre_deal_from_match(db: Session, match: dict) -> PreDeal:
    from datetime import datetime, timedelta

    existing = (
        db.query(PreDeal)
        .filter(
            PreDeal.product_id == match["product_id"],
            PreDeal.buyer_id == match["buyer_id"],
            PreDeal.status.in_(["pending", "accepted"]),
        )
        .first()
    )
    if existing:
        return existing

    pre_deal = PreDeal(
        product_id=match["product_id"],
        seller_id=match["seller_id"],
        buyer_id=match["buyer_id"],
        suggested_price=match["suggested_price"],
        quantity=match["quantity"],
        shipping_cost=match["shipping_cost"],
        payment_terms=match["payment_terms"],
        priority_level=match["priority_level"],
        is_exclusive=match["is_exclusive"],
        match_score=match["match_score"],
        expires_at=datetime.utcnow() + timedelta(hours=48),
    )
    db.add(pre_deal)
    db.commit()
    db.refresh(pre_deal)
    return pre_deal
