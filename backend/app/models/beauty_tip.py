from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict
from bson import ObjectId

class BeautyTipBase(BaseModel):
    title: str = Field(..., description="Tiêu đề bài viết")
    excerpt: str = Field(..., description="Tóm tắt bài viết")
    content: str = Field(..., description="Nội dung tóm tắt")
    full_content: str = Field(..., description="Nội dung đầy đủ (HTML)")
    image: str = Field(..., description="URL hình ảnh")
    category: str = Field(..., description="Danh mục")
    tags: List[str] = Field(default=[], description="Tags")
    author: str = Field(..., description="Tác giả")
    read_time: str = Field(..., description="Thời gian đọc")
    is_published: bool = Field(default=True, description="Trạng thái xuất bản")
    related_articles: List[str] = Field(default=[], description="Bài viết liên quan")

class BeautyTipCreate(BeautyTipBase):
    pass

class BeautyTipUpdate(BaseModel):
    title: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    full_content: Optional[str] = None
    image: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    author: Optional[str] = None
    read_time: Optional[str] = None
    is_published: Optional[bool] = None
    related_articles: Optional[List[str]] = None

class BeautyTipInDB(BeautyTipBase):
    id: str = Field(alias="_id")
    views: int = Field(default=0, description="Lượt xem")
    likes: int = Field(default=0, description="Lượt thích")
    author_avatar: str = Field(default="/images/studio.png", description="Avatar tác giả")
    date: str = Field(..., description="Ngày tạo")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "title": "Liệu trình trẻ hóa da tại nhà",
                "excerpt": "Khám phá các phương pháp chăm sóc da hiệu quả",
                "content": "Hiện nay có rất nhiều phương pháp trẻ hóa da...",
                "full_content": "<h2>Giới thiệu</h2><p>Hiện nay có rất nhiều phương pháp...</p>",
                "image": "/images/kem.png",
                "category": "Chăm sóc da",
                "tags": ["Trẻ hóa", "Tại nhà", "Tự nhiên"],
                "author": "Chuyên gia Flashion",
                "read_time": "5 phút",
                "is_published": True,
                "views": 1247,
                "likes": 89,
                "date": "27/11/2023"
            }
        }
    )

class BeautyTipResponse(BeautyTipInDB):
    pass 