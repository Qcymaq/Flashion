from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from bson import ObjectId

class ReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Đánh giá từ 1-5 sao")
    comment: str = Field(..., min_length=1, max_length=1000, description="Nội dung đánh giá")
    product_id: str = Field(..., description="ID của sản phẩm")

class ReviewCreate(ReviewBase):
    pass

class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5, description="Đánh giá từ 1-5 sao")
    comment: Optional[str] = Field(None, min_length=1, max_length=1000, description="Nội dung đánh giá")

class ReviewInDB(ReviewBase):
    id: str = Field(alias="_id")
    user_id: str = Field(..., description="ID người dùng")
    user_name: str = Field(..., description="Tên người dùng")
    user_avatar: Optional[str] = Field(None, description="Avatar người dùng")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_verified_purchase: bool = Field(default=False, description="Xác nhận đã mua sản phẩm")

    model_config = ConfigDict(
        populate_by_name=True
    )

class ReviewResponse(ReviewInDB):
    pass

class ReviewStats(BaseModel):
    average_rating: float = Field(..., description="Đánh giá trung bình")
    total_reviews: int = Field(..., description="Tổng số đánh giá")
    rating_distribution: dict = Field(..., description="Phân bố đánh giá theo sao")
    verified_purchases: int = Field(..., description="Số đánh giá từ người mua xác nhận") 