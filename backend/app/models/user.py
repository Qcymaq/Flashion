from datetime import datetime
from typing import Optional
from beanie import Document
from pydantic import BaseModel, EmailStr, Field

class User(Document):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    shipping_address: Optional[str] = None
    role: str = "user"  # user, admin
    is_active: bool = True
    membership: str = "free"  # free, gold, diamond
    try_on_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"
        indexes = [
            "email",
            "role",
            "is_active"
        ] 