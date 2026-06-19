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
    Index,
    UniqueConstraint,
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


class NotificationType(str, PyEnum):
    IN_APP = "in_app"
    EMAIL = "email"
    PUSH = "push"
    SMS = "sms"


class NotificationPriority(str, PyEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class SubscriptionStatus(str, PyEnum):
    ACTIVE = "active"
    PAST_DUE = "past_due"
    CANCELED = "canceled"
    TRIALING = "trialing"


class LCStatus(str, PyEnum):
    DRAFT = "draft"
    ISSUED = "issued"
    ADVISED = "advised"
    DOCUMENTS_PRESENTED = "documents_presented"
    DISCREPANCIES = "discrepancies"
    CLEAN_PRESENTATION = "clean_presentation"
    SETTLED = "settled"
    CANCELLED = "cancelled"


class DPStatus(str, PyEnum):
    DRAFT = "draft"
    SENT_TO_COLLECTING_BANK = "sent_to_collecting_bank"
    PRESENTED_TO_IMPORTER = "presented_to_importer"
    PAID = "paid"
    DOCUMENTS_RELEASED = "documents_released"
    REJECTED = "rejected"


class ShipmentStatus(str, PyEnum):
    LABEL_CREATED = "label_created"
    PICKED_UP = "picked_up"
    CUSTOMS_EXPORT = "customs_export"
    IN_TRANSIT = "in_transit"
    CUSTOMS_IMPORT = "customs_import"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"
    EXCEPTION = "exception"


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
    
    __table_args__ = (
        Index("idx_user_email_account", "email", "account_type"),
    )


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
    __table_args__ = (CheckConstraint("monthly_price >= 0", name="check_master_price"),)


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
    
    __table_args__ = (
        CheckConstraint("quantity >= 0", name="check_product_quantity"),
        CheckConstraint("price > 0", name="check_product_price"),
        Index("idx_product_category", "category"),
        Index("idx_product_user_id", "user_id"),
        Index("idx_product_available", "is_available"),
        Index("idx_product_created", "created_at"),
    )


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
    
    __table_args__ = (
        CheckConstraint("quantity >= 0", name="check_demand_quantity"),
        CheckConstraint("budget > 0", name="check_demand_budget"),
    )


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
    
    __table_args__ = (
        CheckConstraint("quantity > 0", name="check_pre_deal_quantity"),
        CheckConstraint("suggested_price > 0", name="check_pre_deal_price"),
        Index("idx_pre_deal_composite", "seller_id", "buyer_id", "status", "match_score"),
    )


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
    
    __table_args__ = (
        Index("idx_kyc_user_status", "user_id", "status"),
    )


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
    
    __table_args__ = (
        CheckConstraint("total_value > 0", name="check_order_total"),
        Index("idx_order_composite_5", "buyer_id", "seller_id", "status", "payment_status", "created_at"),
    )


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
    
    __table_args__ = (
        CheckConstraint("quantity > 0", name="check_order_item_quantity"),
        CheckConstraint("unit_price > 0", name="check_order_item_price"),
    )


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
    
    __table_args__ = (
        CheckConstraint("amount > 0", name="check_payment_amount"),
    )


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(Enum(NotificationType), default=NotificationType.IN_APP, nullable=False)
    priority = Column(Enum(NotificationPriority), default=NotificationPriority.MEDIUM, nullable=False)
    read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    stripe_customer_id = Column(String(100), nullable=False)
    stripe_subscription_id = Column(String(100), nullable=False)
    tier = Column(Enum(AccountType), nullable=False)
    status = Column(Enum(SubscriptionStatus), default=SubscriptionStatus.ACTIVE, nullable=False)
    current_period_end = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")


class LetterOfCredit(Base):
    __tablename__ = "letters_of_credit"

    id = Column(Integer, primary_key=True, index=True)
    lc_number = Column(String(100), unique=True, nullable=False, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    applicant_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    beneficiary_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    issuing_bank = Column(String(255), nullable=False)
    advising_bank = Column(String(255), nullable=False)
    amount = Column(DECIMAL(15, 2), nullable=False)
    currency = Column(String(3), nullable=False)
    expiry_date = Column(DateTime, nullable=False)
    status = Column(Enum(LCStatus), default=LCStatus.DRAFT, nullable=False)
    discrepancy_notes = Column(Text)
    documents_presented_at = Column(DateTime)
    settled_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    order = relationship("Order")
    applicant = relationship("User", foreign_keys=[applicant_id])
    beneficiary = relationship("User", foreign_keys=[beneficiary_id])
    
    __table_args__ = (
        CheckConstraint("amount > 0", name="check_lc_amount"),
    )


class DocumentaryCollection(Base):
    __tablename__ = "documentary_collections"

    id = Column(Integer, primary_key=True, index=True)
    dp_number = Column(String(100), unique=True, nullable=False, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    exporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    importer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    remitting_bank = Column(String(255), nullable=False)
    collecting_bank = Column(String(255), nullable=False)
    amount = Column(DECIMAL(15, 2), nullable=False)
    currency = Column(String(3), nullable=False)
    status = Column(Enum(DPStatus), default=DPStatus.DRAFT, nullable=False)
    documents_released_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    order = relationship("Order")
    exporter = relationship("User", foreign_keys=[exporter_id])
    importer = relationship("User", foreign_keys=[importer_id])
    
    __table_args__ = (
        CheckConstraint("amount > 0", name="check_dp_amount"),
    )


class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    tracking_number = Column(String(100), unique=True, nullable=False, index=True)
    carrier = Column(String(100), nullable=False)
    origin_corridor = Column(String(100), nullable=False)
    destination_corridor = Column(String(100), nullable=False)
    status = Column(Enum(ShipmentStatus), default=ShipmentStatus.LABEL_CREATED, nullable=False)
    estimated_delivery = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    order = relationship("Order")
    events = relationship("ShipmentEvent", back_populates="shipment", cascade="all, delete-orphan")


class ShipmentEvent(Base):
    __tablename__ = "shipment_events"

    id = Column(Integer, primary_key=True, index=True)
    shipment_id = Column(Integer, ForeignKey("shipments.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    location = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)

    shipment = relationship("Shipment", back_populates="events")
