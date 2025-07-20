from datetime import datetime
from beanie import Document
from pydantic import Field

class Payment(Document):
    order_id: str
    amount: float
    method: str  # credit_card, paypal, bank_transfer, cash
    status: str = "pending"  # pending, completed, failed, refunded
    transaction_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "payments"
        indexes = [
            "order_id",
            "status",
            "created_at",
            "transaction_id"
        ] 