from datetime import datetime
from beanie import Document
from pydantic import Field, EmailStr, BaseModel
from enum import Enum

class ConsultationStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class ConsultationCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    service: str
    message: str

class Consultation(Document):
    name: str
    email: EmailStr
    phone: str
    service: str
    message: str
    status: ConsultationStatus = ConsultationStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "consultations"
        indexes = [
            "email",
            "status",
            "created_at"
        ] 