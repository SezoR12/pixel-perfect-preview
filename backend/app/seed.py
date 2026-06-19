"""Seed script to populate initial demo data for Tureep AI+ MVP."""
import sys
from datetime import datetime, timedelta
from decimal import Decimal

from sqlalchemy.orm import Session

from app.database import SessionLocal, engine, Base
from app.models import User, AccountType, Product, Demand, PreDeal
from app.security import hash_password


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear old data for idempotent seeding
    db.query(PreDeal).delete()
    db.query(Demand).delete()
    db.query(Product).delete()
    db.query(User).delete()
    db.commit()

    users = [
        User(
            email="seller.iraq@tureep.ai",
            password_hash=hash_password("Tureep*Auth#2026!xKey"),
            name="Basra Dates Co.",
            phone="+9647801234567",
            country="Iraq",
            account_type=AccountType.SILVER,
            is_verified=True,
            reputation_score=78,
        ),
        User(
            email="buyer.turkey@tureep.ai",
            password_hash=hash_password("Tureep*Auth#2026!xKey"),
            name="Istanbul Imports Ltd.",
            phone="+905301234567",
            country="Turkey",
            account_type=AccountType.GOLD,
            is_verified=True,
            reputation_score=85,
        ),
        User(
            email="seller.iran@tureep.ai",
            password_hash=hash_password("Tureep*Auth#2026!xKey"),
            name="Iran Steel Group",
            phone="+989123456789",
            country="Iran",
            account_type=AccountType.BRONZE,
            is_verified=True,
            reputation_score=65,
        ),
        User(
            email="buyer.global@tureep.ai",
            password_hash=hash_password("Tureep*Auth#2026!xKey"),
            name="Global Phosphate Buyers",
            phone="+905309876543",
            country="Turkey",
            account_type=AccountType.PLATINUM,
            is_verified=True,
            reputation_score=92,
        ),
        User(
            email="admin@tureep.ai",
            password_hash=hash_password("Tureep*Auth#2026!xKey"),
            name="Tureep Compliance Admin",
            phone="+905300000000",
            country="Turkey",
            account_type=AccountType.BLACK,
            is_verified=True,
            reputation_score=100,
        ),
    ]
    db.add_all(users)
    db.commit()
    for u in users:
        db.refresh(u)

    products = [
        Product(
            user_id=users[0].id,
            name="Premium Iraqi Dates",
            description="Medjool dates from Basra farms, grade A.",
            category="dates",
            price=Decimal("2.50"),
            quantity=500,
            unit="ton",
            origin="Iraq",
            location="Basra, Iraq",
            is_available=True,
        ),
        Product(
            user_id=users[2].id,
            name="HMS 1/2 Steel Scrap",
            description="Heavy melting steel scrap, 80:20 mix.",
            category="steel_scrap",
            price=Decimal("380.00"),
            quantity=200,
            unit="ton",
            origin="Iran",
            location="Bandar Abbas, Iran",
            is_available=True,
        ),
        Product(
            user_id=users[0].id,
            name="Rock Phosphate 30% P2O5",
            description="High-grade phosphate for fertilizer production.",
            category="phosphate",
            price=Decimal("180.00"),
            quantity=1000,
            unit="ton",
            origin="Iraq",
            location="Baghdad, Iraq",
            is_available=True,
        ),
    ]
    db.add_all(products)
    db.commit()
    for p in products:
        db.refresh(p)

    demands = [
        Demand(
            user_id=users[1].id,
            product_name="Iraqi Dates Bulk",
            category="dates",
            quantity=300,
            unit="ton",
            budget=Decimal("2.80"),
            location="Istanbul, Turkey",
            urgency=2,
            is_active=True,
        ),
        Demand(
            user_id=users[1].id,
            product_name="Steel Scrap for Rebar",
            category="steel_scrap",
            quantity=150,
            unit="ton",
            budget=Decimal("400.00"),
            location="Mersin, Turkey",
            urgency=3,
            is_active=True,
        ),
        Demand(
            user_id=users[3].id,
            product_name="Phosphate Fertilizer Raw",
            category="phosphate",
            quantity=800,
            unit="ton",
            budget=Decimal("200.00"),
            location="Izmir, Turkey",
            urgency=1,
            is_active=True,
        ),
    ]
    db.add_all(demands)
    db.commit()

    from app.ai.matching import find_matches, create_pre_deal_from_match

    matches = find_matches(db, min_score=60.0)
    for match in matches:
        create_pre_deal_from_match(db, match)

    from app.models import (
        KYCVerification,
        KYCStatus,
        SanctionsScreening,
        Notification,
        NotificationType,
        NotificationPriority,
        Subscription,
        SubscriptionStatus,
        LetterOfCredit,
        DocumentaryCollection,
        LCStatus,
        DPStatus,
        Shipment,
        ShipmentEvent,
        ShipmentStatus,
        Order,
        OrderItem,
    )
    kycs = [
        KYCVerification(
            user_id=users[2].id, # seller.iran
            status=KYCStatus.SUBMITTED,
            document_type="passport",
            document_url="https://s3.tureep.ai/kyc/iran_seller_passport.pdf",
            document_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            next_review_date=datetime.utcnow() + timedelta(days=365),
        ),
        KYCVerification(
            user_id=users[3].id, # buyer.global
            status=KYCStatus.SUBMITTED,
            document_type="business_license",
            document_url="https://s3.tureep.ai/kyc/buyer_global_license.pdf",
            document_hash="8f9c044298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            next_review_date=datetime.utcnow() + timedelta(days=365),
        ),
    ]
    db.add_all(kycs)

    screenings = [
        SanctionsScreening(
            user_id=users[2].id,
            entity_type="company",
            entity_name="IRAN OIL COMPANY",
            screened_against="demo_sanctions_list",
            match_found=True,
            match_details="Matched against demo sanctions list: IRAN OIL COMPANY",
            review_status="pending",
        ),
        SanctionsScreening(
            user_id=users[0].id,
            entity_type="company",
            entity_name="Basra Dates Co.",
            screened_against="demo_sanctions_list",
            match_found=False,
            match_details="No match found",
            review_status="cleared",
        )
    ]
    db.add_all(screenings)

    # 1. Orders
    o1 = Order(
        order_number="TUR-2026-000001",
        buyer_id=users[1].id,
        seller_id=users[0].id,
        status="confirmed",
        payment_status="held",
        payment_method="L/C",
        total_value=Decimal("7500.00"),
        platform_fee=Decimal("22.50"),
        currency="USD",
        incoterm="FOB",
        origin_country="Iraq",
        destination_country="Turkey",
    )
    db.add(o1)
    db.commit()
    db.refresh(o1)

    # 2. L/C & D/P
    lc1 = LetterOfCredit(
        lc_number="LC-SWIFT-2026-00001",
        order_id=o1.id,
        applicant_id=users[1].id,
        beneficiary_id=users[0].id,
        issuing_bank="Garanti BBVA Istanbul",
        advising_bank="Trade Bank of Iraq (TBI)",
        amount=Decimal("7500.00"),
        currency="USD",
        expiry_date=datetime.utcnow() + timedelta(days=90),
        status=LCStatus.ADVISED,
    )
    db.add(lc1)

    dp1 = DocumentaryCollection(
        dp_number="DP-COLLECT-2026-00001",
        order_id=o1.id,
        exporter_id=users[2].id,
        importer_id=users[1].id,
        remitting_bank="Bank Pasargad",
        collecting_bank="Isbank Turkey",
        amount=Decimal("3800.00"),
        currency="USD",
        status=DPStatus.PRESENTED_TO_IMPORTER,
    )
    db.add(dp1)

    # 3. Shipments
    sh1 = Shipment(
        order_id=o1.id,
        tracking_number="TRK-DHL-2026-889102",
        carrier="DHL Global Forwarding",
        origin_corridor="Basra Port, Iraq",
        destination_corridor="Mersin Free Zone, Turkey",
        status=ShipmentStatus.IN_TRANSIT,
        estimated_delivery=datetime.utcnow() + timedelta(days=5),
    )
    db.add(sh1)
    db.commit()
    db.refresh(sh1)

    ev1 = ShipmentEvent(
        shipment_id=sh1.id,
        location="Customs Clearing Export Node — Umm Qasr Port",
        description="Container passed phytosanitary inspection. Export tariff locked under Iraq-Turkey FTA.",
    )
    ev2 = ShipmentEvent(
        shipment_id=sh1.id,
        location="Maritime GPS Waypoint — Persian Gulf / Mediterranean Route",
        description="Vessel securely underway. Estimated steaming speed: 18.5 knots.",
    )
    db.add_all([ev1, ev2])

    # 4. Notifications
    n1 = Notification(
        user_id=users[1].id, # buyer.turkey
        title="SWIFT MT700 L/C Issued",
        message="Your Letter of Credit #LC-SWIFT-2026-00001 has been successfully transmitted by Garanti BBVA.",
        type=NotificationType.PUSH,
        priority=NotificationPriority.HIGH,
    )
    n2 = Notification(
        user_id=users[1].id,
        title="ML Market Alert — Dates Price Prediction",
        message="Our AI models predict an 7.2% price surge in Iraqi Medjool dates over the next 30 days due to harvest yield factors.",
        type=NotificationType.IN_APP,
        priority=NotificationPriority.MEDIUM,
    )
    db.add_all([n1, n2])

    # 5. Subscriptions
    su1 = Subscription(
        user_id=users[1].id,
        stripe_customer_id="cus_turkey_buyer_99",
        stripe_subscription_id="sub_gold_tier_2026",
        tier=AccountType.GOLD,
        status=SubscriptionStatus.ACTIVE,
        current_period_end=datetime.utcnow() + timedelta(days=28),
    )
    db.add(su1)

    db.commit()
    db.close()
    print(f"Seeded {len(users)} users, {len(products)} products, {len(demands)} demands, {len(matches)} pre-deals, {len(kycs)} KYC entries, {len(screenings)} sanctions screenings, 1 Order, 1 L/C, 1 D/P, 1 Shipment, 2 Notifications, 1 Subscription.")


if __name__ == "__main__":
    seed()
