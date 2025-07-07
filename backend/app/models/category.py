from datetime import datetime
from typing import Optional
from beanie import Document
from pydantic import BaseModel, Field

class Category(Document):
    name: str
    description: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "categories"
        indexes = [
            "name",
            "is_active"
        ] 