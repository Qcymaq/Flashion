from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.cart import Cart, CartItemCreate, CartItem
from app.schemas.user import User
from app.utils.auth import get_current_user
from app.utils.database import get_database
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=Cart)
async def get_cart(current_user: User = Depends(get_current_user)):
    db = get_database()
    cart = await db.carts.find_one({"user_id": ObjectId(current_user.id)})
    
    if not cart:
        # Create new cart if it doesn't exist
        cart = {
            "user_id": ObjectId(current_user.id),
            "items": [],
            "total_price": 0.0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await db.carts.insert_one(cart)
    
    # Convert ObjectId to string for Pydantic model
    cart["_id"] = str(cart["_id"])
    cart["user_id"] = str(cart["user_id"])
    for item in cart["items"]:
        item["_id"] = str(item["_id"])
        item["product_id"] = str(item["product_id"])
    
    return Cart(**cart)

@router.post("/items", response_model=Cart)
async def add_to_cart(
    item: CartItemCreate,
    current_user: User = Depends(get_current_user)
):
    db = get_database()
    
    # Get product details
    product = await db.products.find_one({"_id": ObjectId(item.product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if product has the selected color and size
    if item.color and item.color not in product.get("colors", []):
        raise HTTPException(status_code=400, detail="Selected color not available")
    
    # Get or create cart
    cart = await db.carts.find_one({"user_id": ObjectId(current_user.id)})
    if not cart:
        cart = {
            "user_id": ObjectId(current_user.id),
            "items": [],
            "total_price": 0.0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await db.carts.insert_one(cart)
    
    # Check if item already exists in cart
    existing_item = None
    for cart_item in cart["items"]:
        if (str(cart_item["product_id"]) == item.product_id and
            cart_item.get("color") == item.color):
            existing_item = cart_item
            break
    
    if existing_item:
        # Update quantity if item exists
        existing_item["quantity"] += item.quantity
        existing_item["updated_at"] = datetime.utcnow()
    else:
        # Add new item
        new_item = {
            "_id": ObjectId(),
            "product_id": ObjectId(item.product_id),
            "quantity": item.quantity,
            "color": item.color,
            "product_name": product["name"],
            "product_price": product["price"],
            "product_image": product["images"][0] if product.get("images") else "",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        cart["items"].append(new_item)
    
    # Update total price
    cart["total_price"] = sum(
        item["product_price"] * item["quantity"]
        for item in cart["items"]
    )
    cart["updated_at"] = datetime.utcnow()
    
    # Update cart in database
    await db.carts.update_one(
        {"_id": cart["_id"]},
        {"$set": cart}
    )
    
    # Convert ObjectId to string for response
    cart["_id"] = str(cart["_id"])
    cart["user_id"] = str(cart["user_id"])
    for item in cart["items"]:
        item["_id"] = str(item["_id"])
        item["product_id"] = str(item["product_id"])
    
    return Cart(**cart)

@router.put("/items/{item_id}", response_model=Cart)
async def update_cart_item(
    item_id: str,
    quantity: int,
    current_user: User = Depends(get_current_user)
):
    if quantity < 1:
        raise HTTPException(status_code=400, detail="Quantity must be at least 1")
    
    db = get_database()
    cart = await db.carts.find_one({"user_id": ObjectId(current_user.id)})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    # Find and update item
    item_found = False
    for item in cart["items"]:
        if str(item["_id"]) == item_id:
            item["quantity"] = quantity
            item["updated_at"] = datetime.utcnow()
            item_found = True
            break
    
    if not item_found:
        raise HTTPException(status_code=404, detail="Item not found in cart")
    
    # Update total price
    cart["total_price"] = sum(
        item["product_price"] * item["quantity"]
        for item in cart["items"]
    )
    cart["updated_at"] = datetime.utcnow()
    
    # Update cart in database
    await db.carts.update_one(
        {"_id": cart["_id"]},
        {"$set": cart}
    )
    
    # Convert ObjectId to string for response
    cart["_id"] = str(cart["_id"])
    cart["user_id"] = str(cart["user_id"])
    for item in cart["items"]:
        item["_id"] = str(item["_id"])
        item["product_id"] = str(item["product_id"])
    
    return Cart(**cart)

@router.delete("/items/{item_id}", response_model=Cart)
async def remove_from_cart(
    item_id: str,
    current_user: User = Depends(get_current_user)
):
    db = get_database()
    cart = await db.carts.find_one({"user_id": ObjectId(current_user.id)})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    # Remove item
    cart["items"] = [item for item in cart["items"] if str(item["_id"]) != item_id]
    
    # Update total price
    cart["total_price"] = sum(
        item["product_price"] * item["quantity"]
        for item in cart["items"]
    )
    cart["updated_at"] = datetime.utcnow()
    
    # Update cart in database
    await db.carts.update_one(
        {"_id": cart["_id"]},
        {"$set": cart}
    )
    
    # Convert ObjectId to string for response
    cart["_id"] = str(cart["_id"])
    cart["user_id"] = str(cart["user_id"])
    for item in cart["items"]:
        item["_id"] = str(item["_id"])
        item["product_id"] = str(item["product_id"])
    
    return Cart(**cart)

@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
async def clear_cart(current_user: User = Depends(get_current_user)):
    db = get_database()
    await db.carts.delete_one({"user_id": ObjectId(current_user.id)}) 