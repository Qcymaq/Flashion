from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from bson import ObjectId

class CommentBase(BaseModel):
    content: str = Field(..., description="Nội dung bình luận")

class CommentCreate(CommentBase):
    pass

class CommentInDB(CommentBase):
    id: str = Field(alias="_id")
    tip_id: str = Field(..., description="ID của bài viết làm đẹp")
    user_id: str = Field(..., description="ID người dùng")
    user_name: str = Field(..., description="Tên người dùng")
    user_avatar: Optional[str] = Field(None, description="Avatar người dùng")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        populate_by_name=True
    )

class CommentResponse(CommentInDB):
    pass 