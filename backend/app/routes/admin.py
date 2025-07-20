from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from typing import List, Optional
from datetime import datetime, timedelta
from bson import ObjectId
from pydantic import BaseModel, Field
from app.schemas.product import Product, ProductCreate
from app.schemas.user import User, UserInDB
from app.utils.database import get_database
from app.utils.auth import get_current_admin_user, get_password_hash
from app.routes.auth import password_reset_tokens, send_password_reset_email, send_password_reset_sms, password_reset_requests
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
import logging
import secrets

class ResetRevenueRequest(BaseModel):
    reason: str

class PasswordResetRequest(BaseModel):
    request_id: str
    user_id: str
    user_email: Optional[str]
    user_phone: Optional[str]
    user_name: Optional[str]
    requested_at: datetime
    expires_at: datetime
    status: str  # pending, completed, expired
    reset_method: str  # email, phone
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

    @classmethod
    def from_dict(cls, data: dict):
        return cls(**data)

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
        if str(current_user.id) == user_id:
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

@router.get("/users/memberships", response_model=List[User])
async def get_users_memberships(
    membership: str = None,
    current_user: User = Depends(get_current_admin_user),
    skip: int = 0,
    limit: int = 100
):
    db = get_database()
    query = {}
    if membership:
        query["membership"] = membership
    users = await db.users.find(query).skip(skip).limit(limit).to_list(length=limit)
    return [User.from_db(UserInDB(**user)) for user in users]

@router.patch("/users/{user_id}/membership")
async def update_user_membership(user_id: str, membership: str = Body(..., embed=True), current_user: User = Depends(get_current_admin_user)):
    db = get_database()
    if membership not in ["free", "gold", "diamond"]:
        raise HTTPException(status_code=400, detail="Invalid membership tier.")
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    result = await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"membership": membership, "updated_at": datetime.utcnow()}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Membership updated successfully"}

@router.post("/users", response_model=User)
async def create_user(
    user_data: dict = Body(...),
    current_user: User = Depends(get_current_admin_user)
):
    db = get_database()
    
    # Check if email already exists
    existing_user = await db.users.find_one({"email": user_data["email"]})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password if provided
    if "password" in user_data and user_data["password"]:
        user_data["hashed_password"] = get_password_hash(user_data["password"])
        del user_data["password"]
    
    # Set default values
    user_data["created_at"] = datetime.utcnow()
    user_data["updated_at"] = datetime.utcnow()
    user_data["is_active"] = user_data.get("is_active", True)
    user_data["role"] = user_data.get("role", "user")
    user_data["membership"] = user_data.get("membership", "free")
    
    result = await db.users.insert_one(user_data)
    created_user = await db.users.find_one({"_id": result.inserted_id})
    
    return User.from_db(UserInDB(**created_user))

@router.put("/users/{user_id}", response_model=User)
async def update_user(
    user_id: str,
    user_data: dict = Body(...),
    current_user: User = Depends(get_current_admin_user)
):
    db = get_database()
    
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    # Don't allow updating the current user's role to non-admin
    if str(current_user.id) == user_id and user_data.get("role") != "admin":
        raise HTTPException(status_code=400, detail="Cannot change your own role")
    
    # Check if email already exists (if email is being updated)
    if "email" in user_data:
        existing_user = await db.users.find_one({"email": user_data["email"], "_id": {"$ne": ObjectId(user_id)}})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password if provided
    if "password" in user_data and user_data["password"]:
        user_data["hashed_password"] = get_password_hash(user_data["password"])
        del user_data["password"]
    
    # Update timestamp
    user_data["updated_at"] = datetime.utcnow()
    
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": user_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    updated_user = await db.users.find_one({"_id": ObjectId(user_id)})
    return User.from_db(UserInDB(**updated_user))

@router.put("/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    status_data: dict = Body(...),
    current_user: User = Depends(get_current_admin_user)
):
    db = get_database()
    
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    # Don't allow deactivating your own account
    if str(current_user.id) == user_id and not status_data.get("is_active", True):
        raise HTTPException(status_code=400, detail="Cannot deactivate your own account")
    
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"is_active": status_data.get("is_active", True), "updated_at": datetime.utcnow()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User status updated successfully"}

class MembershipUpgradeLog(BaseModel):
    _id: str
    user_id: str
    email: str
    old_membership: str
    new_membership: str
    price: int
    upgraded_at: datetime
    status: str = "pending"
    payment_proof_url: Optional[str] = None

    class Config:
        from_attributes = True

    @classmethod
    def from_db(cls, db_obj):
        return cls(
            _id=str(db_obj.get("_id")),
            user_id=str(db_obj.get("user_id")),
            email=db_obj.get("email", ""),
            old_membership=db_obj.get("old_membership", ""),
            new_membership=db_obj.get("new_membership", ""),
            price=db_obj.get("price", 0),
            upgraded_at=db_obj.get("upgraded_at"),
            status=db_obj.get("status", "pending"),
            payment_proof_url=db_obj.get("payment_proof_url")
        )

# Simulate a collection for membership upgrades (in production, use a real collection)
# membership_upgrade_logs = []  # Removed unused in-memory list

# Remove /memberships/upgrades endpoint and manual formatting
# Only keep /memberships endpoint for fetching membership upgrade requests

@router.get("/memberships", response_model=List[MembershipUpgradeLog])
async def get_memberships(
    status: str = Query(None, description="Filter by status: pending, approved, denied, or all"),
    current_user: User = Depends(get_current_admin_user)
):
    db = get_database()
    query = {}
    if status and status != 'all':
        query["status"] = status
    logs = await db.membership_upgrades.find(query).sort("upgraded_at", -1).to_list(length=1000)
    return [MembershipUpgradeLog.from_db(log) for log in logs]

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

@router.post("/users/{user_id}/reset-password")
async def admin_reset_user_password(
    user_id: str,
    request: dict = Body(...),
    current_user: User = Depends(get_current_admin_user)
):
    """Admin endpoint to reset user password"""
    db = get_database()
    
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    
    new_password = request.get("new_password")
    if not new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password is required"
        )
    
    # Don't allow admin to reset their own password through this endpoint
    if str(current_user.id) == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Use the regular password reset for your own account"
        )
    
    # Find user
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update password
    hashed_password = get_password_hash(new_password)
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"hashed_password": hashed_password, "updated_at": datetime.utcnow()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update password"
        )
    
    # Log the password reset action
    logging.info(f"Admin {current_user.email} reset password for user {user.get('email')} (ID: {user_id})")
    
    return {"message": "User password has been reset successfully"}

@router.post("/users/{user_id}/send-reset-link")
async def admin_send_reset_link(
    user_id: str,
    current_user: User = Depends(get_current_admin_user)
):
    """Admin endpoint to send password reset link to user"""
    db = get_database()
    
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    
    # Find user
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)
    
    # Store reset token
    password_reset_tokens[reset_token] = {
        "user_id": str(user["_id"]),
        "email": user.get("email"),
        "phone": user.get("phone"),
        "expires_at": expires_at,
        "admin_initiated": True,
        "admin_email": current_user.email
    }
    
    # Send reset email or SMS
    success = False
    if user.get("email"):
        success = send_password_reset_email(user["email"], reset_token, user.get("name"))
    elif user.get("phone"):
        success = send_password_reset_sms(user["phone"], reset_token)
    
    if success:
        logging.info(f"Admin {current_user.email} sent reset link to user {user.get('email')} (ID: {user_id})")
        return {"message": "Password reset link has been sent to the user."}
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send password reset link"
        )

@router.get("/password-reset-requests", response_model=List[PasswordResetRequest])
async def get_password_reset_requests(
    status: str = Query(None, description="Filter by status: pending, completed, expired, or all"),
    current_user: User = Depends(get_current_admin_user)
):
    """Get all password reset requests for admin visibility"""
    try:
        requests_list = []
        
        for request_id, request_data in password_reset_requests.items():
            # Filter by status if specified
            if status and status != "all" and request_data.get("status") != status:
                continue
                
            # Check if expired
            if request_data.get("status") == "pending" and datetime.utcnow() > request_data.get("expires_at"):
                request_data["status"] = "expired"
            
            requests_list.append(PasswordResetRequest.from_dict(request_data))
        
        # Sort by requested_at (newest first)
        requests_list.sort(key=lambda x: x.requested_at, reverse=True)
        
        return requests_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/password-reset-requests/{request_id}", response_model=PasswordResetRequest)
async def get_password_reset_request(
    request_id: str,
    current_user: User = Depends(get_current_admin_user)
):
    """Get specific password reset request details"""
    try:
        if request_id not in password_reset_requests:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Password reset request not found"
            )
        
        request_data = password_reset_requests[request_id]
        
        # Check if expired
        if request_data.get("status") == "pending" and datetime.utcnow() > request_data.get("expires_at"):
            request_data["status"] = "expired"
        
        return PasswordResetRequest.from_dict(request_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/password-reset-requests/{request_id}")
async def revoke_password_reset_request(
    request_id: str,
    current_user: User = Depends(get_current_admin_user)
):
    """Revoke a password reset request (admin only)"""
    try:
        if request_id not in password_reset_requests:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Password reset request not found"
            )
        
        request_data = password_reset_requests[request_id]
        
        # Remove the token if it exists
        token = request_data.get("token")
        if token and token in password_reset_tokens:
            password_reset_tokens.pop(token, None)
        
        # Remove the request
        password_reset_requests.pop(request_id, None)
        
        logging.info(f"Admin {current_user.email} revoked password reset request {request_id} for user {request_data.get('user_email')}")
        
        return {"message": "Password reset request has been revoked"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/password-reset-requests/{request_id}/complete")
async def mark_password_reset_completed(
    request_id: str,
    current_user: User = Depends(get_current_admin_user)
):
    """Mark a password reset request as completed"""
    try:
        if request_id not in password_reset_requests:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Password reset request not found"
            )
        
        request_data = password_reset_requests[request_id]
        if request_data.get("status") != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Can only mark pending requests as completed"
            )
        
        # Update the request status
        request_data["status"] = "completed"
        request_data["completed_at"] = datetime.utcnow()
        
        logging.info(f"Admin {current_user.email} marked password reset request {request_id} as completed for user {request_data.get('user_email')}")
        
        return {"message": "Password reset request marked as completed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/password-reset-requests/{request_id}/delete")
async def delete_password_reset_request(
    request_id: str,
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a password reset request (any status)"""
    try:
        if request_id not in password_reset_requests:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Password reset request not found"
            )
        
        request_data = password_reset_requests[request_id]
        
        # Remove the request
        password_reset_requests.pop(request_id, None)
        
        # Also remove the associated token if it exists
        token = request_data.get("token")
        if token and token in password_reset_tokens:
            password_reset_tokens.pop(token, None)
        
        logging.info(f"Admin {current_user.email} deleted password reset request {request_id} for user {request_data.get('user_email')}")
        
        return {"message": "Password reset request deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/password-reset-stats")
async def get_password_reset_stats(current_user: User = Depends(get_current_admin_user)):
    """Get password reset statistics for admin dashboard"""
    try:
        total_requests = len(password_reset_requests)
        pending_requests = len([r for r in password_reset_requests.values() if r.get("status") == "pending"])
        completed_requests = len([r for r in password_reset_requests.values() if r.get("status") == "completed"])
        expired_requests = len([r for r in password_reset_requests.values() if r.get("status") == "expired"])
        
        # Count by method
        email_requests = len([r for r in password_reset_requests.values() if r.get("reset_method") == "email"])
        phone_requests = len([r for r in password_reset_requests.values() if r.get("reset_method") == "phone"])
        
        # Recent activity (last 24 hours)
        yesterday = datetime.utcnow() - timedelta(days=1)
        recent_requests = len([r for r in password_reset_requests.values() if r.get("requested_at") > yesterday])
        
        return {
            "total_requests": total_requests,
            "pending_requests": pending_requests,
            "completed_requests": completed_requests,
            "expired_requests": expired_requests,
            "email_requests": email_requests,
            "phone_requests": phone_requests,
            "recent_requests_24h": recent_requests
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 