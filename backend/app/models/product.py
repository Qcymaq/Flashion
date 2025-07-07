from datetime import datetime
from typing import Optional, List
from beanie import Document
from pydantic import BaseModel, Field

class Product(Document):
    name: str
    description: str
    price: float
    images: List[str] = []
    category: str
    stock: int
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "products"
        indexes = [
            "name",
            "category",
            "is_active"
        ] 