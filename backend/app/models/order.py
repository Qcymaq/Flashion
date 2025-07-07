from datetime import datetime
from typing import List, Optional
from beanie import Document, Link
from pydantic import BaseModel, Field

class OrderItem(BaseModel):
    product_id: str
    quantity: int
    price: float

class ShippingAddress(BaseModel):
    street: str
    city: str
    state: str
    country: str
    zip_code: str

class Order(Document):
    user_id: str
    items: List[OrderItem]
    total: float
    status: str = "pending"  # pending, processing, completed, cancelled
    payment_id: str
    shipping_address: ShippingAddress
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "orders"
        indexes = [
            "user_id",
            "status",
            "created_at",
            "payment_id"
        ] 