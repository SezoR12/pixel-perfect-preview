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
            password_hash=hash_password("password123"),
            name="Basra Dates Co.",
            phone="+9647801234567",
            country="Iraq",
            account_type=AccountType.SILVER,
            is_verified=True,
            reputation_score=78,
        ),
        User(
            email="buyer.turkey@tureep.ai",
            password_hash=hash_password("password123"),
            name="Istanbul Imports Ltd.",
            phone="+905301234567",
            country="Turkey",
            account_type=AccountType.GOLD,
            is_verified=True,
            reputation_score=85,
        ),
        User(
            email="seller.iran@tureep.ai",
            password_hash=hash_password("password123"),
            name="Iran Steel Group",
            phone="+989123456789",
            country="Iran",
            account_type=AccountType.BRONZE,
            is_verified=True,
            reputation_score=65,
        ),
        User(
            email="buyer.global@tureep.ai",
            password_hash=hash_password("password123"),
            name="Global Phosphate Buyers",
            phone="+905309876543",
            country="Turkey",
            account_type=AccountType.PLATINUM,
            is_verified=True,
            reputation_score=92,
        ),
        User(
            email="admin@tureep.ai",
            password_hash=hash_password("password123"),
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

    from app.models import KYCVerification, KYCStatus, SanctionsScreening
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

    db.commit()
    db.close()
    print(f"Seeded {len(users)} users, {len(products)} products, {len(demands)} demands, {len(matches)} pre-deals, {len(kycs)} KYC entries, {len(screenings)} sanctions screenings.")


if __name__ == "__main__":
    seed()
