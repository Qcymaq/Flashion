from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel
from app.schemas.product import Product, ProductCreate
from app.schemas.user import User, UserInDB
from app.utils.database import get_database
from app.utils.auth import get_current_admin_user
from ..models.user import User as MongoUser
from ..models.order import Order
from ..schemas.admin import (
    DashboardStats,
    RecentOrder,
    TopProduct,
    Payment,
    PaymentStatusUpdate,
    PaymentUser
)

class ResetRevenueRequest(BaseModel):
    reason: str

router = APIRouter(tags=["admin"])

@router.get("/products", response_model=List[Product])
async def get_admin_products(
    current_user: User = Depends(get_current_admin_user),
    skip: int = 0,
    limit: int = 100
):
    db = get_database()
    products = await db.products.find().skip(skip).limit(limit).to_list(length=limit)
    return [
        {
            "_id": str(product["_id"]),
            "name": product["name"],
            "description": product["description"],
            "price": product["price"],
            "category": product["category"],
            "images": product["images"],
            "sizes": product.get("sizes", []),
            "colors": product["colors"],
            "stock": product["stock"],
            "is_active": product["is_active"],
            "created_at": product["created_at"],
            "updated_at": product["updated_at"]
        } for product in products
    ]

@router.post("/products", response_model=Product)
async def create_product(
    product: ProductCreate,
    current_user: User = Depends(get_current_admin_user)
):
    db = get_database()
    product_dict = product.dict()
    product_dict["created_at"] = datetime.utcnow()
    product_dict["updated_at"] = datetime.utcnow()
    
    result = await db.products.insert_one(product_dict)
    created_product = await db.products.find_one({"_id": result.inserted_id})
    
    return Product(**created_product)

@router.put("/products/{product_id}", response_model=Product)
async def update_product(
    product_id: str,
    product: ProductCreate,
    current_user: User = Depends(get_current_admin_user)
):
    db = get_database()
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID"
        )
    
    product_dict = product.dict()
    product_dict["updated_at"] = datetime.utcnow()
    
    result = await db.products.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": product_dict}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    updated_product = await db.products.find_one({"_id": ObjectId(product_id)})
    return Product(**updated_product)

@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: str,
    current_user: User = Depends(get_current_admin_user)
):
    db = get_database()
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID"
        )
    
    result = await db.products.delete_one({"_id": ObjectId(product_id)})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

@router.get("/users", response_model=List[User])
async def get_admin_users(
    current_user: User = Depends(get_current_admin_user),
    skip: int = 0,
    limit: int = 100
):
    db = get_database()
    users = await db.users.find().skip(skip).limit(limit).to_list(length=limit)
    return [User.from_db(UserInDB(**user)) for user in users]

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    current_user: User = Depends(get_current_admin_user)
):
    try:
        db = get_database()
        if not ObjectId.is_valid(user_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user ID"
            )
        
        # Don't allow deleting the current user
        if str(current_user._id) == user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete your own account"
            )
        
        result = await db.users.delete_one({"_id": ObjectId(user_id)})
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users/{user_id}", response_model=User)
async def get_user(
    user_id: str,
    current_user: User = Depends(get_current_admin_user)
):
    try:
        db = get_database()
        if not ObjectId.is_valid(user_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user ID"
            )
        
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return User.from_db(UserInDB(**user))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user: User = Depends(get_current_admin_user)):
    try:
        db = get_database()
        
        # Get total users
        total_users = await db.users.count_documents({})
        
        # Get total orders (excluding archived)
        total_orders = await db.orders.count_documents({"status": {"$ne": "archived"}})
        
        # Get completed and delivered orders and calculate revenue (excluding archived)
        completed_orders = await db.orders.find({
            "status": {"$in": ["completed", "delivered"]}
        }).to_list(length=None)
        total_revenue = sum(order["total_price"] for order in completed_orders)
        average_order_value = total_revenue / total_orders if total_orders > 0 else 0

        return {
            "totalUsers": total_users,
            "totalOrders": total_orders,
            "totalRevenue": total_revenue,
            "averageOrderValue": average_order_value
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/stats/reset-revenue")
async def reset_revenue(
    reset_data: ResetRevenueRequest,
    current_user: User = Depends(get_current_admin_user)
):
    try:
        # Validate reason
        if not reset_data.reason or not reset_data.reason.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Reason is required for revenue reset"
            )
        
        db = get_database()
        reason = reset_data.reason.strip()
        
        # Calculate current revenue before reset
        try:
            completed_orders = await db.orders.find({"status": {"$in": ["completed", "delivered"]}}).to_list(length=None)
            previous_revenue = sum(order.get("total_price", 0) for order in completed_orders)
        except Exception as calc_error:
            print(f"Error calculating previous revenue: {calc_error}")
            previous_revenue = 0
        
        # Actually reset revenue by archiving completed orders
        try:
            # Change all completed and delivered orders to "archived" status
            # This will exclude them from future revenue calculations
            result = await db.orders.update_many(
                {"status": {"$in": ["completed", "delivered"]}},
                {
                    "$set": {
                        "status": "archived",
                        "archived_at": datetime.utcnow(),
                        "archived_by": str(current_user.id),
                        "archive_reason": reason
                    }
                }
            )
            
            archived_count = result.modified_count
            print(f"Archived {archived_count} orders for revenue reset")
            
        except Exception as archive_error:
            print(f"Error archiving orders: {archive_error}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to archive orders for revenue reset"
            )
        
        return {
            "message": f"Revenue reset successfully. {archived_count} orders archived.",
            "reset_by": current_user.email,
            "reason": reason,
            "timestamp": datetime.utcnow(),
            "previous_revenue": previous_revenue,
            "archived_orders": archived_count
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in reset_revenue: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to reset revenue: {str(e)}")

@router.get("/orders/recent", response_model=List[RecentOrder])
async def get_recent_orders(current_user: User = Depends(get_current_admin_user)):
    try:
        db = get_database()
        recent_orders = await db.orders.find().sort("created_at", -1).limit(5).to_list(length=5)
        
        # Format orders to match the schema
        formatted_orders = []
        for order in recent_orders:
            # Get user information
            user = await db.users.find_one({"_id": ObjectId(order["user_id"])})
            
            formatted_order = {
                "_id": str(order["_id"]),
                "user_id": str(order["user_id"]),
                "user": {
                    "_id": str(user["_id"]),
                    "full_name": user.get("full_name", "Unknown User"),
                    "email": user.get("email", "")
                },
                "items": [
                    {
                        "product_id": str(item["product_id"]),
                        "product_name": item["product_name"],
                        "quantity": item["quantity"],
                        "price": item["price"]
                    }
                    for item in order["items"]
                ],
                "total_price": order["total_price"],
                "shipping_address": order["shipping_address"],
                "status": order["status"],
                "created_at": order["created_at"],
                "updated_at": order["updated_at"]
            }
            formatted_orders.append(formatted_order)
        
        return formatted_orders
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/products/top", response_model=List[TopProduct])
async def get_top_products(current_user: User = Depends(get_current_admin_user)):
    try:
        db = get_database()
        
        # Get all completed and delivered orders (excluding archived)
        completed_orders = await db.orders.find({
            "status": {"$in": ["completed", "delivered"]}
        }).to_list(length=None)
        
        # Calculate product sales
        product_sales = {}
        for order in completed_orders:
            for item in order.get("items", []):
                product_id = str(item["product_id"])
                if product_id not in product_sales:
                    product_sales[product_id] = {"quantity": 0, "revenue": 0}
                product_sales[product_id]["quantity"] += item["quantity"]
                product_sales[product_id]["revenue"] += item["price"] * item["quantity"]

        # Get top 5 products
        top_products = []
        for product_id, sales in sorted(
            product_sales.items(),
            key=lambda x: x[1]["revenue"],
            reverse=True
        )[:5]:
            product = await db.products.find_one({"_id": ObjectId(product_id)})
            if product:
                top_products.append({
                    "_id": product_id,
                    "name": product.get("name", "Unknown Product"),
                    "total_sales": sales["quantity"],
                    "revenue": sales["revenue"],
                    "image_url": product.get("images", [""])[0]
                })

        return top_products
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/payments", response_model=List[Payment])
async def get_payments(
    current_user: User = Depends(get_current_admin_user),
    skip: int = 0,
    limit: int = 100
):
    try:
        db = get_database()
        payments = await db.payments.find().skip(skip).limit(limit).to_list(length=limit)
        
        # Format payments to include user information
        formatted_payments = []
        for payment in payments:
            user = await db.users.find_one({"_id": ObjectId(payment["user_id"])})
            formatted_payment = {
                "_id": str(payment["_id"]),
                "order_id": str(payment["order_id"]),
                "amount": payment["amount"],
                "status": payment["status"],
                "payment_method": payment["payment_method"],
                "transaction_id": payment["transaction_id"],
                "created_at": payment["created_at"],
                "updated_at": payment["updated_at"],
                "user": {
                    "_id": str(user["_id"]),
                    "full_name": user.get("full_name", "Unknown User"),
                    "email": user.get("email", "")
                }
            }
            formatted_payments.append(formatted_payment)
        
        return formatted_payments
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/payments/{payment_id}/status", response_model=Payment)
async def update_payment_status(
    payment_id: str,
    status_update: PaymentStatusUpdate,
    current_user: User = Depends(get_current_admin_user)
):
    try:
        db = get_database()
        if not ObjectId.is_valid(payment_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid payment ID"
            )
        
        payment = await db.payments.find_one({"_id": ObjectId(payment_id)})
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found"
            )
        
        # Update payment status
        result = await db.payments.update_one(
            {"_id": ObjectId(payment_id)},
            {
                "$set": {
                    "status": status_update.status,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update payment status"
            )
        
        # Get updated payment
        updated_payment = await db.payments.find_one({"_id": ObjectId(payment_id)})
        user = await db.users.find_one({"_id": ObjectId(updated_payment["user_id"])})
        
        return {
            "_id": str(updated_payment["_id"]),
            "order_id": str(updated_payment["order_id"]),
            "amount": updated_payment["amount"],
            "status": updated_payment["status"],
            "payment_method": updated_payment["payment_method"],
            "transaction_id": updated_payment["transaction_id"],
            "created_at": updated_payment["created_at"],
            "updated_at": updated_payment["updated_at"],
            "user": {
                "_id": str(user["_id"]),
                "full_name": user.get("full_name", "Unknown User"),
                "email": user.get("email", "")
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/orders/archived", response_model=List[RecentOrder])
async def get_archived_orders(current_user: User = Depends(get_current_admin_user)):
    try:
        db = get_database()
        archived_orders = await db.orders.find({"status": "archived"}).sort("archived_at", -1).limit(20).to_list(length=20)
        
        # Format orders to match the schema
        formatted_orders = []
        for order in archived_orders:
            # Get user information
            user = await db.users.find_one({"_id": ObjectId(order["user_id"])})
            
            formatted_order = {
                "_id": str(order["_id"]),
                "user_id": str(order["user_id"]),
                "user": {
                    "_id": str(user["_id"]) if user else "Unknown",
                    "full_name": user.get("full_name", "Unknown User") if user else "Unknown User",
                    "email": user.get("email", "") if user else ""
                },
                "items": [
                    {
                        "product_id": str(item["product_id"]),
                        "product_name": item["product_name"],
                        "quantity": item["quantity"],
                        "price": item["price"]
                    }
                    for item in order.get("items", [])
                ],
                "total_price": order["total_price"],
                "shipping_address": order.get("shipping_address", ""),
                "status": order["status"],
                "created_at": order["created_at"],
                "updated_at": order["updated_at"],
                "archived_at": order.get("archived_at"),
                "archived_by": order.get("archived_by"),
                "archive_reason": order.get("archive_reason")
            }
            formatted_orders.append(formatted_order)
        
        return formatted_orders
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 