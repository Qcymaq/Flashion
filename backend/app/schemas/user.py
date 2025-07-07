from pydantic import BaseModel, EmailStr, Field, ConfigDict, validator, GetJsonSchemaHandler
from typing import Optional, Any, Literal, Annotated
from datetime import datetime
from bson import ObjectId
from pydantic.json_schema import JsonSchemaValue
from pydantic_core import CoreSchema, core_schema

class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
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

    @classmethod
    def __get_pydantic_json_schema__(cls, _core_schema: dict[str, Any], _handler: GetJsonSchemaHandler) -> JsonSchemaValue:
        return {"type": "string", "description": "ObjectId"}

class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    shipping_address: Optional[str] = None
    role: str = "user"
    is_active: bool = True

    @validator('role')
    def validate_role(cls, v):
        if v not in ["user", "admin"]:
            raise ValueError("Role must be either 'user' or 'admin'")
        return v

class UserCreate(UserBase):
    password: str

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters long")
        return v

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserInDB(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        validate_assignment=True,
        from_attributes=True,
        str_strip_whitespace=True,
        use_enum_values=True,
        extra='allow'
    )

class User(UserBase):
    id: PyObjectId = Field(alias="_id")
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={
            ObjectId: str
        }
    )

    @classmethod
    def from_db(cls, db_user: UserInDB) -> "User":
        return cls(
            id=db_user.id,
            name=db_user.name,
            email=db_user.email,
            role=db_user.role,
            phone=db_user.phone,
            address=db_user.address,
            shipping_address=db_user.shipping_address,
            created_at=db_user.created_at,
            updated_at=db_user.updated_at
        )

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    shipping_address: Optional[str] = None 