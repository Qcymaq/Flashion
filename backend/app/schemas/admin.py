from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class DashboardStats(BaseModel):
    totalUsers: int
    totalOrders: int
    totalRevenue: float
    averageOrderValue: float

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price: float

class OrderUser(BaseModel):
    _id: str
    full_name: str
    email: str

class RecentOrder(BaseModel):
    _id: str
    user_id: str
    user: dict
    items: List[dict]
    total_price: float
    shipping_address: str
    status: str
    created_at: datetime
    updated_at: datetime
    archived_at: Optional[datetime] = None
    archived_by: Optional[str] = None
    archive_reason: Optional[str] = None

class TopProduct(BaseModel):
    _id: str
    name: str
    total_sales: int
    revenue: float
    image_url: str

class PaymentUser(BaseModel):
    _id: str
    full_name: str
    email: str

class Payment(BaseModel):
    _id: str
    order_id: str
    amount: float
    status: str
    payment_method: str
    transaction_id: str
    created_at: datetime
    updated_at: datetime
    user: PaymentUser

class PaymentStatusUpdate(BaseModel):
    status: str 