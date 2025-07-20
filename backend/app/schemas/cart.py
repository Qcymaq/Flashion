from typing import List, Optional, Any
from pydantic import BaseModel, Field, GetJsonSchemaHandler, ConfigDict
from pydantic.json_schema import JsonSchemaValue
from datetime import datetime
from bson import ObjectId

class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, handler):
        if not ObjectId.is_valid(str(v)):
            raise ValueError("Invalid ObjectId")
        return str(v)
    
    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema, handler):
        return {"type": "string", "format": "objectid"}

class CartItemBase(BaseModel):
    product_id: PyObjectId
    quantity: int
    color: Optional[str] = None

class CartItemCreate(CartItemBase):
    pass

class CartItem(CartItemBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    product_name: str
    product_price: float
    product_image: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={
            ObjectId: str,
            datetime: lambda dt: dt.isoformat()
        }
    )

class Cart(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    items: List[CartItem] = []
    total_price: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={
            ObjectId: str,
            datetime: lambda dt: dt.isoformat()
        }
    ) 