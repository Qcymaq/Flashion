from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from ..models.beauty_tip import BeautyTipCreate, BeautyTipUpdate, BeautyTipResponse
from ..models.comment import CommentCreate, CommentResponse
from ..utils.database import get_database
from ..utils.auth import get_current_admin_user, get_current_user

router = APIRouter(prefix="/beauty-tips", tags=["Beauty Tips"])

@router.get("/", response_model=List[BeautyTipResponse])
async def get_beauty_tips(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    category: Optional[str] = None,
    search: Optional[str] = None,
    published_only: bool = Query(True),
    db = Depends(get_database)
):
    """Get all beauty tips with optional filtering"""
    try:
        collection = db.beauty_tips
        
        filter_query = {}
        if category and category != "Tất cả":
            filter_query["category"] = category
        if published_only:
            filter_query["is_published"] = True
        if search:
            filter_query["$or"] = [
                {"title": {"$regex": search, "$options": "i"}},
                {"excerpt": {"$regex": search, "$options": "i"}},
                {"author": {"$regex": search, "$options": "i"}},
                {"tags": {"$regex": search, "$options": "i"}}
            ]
        
        cursor = collection.find(filter_query).sort("created_at", -1).skip(skip).limit(limit)
        beauty_tips_docs = await cursor.to_list(length=limit)
        
        # Convert _id to string for each doc
        for doc in beauty_tips_docs:
            doc['_id'] = str(doc['_id'])
        return [BeautyTipResponse(**doc) for doc in beauty_tips_docs]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/{tip_id}", response_model=BeautyTipResponse)
async def get_beauty_tip(tip_id: str, db = Depends(get_database)):
    """Get a specific beauty tip by ID"""
    try:
        collection = db.beauty_tips
        
        if not ObjectId.is_valid(tip_id):
            raise HTTPException(status_code=400, detail="Invalid beauty tip ID")
        
        doc = await collection.find_one({"_id": ObjectId(tip_id)})
        if not doc:
            raise HTTPException(status_code=404, detail="Beauty tip not found")
        
        await collection.update_one(
            {"_id": ObjectId(tip_id)},
            {"$inc": {"views": 1}}
        )
        
        doc["_id"] = str(doc["_id"])
        return doc
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/", response_model=BeautyTipResponse)
async def create_beauty_tip(
    beauty_tip: BeautyTipCreate,
    current_admin = Depends(get_current_admin_user),
    db = Depends(get_database)
):
    """Create a new beauty tip (Admin only)"""
    try:
        collection = db.beauty_tips
        
        tip_data = beauty_tip.dict()
        tip_data["views"] = 0
        tip_data["likes"] = 0
        tip_data["author_avatar"] = "/images/studio.png"
        tip_data["date"] = datetime.now().strftime("%d/%m/%Y")
        tip_data["created_at"] = datetime.utcnow()
        tip_data["updated_at"] = datetime.utcnow()
        
        result = await collection.insert_one(tip_data)
        
        created_tip = await collection.find_one({"_id": result.inserted_id})
        created_tip["_id"] = str(created_tip["_id"])
        
        return created_tip
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.put("/{tip_id}", response_model=BeautyTipResponse)
async def update_beauty_tip(
    tip_id: str,
    beauty_tip: BeautyTipUpdate,
    current_admin = Depends(get_current_admin_user),
    db = Depends(get_database)
):
    """Update a beauty tip (Admin only)"""
    try:
        collection = db.beauty_tips
        
        if not ObjectId.is_valid(tip_id):
            raise HTTPException(status_code=400, detail="Invalid beauty tip ID")
        
        existing_tip = await collection.find_one({"_id": ObjectId(tip_id)})
        if not existing_tip:
            raise HTTPException(status_code=404, detail="Beauty tip not found")
        
        update_data = beauty_tip.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        result = await collection.update_one(
            {"_id": ObjectId(tip_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=400, detail="No changes made")
        
        updated_tip = await collection.find_one({"_id": ObjectId(tip_id)})
        updated_tip["_id"] = str(updated_tip["_id"])
        
        return updated_tip
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.delete("/{tip_id}")
async def delete_beauty_tip(
    tip_id: str,
    current_admin = Depends(get_current_admin_user),
    db = Depends(get_database)
):
    """Delete a beauty tip (Admin only)"""
    try:
        collection = db.beauty_tips
        
        if not ObjectId.is_valid(tip_id):
            raise HTTPException(status_code=400, detail="Invalid beauty tip ID")
        
        existing_tip = await collection.find_one({"_id": ObjectId(tip_id)})
        if not existing_tip:
            raise HTTPException(status_code=404, detail="Beauty tip not found")
        
        result = await collection.delete_one({"_id": ObjectId(tip_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=400, detail="Failed to delete beauty tip")
        
        return {"message": "Beauty tip deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.patch("/{tip_id}/toggle-publish")
async def toggle_publish_status(
    tip_id: str,
    current_admin = Depends(get_current_admin_user),
    db = Depends(get_database)
):
    """Toggle publish status of a beauty tip (Admin only)"""
    try:
        collection = db.beauty_tips
        
        if not ObjectId.is_valid(tip_id):
            raise HTTPException(status_code=400, detail="Invalid beauty tip ID")
        
        existing_tip = await collection.find_one({"_id": ObjectId(tip_id)})
        if not existing_tip:
            raise HTTPException(status_code=404, detail="Beauty tip not found")
        
        new_status = not existing_tip.get("is_published", True)
        
        result = await collection.update_one(
            {"_id": ObjectId(tip_id)},
            {
                "$set": {
                    "is_published": new_status,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=400, detail="Failed to update publish status")
        
        return {
            "message": f"Beauty tip {'published' if new_status else 'unpublished'} successfully",
            "is_published": new_status
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/categories/list", response_model=dict)
async def get_categories(db = Depends(get_database)):
    """Get all available categories"""
    try:
        collection = db.beauty_tips
        
        categories = await collection.distinct("category")
        # Filter out empty or None categories
        valid_categories = [cat for cat in categories if cat and cat.strip()]
        return {"categories": valid_categories}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/stats/overview")
async def get_beauty_tips_stats(
    current_admin = Depends(get_current_admin_user),
    db = Depends(get_database)
):
    """Get beauty tips statistics (Admin only)"""
    try:
        collection = db.beauty_tips
        
        total_count = await collection.count_documents({})
        if total_count == 0:
            return {
                "total_count": 0,
                "published_count": 0,
                "draft_count": 0,
                "total_views": 0,
                "total_likes": 0,
                "most_viewed": None
            }

        published_count = await collection.count_documents({"is_published": True})
        draft_count = total_count - published_count
        
        pipeline = [
            {"$group": {
                "_id": None, 
                "total_views": {"$sum": "$views"},
                "total_likes": {"$sum": "$likes"}
            }}
        ]
        
        stats_cursor = collection.aggregate(pipeline)
        
        stats_result = None
        try:
            stats_result = await stats_cursor.next()
        except StopAsyncIteration:
            pass
        
        total_views = stats_result.get("total_views", 0) if stats_result else 0
        total_likes = stats_result.get("total_likes", 0) if stats_result else 0
        
        most_viewed_cursor = collection.find({"is_published": True}).sort("views", -1).limit(1)
        most_viewed = await most_viewed_cursor.to_list(length=1)
        
        most_viewed_data = None
        if most_viewed:
            most_viewed_data = {
                "title": most_viewed[0].get("title", ""),
                "views": most_viewed[0].get("views", 0)
            }

        return {
            "total_count": total_count,
            "published_count": published_count,
            "draft_count": draft_count,
            "total_views": total_views,
            "total_likes": total_likes,
            "most_viewed": most_viewed_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/{tip_id}/comments", response_model=List[CommentResponse])
async def get_comments_for_tip(tip_id: str, db=Depends(get_database)):
    """Get all comments for a beauty tip"""
    try:
        collection = db.comments
        if not ObjectId.is_valid(tip_id):
            raise HTTPException(status_code=400, detail="Invalid beauty tip ID")
        cursor = collection.find({"tip_id": tip_id}).sort("created_at", 1)
        comments = await cursor.to_list(length=100)
        for c in comments:
            c["_id"] = str(c["_id"])
        return comments
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/{tip_id}/comments", response_model=CommentResponse)
async def add_comment_to_tip(
    tip_id: str,
    comment: CommentCreate,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Add a new comment to a beauty tip (authenticated users only)"""
    try:
        collection = db.comments
        if not ObjectId.is_valid(tip_id):
            raise HTTPException(status_code=400, detail="Invalid beauty tip ID")
        comment_data = comment.dict()
        comment_data["tip_id"] = tip_id
        comment_data["user_id"] = str(getattr(current_user, "_id", getattr(current_user, "id", "")))
        comment_data["user_name"] = getattr(current_user, "name", None) or getattr(current_user, "username", "User")
        comment_data["user_avatar"] = getattr(current_user, "avatar", None)
        comment_data["created_at"] = datetime.utcnow()
        result = await collection.insert_one(comment_data)
        created = await collection.find_one({"_id": result.inserted_id})
        created["_id"] = str(created["_id"])
        return created
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/{tip_id}/like")
async def toggle_like_beauty_tip(
    tip_id: str,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Toggle like/unlike for a beauty tip (authenticated users only)"""
    try:
        collection = db.beauty_tips
        if not ObjectId.is_valid(tip_id):
            raise HTTPException(status_code=400, detail="Invalid beauty tip ID")
        tip = await collection.find_one({"_id": ObjectId(tip_id)})
        if not tip:
            raise HTTPException(status_code=404, detail="Beauty tip not found")
        user_id = str(getattr(current_user, "_id", getattr(current_user, "id", "")))
        liked_by = tip.get("liked_by", [])
        if user_id in liked_by:
            # Unlike
            await collection.update_one(
                {"_id": ObjectId(tip_id)},
                {"$pull": {"liked_by": user_id}, "$inc": {"likes": -1}}
            )
            liked = False
        else:
            # Like
            await collection.update_one(
                {"_id": ObjectId(tip_id)},
                {"$addToSet": {"liked_by": user_id}, "$inc": {"likes": 1}}
            )
            liked = True
        updated = await collection.find_one({"_id": ObjectId(tip_id)})
        return {
            "likes": updated.get("likes", 0),
            "liked": liked
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}") 

@router.delete("/{tip_id}/comments/{comment_id}", status_code=204)
async def delete_comment_for_tip(
    tip_id: str,
    comment_id: str,
    current_admin=Depends(get_current_admin_user),
    db=Depends(get_database)
):
    """Delete a comment for a beauty tip (Admin only)"""
    try:
        collection = db.comments
        if not ObjectId.is_valid(tip_id):
            raise HTTPException(status_code=400, detail="Invalid beauty tip ID")
        if not ObjectId.is_valid(comment_id):
            raise HTTPException(status_code=400, detail="Invalid comment ID")
        result = await collection.delete_one({"_id": ObjectId(comment_id), "tip_id": tip_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Comment not found")
        return
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}") 