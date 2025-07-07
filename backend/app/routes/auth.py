from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta, datetime
from app.schemas.user import UserCreate, User, Token, LoginRequest, UserInDB, UserUpdate
from app.utils.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_active_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.utils.database import get_database
from bson import ObjectId

router = APIRouter()

@router.post("/register", response_model=User)
async def register(user: UserCreate):
    db = get_database()
    
    # Check if user already exists
    if await db.users.find_one({"email": user.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user_dict = user.model_dump()
    user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
    
    result = await db.users.insert_one(user_dict)
    created_user = await db.users.find_one({"_id": result.inserted_id})
    
    return User.from_db(UserInDB(**created_user))

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_database()
    
    # Use username field as email
    user = await db.users.find_one({"email": form_data.username})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user["_id"])},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=User)
async def read_users_me(current_user: UserInDB = Depends(get_current_active_user)):
    return User.from_db(current_user)

@router.put("/update-profile", response_model=User)
async def update_profile(
    profile_update: UserUpdate,
    current_user: User = Depends(get_current_active_user)
):
    db = get_database()
    now = datetime.utcnow()
    
    # Get the current user data
    current_user_data = await db.users.find_one({"_id": ObjectId(current_user.id)})
    if not current_user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prepare update data, only include fields that are provided
    update_data = {}
    if profile_update.name is not None:
        update_data["name"] = profile_update.name
    if profile_update.phone is not None:
        update_data["phone"] = profile_update.phone
    if profile_update.address is not None:
        update_data["address"] = profile_update.address
    if profile_update.shipping_address is not None:
        update_data["shipping_address"] = profile_update.shipping_address
    
    # Add updated_at timestamp
    update_data["updated_at"] = now
    
    # Only update if there are changes
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    # Update user profile
    result = await db.users.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to update profile")
    
    # Get updated user data
    updated_user = await db.users.find_one({"_id": ObjectId(current_user.id)})
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Return updated user data
    return User(
        id=str(updated_user["_id"]),
        email=updated_user["email"],
        name=updated_user["name"],
        phone=updated_user.get("phone"),
        address=updated_user.get("address"),
        shipping_address=updated_user.get("shipping_address"),
        role=updated_user.get("role", "user"),
        created_at=updated_user.get("created_at", now),
        updated_at=updated_user.get("updated_at", now)
    ) 