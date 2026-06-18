from datetime import datetime
from decimal import Decimal
from enum import Enum as PyEnum

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    DECIMAL,
    ForeignKey,
    Integer,
    String,
    Text,
    Enum,
    CheckConstraint,
)
from sqlalchemy.orm import relationship

from app.database import Base


class AccountType(str, PyEnum):
    FREE = "free"
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"
    PLATINUM = "platinum"
    BLACK = "black"


class DealStatus(str, PyEnum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    EXPIRED = "expired"


class OrderStatus(str, PyEnum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class KYCStatus(str, PyEnum):
    PENDING = "pending"
    SUBMITTED = "submitted"
    IN_REVIEW = "in_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXPIRED = "expired"


class OrderStatus(str, PyEnum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PAYMENT_PENDING = "payment_pending"
    PAID = "paid"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    DISPUTED = "disputed"


class PaymentStatus(str, PyEnum):
    PENDING = "pending"
    AUTHORIZED = "authorized"
    HELD = "held"
    CAPTURED = "captured"
    RELEASED = "released"
    FAILED = "failed"
    REFUNDED = "refunded"


class PaymentMethod(str, PyEnum):
    LC = "L/C"
    DP = "D/P"
    ESCROW = "Escrow"
    CARD = "Card"
    BANK_TRANSFER = "Bank Transfer"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    phone = Column(String(20))
    country = Column(String(100), nullable=False)
    account_type = Column(
        Enum(AccountType), default=AccountType.FREE, nullable=False
    )
    is_verified = Column(Boolean, default=False)
    kyc_status = Column(Enum(KYCStatus), default=KYCStatus.PENDING, nullable=False)
    sanctions_screened = Column(Boolean, default=False)
    sanctions_screened_at = Column(DateTime)
    reputation_score = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime)

    products = relationship("Product", back_populates="seller")
    demands = relationship("Demand", back_populates="buyer")
    seller_orders = relationship("Order", foreign_keys="Order.seller_id", back_populates="seller")
    buyer_orders = relationship("Order", foreign_keys="Order.buyer_id", back_populates="buyer")


class MasterAccount(Base):
    __tablename__ = "master_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    level = Column(Enum(AccountType), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
    monthly_price = Column(DECIMAL(10, 2), nullable=False)

    user = relationship("User")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(100), nullable=False, index=True)
    price = Column(DECIMAL(10, 2), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit = Column(String(20), nullable=False)
    origin = Column(String(100), nullable=False)
    location = Column(String(255), nullable=False)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    seller = relationship("User", back_populates="products")
    __table_args__ = (CheckConstraint("quantity >= 0", name="check_quantity"),)


class Demand(Base):
    __tablename__ = "demands"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False, index=True)
    quantity = Column(Integer, nullable=False)
    unit = Column(String(20), nullable=False)
    budget = Column(DECIMAL(10, 2), nullable=False)
    location = Column(String(255), nullable=False)
    urgency = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    buyer = relationship("User", back_populates="demands")
    __table_args__ = (CheckConstraint("quantity >= 0", name="check_demand_quantity"),)


class PreDeal(Base):
    __tablename__ = "pre_deals"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    suggested_price = Column(DECIMAL(10, 2), nullable=False)
    quantity = Column(Integer, nullable=False)
    shipping_cost = Column(DECIMAL(10, 2), default=0)
    payment_terms = Column(String(20), default="Escrow")
    status = Column(Enum(DealStatus), default=DealStatus.PENDING, nullable=False)
    seller_response = Column(String(20), default="pending")
    buyer_response = Column(String(20), default="pending")
    priority_level = Column(Integer, default=0)
    is_exclusive = Column(Boolean, default=False)
    match_score = Column(DECIMAL(5, 2), default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)

    product = relationship("Product")
    seller = relationship("User", foreign_keys=[seller_id])
    buyer = relationship("User", foreign_keys=[buyer_id])


class WaitlistEntry(Base):
    __tablename__ = "waitlist"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    source = Column(String(100), default="landing_page")
    created_at = Column(DateTime, default=datetime.utcnow)


class KYCVerification(Base):
    __tablename__ = "kyc_verifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(Enum(KYCStatus), default=KYCStatus.SUBMITTED, nullable=False)
    document_type = Column(String(50), nullable=False)
    document_url = Column(String(500), nullable=False)
    document_hash = Column(String(64), nullable=False)
    rejection_reason = Column(Text)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime)
    next_review_date = Column(DateTime)
    extra_data = Column(Text)

    user = relationship("User", foreign_keys=[user_id])
    reviewer = relationship("User", foreign_keys=[reviewed_by])


class SanctionsScreening(Base):
    __tablename__ = "sanctions_screenings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    entity_type = Column(String(50), nullable=False)
    entity_name = Column(String(255), nullable=False)
    screened_against = Column(String(50), nullable=False)
    match_found = Column(Boolean, default=False, nullable=False)
    match_details = Column(Text)
    screened_at = Column(DateTime, default=datetime.utcnow)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    review_status = Column(String(20), default="pending")

    user = relationship("User", foreign_keys=[user_id])
    reviewer = relationship("User", foreign_keys=[reviewed_by])


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, nullable=False, index=True)
    pre_deal_id = Column(Integer, ForeignKey("pre_deals.id"), nullable=True)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING, nullable=False)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False)
    payment_method = Column(Enum(PaymentMethod), default=PaymentMethod.ESCROW, nullable=False)
    total_value = Column(DECIMAL(15, 2), nullable=False)
    platform_fee = Column(DECIMAL(15, 2), default=0)
    currency = Column(String(3), nullable=False)
    incoterm = Column(String(10), nullable=False)
    origin_country = Column(String(100), nullable=False)
    destination_country = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime)

    pre_deal = relationship("PreDeal")
    buyer = relationship("User", foreign_keys=[buyer_id])
    seller = relationship("User", foreign_keys=[seller_id])
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit = Column(String(20), nullable=False)
    unit_price = Column(DECIMAL(15, 4), nullable=False)
    total_price = Column(DECIMAL(15, 2), nullable=False)
    currency = Column(String(3), nullable=False)
    fulfillment_status = Column(String(20), default="pending")

    order = relationship("Order", back_populates="items")
    product = relationship("Product")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    payer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    payee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    method = Column(Enum(PaymentMethod), nullable=False)
    amount = Column(DECIMAL(15, 2), nullable=False)
    currency = Column(String(3), nullable=False)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False)
    processor = Column(String(50))
    processor_transaction_id = Column(String(255))
    escrow_release_condition = Column(String(50))
    escrow_released_at = Column(DateTime)
    extra_data = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    order = relationship("Order", back_populates="payments")
    payer = relationship("User", foreign_keys=[payer_id])
    payee = relationship("User", foreign_keys=[payee_id])
