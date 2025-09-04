from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Annotated, Any
from datetime import datetime
from bson import ObjectId
from pydantic_core import CoreSchema, core_schema

class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, handler=None):
        if not ObjectId.is_valid(str(v)):
            raise ValueError("Invalid ObjectId")
        return str(v)

    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type: Any, _handler: Any) -> CoreSchema:
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.chain_schema([
                    core_schema.str_schema(),
                    core_schema.no_info_plain_validator_function(cls.validate)
                ])
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda x: str(x),
                return_schema=core_schema.str_schema(),
                when_used='json'
            )
        )

class ProductBase(BaseModel):
    name: str
    summary: Optional[str] = None
    description: Optional[str] = None
    price: float
    category: str
    images: List[str] = []
    colors: List[str] = []
    stock: int = 0
    is_active: bool = True
    rating: float = 0.0
    reviews: int = 0

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: PyObjectId = Field(alias="_id")
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class ProductList(BaseModel):
    products: List[Product]
    totalPages: int
    currentPage: int
    totalProducts: int 