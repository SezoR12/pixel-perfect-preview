from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Optional, List

from pydantic import BaseModel, EmailStr, Field, ConfigDict


class AccountType(str, Enum):
    FREE = "free"
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"
    PLATINUM = "platinum"
    BLACK = "black"


class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None
    country: str


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserRead(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    account_type: AccountType
    is_verified: bool
    reputation_score: int
    created_at: datetime
    last_login: Optional[datetime] = None


class Token(BaseModel):
    access_token: str
    token_type: str


class MasterAccountBase(BaseModel):
    level: AccountType
    start_date: datetime
    end_date: datetime
    monthly_price: Decimal


class MasterAccountRead(MasterAccountBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    is_active: bool


class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    price: Decimal
    quantity: int
    unit: str
    origin: str
    location: str


class ProductCreate(ProductBase):
    pass


class ProductRead(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    is_available: bool
    created_at: datetime
    updated_at: datetime


class DemandBase(BaseModel):
    product_name: str
    category: str
    quantity: int
    unit: str
    budget: Decimal
    location: str
    urgency: int = Field(default=1, ge=1, le=3)


class DemandCreate(DemandBase):
    pass


class DemandRead(DemandBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    is_active: bool
    created_at: datetime


class PreDealBase(BaseModel):
    product_id: int
    seller_id: int
    buyer_id: int
    suggested_price: Decimal
    quantity: int
    shipping_cost: Optional[Decimal] = Decimal("0")
    payment_terms: Optional[str] = "Escrow"
    priority_level: Optional[int] = 0
    is_exclusive: Optional[bool] = False
    match_score: Optional[Decimal] = Decimal("0")
    expires_at: datetime


class PreDealRead(PreDealBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: str
    created_at: datetime
    product: Optional[ProductRead] = None
    seller: Optional[UserRead] = None
    buyer: Optional[UserRead] = None


class PreDealAction(BaseModel):
    action: str = Field(..., pattern="^(accept|reject)$")


class MatchRequest(BaseModel):
    product_id: Optional[int] = None
    demand_id: Optional[int] = None


class MatchResult(BaseModel):
    product_id: int
    demand_id: int
    seller_id: int
    buyer_id: int
    match_score: Decimal
    suggested_price: Decimal
    quantity: int
    shipping_cost: Decimal
    priority_level: int
    payment_terms: str


class DashboardStats(BaseModel):
    total_products: int
    total_demands: int
    active_pre_deals: int
    accepted_deals: int
    active_orders: int


class WaitlistEntryCreate(BaseModel):
    email: EmailStr


class WaitlistEntryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    source: str
    created_at: datetime


class KYCStatus(str, Enum):
    PENDING = "pending"
    SUBMITTED = "submitted"
    IN_REVIEW = "in_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXPIRED = "expired"


class KYCSubmission(BaseModel):
    document_type: str
    document_url: str
    document_hash: str


class KYCRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    status: str
    document_type: str
    document_url: str
    document_hash: str
    rejection_reason: Optional[str] = None
    submitted_at: datetime
    reviewed_at: Optional[datetime] = None


class KYCReview(BaseModel):
    status: str = Field(..., pattern="^(approved|rejected)$")
    rejection_reason: Optional[str] = None


class SanctionsScreenRequest(BaseModel):
    entity_name: str
    entity_type: str = "user"


class SanctionsScreenResult(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    entity_name: str
    entity_type: str
    screened_against: str
    match_found: bool
    match_details: Optional[str] = None
    screened_at: datetime
    review_status: str


class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    unit: str
    unit_price: Decimal
    currency: str


class OrderItemRead(OrderItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    total_price: Decimal
    fulfillment_status: str
    product: Optional[ProductRead] = None


class OrderCreate(BaseModel):
    pre_deal_id: int


class OrderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_number: str
    pre_deal_id: Optional[int] = None
    buyer_id: int
    seller_id: int
    status: str
    payment_status: str
    payment_method: str
    total_value: Decimal
    platform_fee: Decimal
    currency: str
    incoterm: str
    origin_country: str
    destination_country: str
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
    buyer: Optional[UserRead] = None
    seller: Optional[UserRead] = None
    items: List[OrderItemRead] = []
    payments: List["PaymentRead"] = []


class PaymentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    method: str
    amount: Decimal
    currency: str
    status: str
    processor: Optional[str] = None
    processor_transaction_id: Optional[str] = None
    created_at: datetime


class PaymentAction(BaseModel):
    action: str = Field(..., pattern="^(pay|release|refund)$")


class PaymentCreate(BaseModel):
    order_id: int
    method: str = Field(..., pattern="^(Escrow|Card|L/C|D/P)$")
    amount: Decimal
    currency: str


class NotificationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    message: str
    type: str
    priority: str
    read: bool
    created_at: datetime


class SubscriptionCreate(BaseModel):
    tier: str


class SubscriptionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    stripe_customer_id: str
    stripe_subscription_id: str
    tier: str
    status: str
    current_period_end: datetime
    created_at: datetime


class LCCreate(BaseModel):
    order_id: int
    issuing_bank: str
    advising_bank: str
    amount: Decimal
    currency: str
    expiry_days: int = 90


class LCRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    lc_number: str
    order_id: int
    applicant_id: int
    beneficiary_id: int
    issuing_bank: str
    advising_bank: str
    amount: Decimal
    currency: str
    expiry_date: datetime
    status: str
    discrepancy_notes: Optional[str] = None
    documents_presented_at: Optional[datetime] = None
    settled_at: Optional[datetime] = None
    created_at: datetime


class LCAction(BaseModel):
    action: str = Field(..., pattern="^(advise|present|discrepancy|clean|settle|cancel)$")
    notes: Optional[str] = None


class DPCreate(BaseModel):
    order_id: int
    remitting_bank: str
    collecting_bank: str
    amount: Decimal
    currency: str


class DPRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    dp_number: str
    order_id: int
    exporter_id: int
    importer_id: int
    remitting_bank: str
    collecting_bank: str
    amount: Decimal
    currency: str
    status: str
    documents_released_at: Optional[datetime] = None
    created_at: datetime


class DPAction(BaseModel):
    action: str = Field(..., pattern="^(send|present|pay|reject)$")


class ShipmentEventCreate(BaseModel):
    location: str
    description: str


class ShipmentEventRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    shipment_id: int
    timestamp: datetime
    location: str
    description: str


class ShipmentCreate(BaseModel):
    order_id: int
    carrier: str
    origin_corridor: str
    destination_corridor: str


class ShipmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    tracking_number: str
    carrier: str
    origin_corridor: str
    destination_corridor: str
    status: str
    estimated_delivery: Optional[datetime] = None
    created_at: datetime
    events: List[ShipmentEventRead] = []


class PricePrediction(BaseModel):
    commodity_name: str
    current_price: Decimal
    forecast_30d: Decimal
    confidence_interval_low: Decimal
    confidence_interval_high: Decimal
    trend: str


class DemandAnalytics(BaseModel):
    corridor: str
    total_demand_tonnage: int
    total_supply_tonnage: int
    imbalance_ratio: Decimal
    recommended_action: str

