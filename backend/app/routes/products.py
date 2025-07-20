from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime
from bson import ObjectId
from app.schemas.product import Product, ProductCreate, ProductList
from app.utils.database import get_database
from app.utils.auth import get_current_active_user, get_current_admin_user
from app.schemas.user import User

router = APIRouter()

# Public endpoints - no authentication required
@router.get("/", response_model=ProductList)
async def get_products(
    category: str = None,
    sort: str = "newest",
    page: int = 1,
    limit: int = 12
):
    db = get_database()
    skip = (page - 1) * limit
    
    # Build query
    query = {"is_active": True}
    if category and category != "all":
        query["category"] = category
    
    # Build sort options
    sort_options = {
        "newest": [("created_at", -1)],
        "price-asc": [("price", 1)],
        "price-desc": [("price", -1)],
        "name-asc": [("name", 1)]
    }
    sort_order = sort_options.get(sort, sort_options["newest"])
    
    # Get total count for pagination
    total_count = await db.products.count_documents(query)
    total_pages = (total_count + limit - 1) // limit
    
    # Get products with pagination and sorting
    products = await db.products.find(query).sort(sort_order).skip(skip).limit(limit).to_list(length=limit)
    
    return {
        "products": [
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
                "rating": product.get("rating", 0),
                "reviews": product.get("reviews", 0),
                "created_at": product["created_at"],
                "updated_at": product["updated_at"]
            } for product in products
        ],
        "totalPages": total_pages,
        "currentPage": page,
        "totalProducts": total_count
    }

@router.get("/search", response_model=List[Product])
async def search_products(q: str, limit: int = 10):
    if not q or len(q) < 2:
        return []
        
    db = get_database()
    # Create a case-insensitive regex pattern for the search
    pattern = {"$regex": q, "$options": "i"}
    
    # Search in both name and description
    query = {
        "$or": [
            {"name": pattern},
            {"description": pattern}
        ],
        "is_active": True  # Only return active products
    }
    
    products = await db.products.find(query).limit(limit).to_list(length=limit)
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
            "rating": product.get("rating", 0),
            "reviews": product.get("reviews", 0),
            "created_at": product["created_at"],
            "updated_at": product["updated_at"]
        } for product in products
    ]

@router.get("/{product_id}", response_model=Product)
async def get_product(product_id: str):
    db = get_database()
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID"
        )
    
    product = await db.products.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    return {
        "_id": str(product["_id"]),
        "name": product["name"],
        "description": product["description"],
        "price": product["price"],
        "category": product["category"],
        "images": product["images"],
        "colors": product["colors"],
        "stock": product["stock"],
        "is_active": product["is_active"],
        "rating": product.get("rating", 0),
        "reviews": product.get("reviews", 0),
        "created_at": product["created_at"],
        "updated_at": product["updated_at"]
    }

# Admin-only endpoints - require admin authentication
@router.post("/", response_model=Product)
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
    
    return {
        "_id": str(created_product["_id"]),
        "name": created_product["name"],
        "description": created_product["description"],
        "price": created_product["price"],
        "category": created_product["category"],
        "images": created_product["images"],
        "colors": created_product["colors"],
        "stock": created_product["stock"],
        "is_active": created_product["is_active"],
        "rating": created_product.get("rating", 0),
        "reviews": created_product.get("reviews", 0),
        "created_at": created_product["created_at"],
        "updated_at": created_product["updated_at"]
    }

@router.put("/{product_id}", response_model=Product)
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

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
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