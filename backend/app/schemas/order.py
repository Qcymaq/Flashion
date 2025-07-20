from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Any
from datetime import datetime
from bson import ObjectId
from enum import Enum
from .cart import CartItem

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, handler):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, _schema_generator: Any, _field_schema: dict[str, Any]) -> None:
        _field_schema.update(type="string")

class OrderStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class PaymentMethod(str, Enum):
    BANK_TRANSFER = "bank_transfer"

class Address(BaseModel):
    street: str
    city: str
    state: str
    country: str
    zip_code: str

class PaymentDetails(BaseModel):
    method: PaymentMethod
    status: PaymentStatus
    transaction_id: Optional[str] = None

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price: float

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class OrderBase(BaseModel):
    user_id: str
    items: List[OrderItem]
    total_price: float
    shipping_address: str
    phone_number: Optional[str] = None
    status: str = "pending"

class OrderCreate(OrderBase):
    pass

class Order(OrderBase):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    ) 