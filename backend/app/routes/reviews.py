from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from app.schemas.user import User, UserInDB
from app.utils.database import get_database
from app.utils.auth import get_current_user
from ..models.review import ReviewCreate, ReviewUpdate, ReviewResponse, ReviewStats

router = APIRouter(prefix="/reviews", tags=["reviews"])

@router.post("/", response_model=ReviewResponse)
async def create_review(
    review: ReviewCreate,
    current_user: UserInDB = Depends(get_current_user)
):
    """Tạo đánh giá mới cho sản phẩm"""
    try:
        db = get_database()
        
        # Kiểm tra xem người dùng đã đánh giá sản phẩm này chưa
        existing_review = await db.reviews.find_one({
            "product_id": review.product_id,
            "user_id": str(current_user.id)
        })
        
        if existing_review:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bạn đã đánh giá sản phẩm này rồi"
            )
        
        # Kiểm tra xem sản phẩm có tồn tại không
        product = await db.products.find_one({"_id": ObjectId(review.product_id)})
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sản phẩm không tồn tại"
            )
        
        # Kiểm tra xem người dùng đã mua sản phẩm này chưa
        orders = await db.orders.find({
            "user_id": str(current_user.id),
            "status": {"$in": ["completed", "delivered"]},
            "items.product_id": review.product_id
        }).to_list(length=None)
        
        is_verified_purchase = len(orders) > 0
        
        # Tạo đánh giá mới
        review_data = {
            "product_id": review.product_id,
            "user_id": str(current_user.id),
            "user_name": current_user.name,
            "user_avatar": None,  # Avatar field not available in current user model
            "rating": review.rating,
            "comment": review.comment,
            "is_verified_purchase": is_verified_purchase,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await db.reviews.insert_one(review_data)
        review_data["_id"] = str(result.inserted_id)
        
        # Cập nhật thống kê đánh giá của sản phẩm
        await update_product_review_stats(review.product_id)
        
        return ReviewResponse(**review_data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi tạo đánh giá: {str(e)}"
        )

@router.get("/product/{product_id}", response_model=List[ReviewResponse])
async def get_product_reviews(
    product_id: str,
    page: int = Query(1, ge=1, description="Trang"),
    limit: int = Query(10, ge=1, le=50, description="Số lượng đánh giá mỗi trang"),
    sort_by: str = Query("created_at", description="Sắp xếp theo: created_at, rating"),
    sort_order: str = Query("desc", description="Thứ tự: asc, desc")
):
    """Lấy danh sách đánh giá của sản phẩm"""
    try:
        db = get_database()
        
        # Kiểm tra sản phẩm có tồn tại không
        product = await db.products.find_one({"_id": ObjectId(product_id)})
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sản phẩm không tồn tại"
            )
        
        # Xây dựng query sắp xếp
        sort_direction = -1 if sort_order == "desc" else 1
        sort_field = "rating" if sort_by == "rating" else "created_at"
        
        # Lấy đánh giá
        skip = (page - 1) * limit
        reviews = await db.reviews.find(
            {"product_id": product_id}
        ).sort(sort_field, sort_direction).skip(skip).limit(limit).to_list(length=None)
        
        # Chuyển đổi ObjectId thành string
        for review in reviews:
            review["_id"] = str(review["_id"])
        
        return [ReviewResponse(**review) for review in reviews]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi lấy đánh giá: {str(e)}"
        )

@router.get("/product/{product_id}/stats", response_model=ReviewStats)
async def get_product_review_stats(product_id: str):
    """Lấy thống kê đánh giá của sản phẩm"""
    try:
        db = get_database()
        
        # Kiểm tra sản phẩm có tồn tại không
        product = await db.products.find_one({"_id": ObjectId(product_id)})
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sản phẩm không tồn tại"
            )
        
        # Lấy tất cả đánh giá của sản phẩm
        reviews = await db.reviews.find({"product_id": product_id}).to_list(length=None)
        
        if not reviews:
            return ReviewStats(
                average_rating=0.0,
                total_reviews=0,
                rating_distribution={"1": 0, "2": 0, "3": 0, "4": 0, "5": 0},
                verified_purchases=0
            )
        
        # Tính toán thống kê
        total_reviews = len(reviews)
        total_rating = sum(review["rating"] for review in reviews)
        average_rating = round(total_rating / total_reviews, 1)
        
        # Phân bố đánh giá
        rating_distribution = {"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}
        for review in reviews:
            rating_distribution[str(review["rating"])] += 1
        
        # Số đánh giá từ người mua xác nhận
        verified_purchases = sum(1 for review in reviews if review.get("is_verified_purchase", False))
        
        return ReviewStats(
            average_rating=average_rating,
            total_reviews=total_reviews,
            rating_distribution=rating_distribution,
            verified_purchases=verified_purchases
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi lấy thống kê đánh giá: {str(e)}"
        )

@router.put("/{review_id}", response_model=ReviewResponse)
async def update_review(
    review_id: str,
    review_update: ReviewUpdate,
    current_user: UserInDB = Depends(get_current_user)
):
    """Cập nhật đánh giá"""
    try:
        db = get_database()
        
        # Kiểm tra đánh giá có tồn tại không
        existing_review = await db.reviews.find_one({"_id": ObjectId(review_id)})
        if not existing_review:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Đánh giá không tồn tại"
            )
        
        # Kiểm tra quyền sở hữu
        if existing_review["user_id"] != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bạn không có quyền cập nhật đánh giá này"
            )
        
        # Cập nhật đánh giá
        update_data = {"updated_at": datetime.utcnow()}
        if review_update.rating is not None:
            update_data["rating"] = review_update.rating
        if review_update.comment is not None:
            update_data["comment"] = review_update.comment
        
        await db.reviews.update_one(
            {"_id": ObjectId(review_id)},
            {"$set": update_data}
        )
        
        # Lấy đánh giá đã cập nhật
        updated_review = await db.reviews.find_one({"_id": ObjectId(review_id)})
        updated_review["_id"] = str(updated_review["_id"])
        
        # Cập nhật thống kê đánh giá của sản phẩm
        await update_product_review_stats(updated_review["product_id"])
        
        return ReviewResponse(**updated_review)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi cập nhật đánh giá: {str(e)}"
        )

@router.delete("/{review_id}")
async def delete_review(
    review_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    """Xóa đánh giá"""
    try:
        db = get_database()
        
        # Kiểm tra đánh giá có tồn tại không
        existing_review = await db.reviews.find_one({"_id": ObjectId(review_id)})
        if not existing_review:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Đánh giá không tồn tại"
            )
        
        # Kiểm tra quyền sở hữu
        if existing_review["user_id"] != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bạn không có quyền xóa đánh giá này"
            )
        
        # Xóa đánh giá
        await db.reviews.delete_one({"_id": ObjectId(review_id)})
        
        # Cập nhật thống kê đánh giá của sản phẩm
        await update_product_review_stats(existing_review["product_id"])
        
        return {"message": "Đánh giá đã được xóa thành công"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi xóa đánh giá: {str(e)}"
        )

@router.get("/user/me", response_model=List[ReviewResponse])
async def get_user_reviews(
    current_user: UserInDB = Depends(get_current_user),
    page: int = Query(1, ge=1, description="Trang"),
    limit: int = Query(10, ge=1, le=50, description="Số lượng đánh giá mỗi trang")
):
    """Lấy danh sách đánh giá của người dùng hiện tại"""
    try:
        db = get_database()
        
        skip = (page - 1) * limit
        reviews = await db.reviews.find(
            {"user_id": str(current_user.id)}
        ).sort("created_at", -1).skip(skip).limit(limit).to_list(length=None)
        
        # Chuyển đổi ObjectId thành string
        for review in reviews:
            review["_id"] = str(review["_id"])
        
        return [ReviewResponse(**review) for review in reviews]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi lấy đánh giá: {str(e)}"
        )

async def update_product_review_stats(product_id: str):
    """Cập nhật thống kê đánh giá của sản phẩm"""
    try:
        db = get_database()
        
        # Lấy thống kê đánh giá
        reviews = await db.reviews.find({"product_id": product_id}).to_list(length=None)
        
        if not reviews:
            # Nếu không có đánh giá, đặt về 0
            await db.products.update_one(
                {"_id": ObjectId(product_id)},
                {"$set": {"rating": 0, "reviews": 0}}
            )
            return
        
        # Tính toán thống kê
        total_reviews = len(reviews)
        total_rating = sum(review["rating"] for review in reviews)
        average_rating = round(total_rating / total_reviews, 1)
        
        # Cập nhật sản phẩm
        await db.products.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": {"rating": average_rating, "reviews": total_reviews}}
        )
        
    except Exception as e:
        print(f"Lỗi khi cập nhật thống kê đánh giá: {str(e)}") 