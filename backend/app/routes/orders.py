from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from app.schemas.order import Order, OrderCreate, OrderStatus, PaymentStatus, PaymentMethod
from app.schemas.user import User
from app.utils.database import get_database
from app.utils.auth import get_current_active_user
import hashlib
import hmac
import json
import requests
from urllib.parse import urlencode
from pydantic import BaseModel

router = APIRouter()

# Payment configuration
MOMO_PARTNER_CODE = "MOMO"
MOMO_ACCESS_KEY = "F8BBA842ECF85"
MOMO_SECRET_KEY = "K951B6PE1waDMi640xX08PD3vg6EkVlz"
MOMO_ENDPOINT = "https://test-payment.momo.vn/v2/gateway/api/create"

VNPAY_TMN_CODE = "2QXUI4J4"
VNPAY_HASH_SECRET = "KNPLWSWZQZQZQZQZQZQZQZQZQZQZQZQZQ"
VNPAY_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
VNPAY_RETURN_URL = "http://localhost:3000/payment/vnpay/return"

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price: float

class PaginatedOrdersResponse(BaseModel):
    orders: List[Order]
    total: int
    has_more: bool

@router.post("/", response_model=Order)
async def create_order(
    order: OrderCreate,
    current_user: User = Depends(get_current_active_user)
):
    db = get_database()
    
    # Verify all products exist and are in stock
    for item in order.items:
        product = await db.products.find_one({"_id": ObjectId(item.product_id)})
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product {item.product_id} not found"
            )
        if product["stock"] < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Not enough stock for product {product['name']}"
            )
        # Add product name to the order item
        item.product_name = product["name"]
    
    # Create order
    order_dict = order.dict()
    order_dict["user_id"] = str(current_user.id)  # Ensure user_id is set correctly
    order_dict["created_at"] = datetime.utcnow()
    order_dict["updated_at"] = datetime.utcnow()
    
    result = await db.orders.insert_one(order_dict)
    created_order = await db.orders.find_one({"_id": result.inserted_id})
    
    # Convert ObjectId to string
    created_order["_id"] = str(created_order["_id"])
    
    # Update product stock
    for item in order.items:
        await db.products.update_one(
            {"_id": ObjectId(item.product_id)},
            {"$inc": {"stock": -item.quantity}}
        )
    
    # Clear user's cart
    await db.carts.delete_one({"user_id": ObjectId(str(current_user.id))})
    
    return Order(**created_order)

@router.get("/", response_model=PaginatedOrdersResponse)
async def get_orders(
    current_user: User = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 10
):
    """
    Get all orders for the current user with pagination.
    Admin users can see all orders, regular users can only see their own orders.
    """
    try:
        db = get_database()
        # Admin can see all orders, users can only see their own
        query = {} if current_user.role == "admin" else {"user_id": str(current_user.id)}
        
        # Get orders with pagination
        orders = await db.orders.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)

        # Get total count of orders for pagination
        total_orders = await db.orders.count_documents(query)

        # Get product names for each item in each order
        for order in orders:
            for item in order["items"]:
                product = await db.products.find_one({"_id": ObjectId(item["product_id"])})
                if product:
                    item["product_name"] = product["name"]
                else:
                    item["product_name"] = "Sản phẩm không tồn tại"

        # Convert ObjectId to string for each order
        for order in orders:
            order["_id"] = str(order["_id"])
            order["user_id"] = str(order["user_id"])

        return {
            "orders": orders,
            "total": total_orders,
            "has_more": skip + limit < total_orders
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{order_id}", response_model=Order)
async def get_order(
    order_id: str,
    current_user: User = Depends(get_current_active_user)
):
    if not ObjectId.is_valid(order_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid order ID"
        )
    
    db = get_database()
    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if user has permission to view this order
    if current_user.role != "admin" and str(order["user_id"]) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this order"
        )
    
    # Convert ObjectId to string
    order["_id"] = str(order["_id"])
    
    # Fetch product names for each item
    for item in order["items"]:
        product = await db.products.find_one({"_id": ObjectId(item["product_id"])})
        if product:
            item["product_name"] = product["name"]
    
    return Order(**order)

@router.put("/{order_id}/status", response_model=Order)
async def update_order_status(
    order_id: str,
    status_update: dict,
    current_user: User = Depends(get_current_active_user)
):
    """
    Update order status. Only admin users can update order status.
    """
    try:
        # Check if user is admin
        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admin users can update order status"
            )

        # Validate order ID
        if not ObjectId.is_valid(order_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid order ID"
            )

        db = get_database()
        
        # Check if order exists
        order = await db.orders.find_one({"_id": ObjectId(order_id)})
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )

        # Validate status
        valid_statuses = ["pending", "processing", "shipped", "delivered", "cancelled"]
        new_status = status_update.get("status")
        if not new_status or new_status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )

        # Update order status
        updated_order = await db.orders.find_one_and_update(
            {"_id": ObjectId(order_id)},
            {
                "$set": {
                    "status": new_status,
                    "updated_at": datetime.utcnow()
                }
            },
            return_document=True
        )

        if not updated_order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )

        # Convert ObjectId to string
        updated_order["_id"] = str(updated_order["_id"])
        updated_order["user_id"] = str(updated_order["user_id"])

        # Get product names for each item
        for item in updated_order["items"]:
            product = await db.products.find_one({"_id": ObjectId(item["product_id"])})
            if product:
                item["product_name"] = product["name"]
            else:
                item["product_name"] = "Sản phẩm không tồn tại"

        return updated_order

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.put("/{order_id}/payment", response_model=Order)
async def update_payment_status(
    order_id: str,
    payment_status: PaymentStatus,
    transaction_id: str = None,
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update payment status"
        )
    
    if not ObjectId.is_valid(order_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid order ID"
        )
    
    db = get_database()
    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Update payment status
    order["payment_details"]["status"] = payment_status
    if transaction_id:
        order["payment_details"]["transaction_id"] = transaction_id
    order["updated_at"] = datetime.utcnow()
    
    await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": order}
    )
    
    return Order(**order)

@router.post("/{order_id}/payment")
async def create_payment(
    order_id: str,
    payment_method: PaymentMethod,
    current_user: User = Depends(get_current_active_user)
):
    db = get_database()
    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if str(order["user_id"]) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if payment_method == PaymentMethod.MOMO:
        return await create_momo_payment(order_id, current_user)
    elif payment_method == PaymentMethod.VNPAY:
        return await create_vnpay_payment(order_id, current_user)
    else:
        raise HTTPException(status_code=400, detail="Invalid payment method")

@router.post("/{order_id}/payment/momo")
async def create_momo_payment(
    order_id: str,
    current_user: User = Depends(get_current_active_user)
):
    db = get_database()
    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if str(order["user_id"]) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Prepare MoMo payment request
    order_info = f"Thanh toan don hang {order_id}"
    amount = str(order["total_amount"])
    order_id = str(order["_id"])
    request_id = str(ObjectId())
    extra_data = ""
    
    # Create signature
    raw_signature = f"partnerCode={MOMO_PARTNER_CODE}&accessKey={MOMO_ACCESS_KEY}&requestId={request_id}&amount={amount}&orderId={order_id}&orderInfo={order_info}&returnUrl={VNPAY_RETURN_URL}&ipnUrl={VNPAY_RETURN_URL}&extraData={extra_data}"
    signature = hmac.new(
        MOMO_SECRET_KEY.encode(),
        raw_signature.encode(),
        hashlib.sha256
    ).hexdigest()
    
    # Prepare request data
    request_data = {
        "partnerCode": MOMO_PARTNER_CODE,
        "accessKey": MOMO_ACCESS_KEY,
        "requestId": request_id,
        "amount": amount,
        "orderId": order_id,
        "orderInfo": order_info,
        "returnUrl": VNPAY_RETURN_URL,
        "ipnUrl": VNPAY_RETURN_URL,
        "extraData": extra_data,
        "requestType": "captureWallet",
        "signature": signature
    }
    
    try:
        # Send request to MoMo
        response = requests.post(MOMO_ENDPOINT, json=request_data)
        response.raise_for_status()
        payment_data = response.json()
        
        if payment_data.get("resultCode") != 0:
            raise HTTPException(status_code=400, detail=payment_data.get("message", "Payment creation failed"))
        
        # Update order with payment details
        await db.orders.update_one(
            {"_id": ObjectId(order_id)},
            {
                "$set": {
                    "payment_details": {
                        "method": PaymentMethod.MOMO,
                        "status": PaymentStatus.PENDING,
                        "transaction_id": request_id
                    },
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return {"payment_url": payment_data.get("payUrl")}
    except requests.RequestException as e:
        raise HTTPException(status_code=400, detail=f"Failed to create payment: {str(e)}")

@router.post("/{order_id}/payment/vnpay")
async def create_vnpay_payment(
    order_id: str,
    current_user: User = Depends(get_current_active_user)
):
    db = get_database()
    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if str(order["user_id"]) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Prepare VNPay payment request
    vnp_TmnCode = VNPAY_TMN_CODE
    vnp_Amount = str(order["total_amount"] * 100)  # Convert to smallest currency unit
    vnp_Command = "pay"
    vnp_CreateDate = datetime.utcnow().strftime('%Y%m%d%H%M%S')
    vnp_CurrCode = "VND"
    vnp_IpAddr = "127.0.0.1"  # Should be replaced with actual client IP
    vnp_Locale = "vn"
    vnp_OrderInfo = f"Thanh toan don hang {order_id}"
    vnp_OrderType = "other"
    vnp_ReturnUrl = VNPAY_RETURN_URL
    vnp_TxnRef = str(order["_id"])
    vnp_Version = "2.1.0"
    
    # Create input data
    inputData = {
        "vnp_Version": vnp_Version,
        "vnp_Command": vnp_Command,
        "vnp_TmnCode": vnp_TmnCode,
        "vnp_Amount": vnp_Amount,
        "vnp_CreateDate": vnp_CreateDate,
        "vnp_CurrCode": vnp_CurrCode,
        "vnp_IpAddr": vnp_IpAddr,
        "vnp_Locale": vnp_Locale,
        "vnp_OrderInfo": vnp_OrderInfo,
        "vnp_OrderType": vnp_OrderType,
        "vnp_ReturnUrl": vnp_ReturnUrl,
        "vnp_TxnRef": vnp_TxnRef
    }
    
    # Sort input data
    sorted_input = sorted(inputData.items())
    
    # Create hash data
    hashdata = "&".join(f"{key}={value}" for key, value in sorted_input)
    
    # Create signature
    hmac_obj = hmac.new(
        VNPAY_HASH_SECRET.encode(),
        hashdata.encode(),
        hashlib.sha512
    )
    vnp_SecureHash = hmac_obj.hexdigest()
    
    # Add signature to input data
    inputData["vnp_SecureHash"] = vnp_SecureHash
    
    # Create payment URL
    payment_url = f"{VNPAY_URL}?{urlencode(inputData)}"
    
    # Update order with payment details
    await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {
            "$set": {
                "payment_details": {
                    "method": PaymentMethod.VNPAY,
                    "status": PaymentStatus.PENDING,
                    "transaction_id": vnp_TxnRef
                },
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {"payment_url": payment_url}

@router.get("/payment/vnpay/return")
async def vnpay_return(
    request: Request,
    current_user: User = Depends(get_current_active_user)
):
    # Get all query parameters
    vnp_Params = dict(request.query_params)
    
    # Remove signature from parameters
    vnp_SecureHash = vnp_Params.pop("vnp_SecureHash", None)
    
    # Sort parameters
    sorted_params = sorted(vnp_Params.items())
    
    # Create hash data
    hashdata = "&".join(f"{key}={value}" for key, value in sorted_params)
    
    # Create signature
    hmac_obj = hmac.new(
        VNPAY_HASH_SECRET.encode(),
        hashdata.encode(),
        hashlib.sha512
    )
    secure_hash = hmac_obj.hexdigest()
    
    # Verify signature
    if secure_hash != vnp_SecureHash:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Get order ID from transaction reference
    order_id = vnp_Params.get("vnp_TxnRef")
    response_code = vnp_Params.get("vnp_ResponseCode")
    
    db = get_database()
    
    # Update order status based on response code
    if response_code == "00":
        await db.orders.update_one(
            {"_id": ObjectId(order_id)},
            {
                "$set": {
                    "payment_details.status": PaymentStatus.COMPLETED,
                    "status": OrderStatus.PROCESSING,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        return {"status": "success", "message": "Payment successful"}
    else:
        await db.orders.update_one(
            {"_id": ObjectId(order_id)},
            {
                "$set": {
                    "payment_details.status": PaymentStatus.FAILED,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        return {"status": "failed", "message": "Payment failed"}

@router.put("/{order_id}/cancel", response_model=Order)
async def cancel_order(
    order_id: str,
    current_user: User = Depends(get_current_active_user)
):
    if not ObjectId.is_valid(order_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid order ID"
        )
    
    db = get_database()
    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if user owns this order
    if str(order["user_id"]) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this order"
        )
    
    # Check if order can be cancelled (only pending orders can be cancelled)
    if order["status"] != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending orders can be cancelled"
        )
    
    # Update order status to cancelled
    update_data = {
        "status": "cancelled",
        "updated_at": datetime.utcnow()
    }
    
    await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": update_data}
    )
    
    # Get updated order
    updated_order = await db.orders.find_one({"_id": ObjectId(order_id)})
    updated_order["_id"] = str(updated_order["_id"])
    
    # Fetch product names for each item
    for item in updated_order["items"]:
        product = await db.products.find_one({"_id": ObjectId(item["product_id"])})
        if product:
            item["product_name"] = product["name"]
    
    return Order(**updated_order)

@router.delete("/{order_id}", response_model=Order)
async def delete_order(
    order_id: str,
    current_user: User = Depends(get_current_active_user)
):
    if not ObjectId.is_valid(order_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid order ID"
        )
    
    db = get_database()
    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if user has permission to delete this order
    if str(order["user_id"]) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this order"
        )
    
    # Only allow deletion of cancelled orders
    if order["status"] != "cancelled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only cancelled orders can be deleted"
        )
    
    # Fetch product names for each item before deletion
    for item in order["items"]:
        product = await db.products.find_one({"_id": ObjectId(item["product_id"])})
        if product:
            item["product_name"] = product["name"]
    
    # Convert ObjectId to string for response
    order["_id"] = str(order["_id"])
    
    # Delete the order
    await db.orders.delete_one({"_id": ObjectId(order_id)})
    
    return Order(**order) 