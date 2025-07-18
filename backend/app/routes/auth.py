from fastapi import APIRouter, Depends, HTTPException, status, Body, UploadFile
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
import uuid
import logging

# Helper function to format membership upgrade logs
def format_membership_log(log):
    return {
        "_id": str(log.get("_id")) if log.get("_id") is not None else None,
        "user_id": str(log.get("user_id")),
        "email": log.get("email"),
        "old_membership": log.get("old_membership"),
        "new_membership": log.get("new_membership"),
        "price": log.get("price"),
        "upgraded_at": log.get("upgraded_at").isoformat() if log.get("upgraded_at") else None,
        "status": log.get("status"),
        "payment_proof_url": log.get("payment_proof_url"),
    }

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

@router.post("/membership/upgrade", response_model=User)
async def upgrade_membership(
    membership: str = Body(..., embed=True, description="Membership tier: gold or diamond"),
    current_user: UserInDB = Depends(get_current_active_user)
):
    db = get_database()
    allowed_memberships = {"gold": 50, "diamond": float('inf')}
    prices = {"gold": 49000, "diamond": 199000}
    if membership not in allowed_memberships:
        raise HTTPException(status_code=400, detail="Invalid membership tier. Choose 'gold' or 'diamond'.")
    if current_user.membership == membership:
        raise HTTPException(status_code=400, detail=f"You already have {membership} membership.")

    old_membership = current_user.membership
    price = prices[membership]
    transaction_id = str(uuid.uuid4())
    status = "success"  # Simulate payment status
    upgraded_at = datetime.utcnow()

    # Simulate payment (in production, integrate with payment gateway)
    # Here, we just assume payment is successful
    # Update user membership and reset try_on_count
    update_data = {
        "membership": membership,
        # Optionally reset try_on_count or keep as is. Here, we keep the current count.
        # "try_on_count": 0,
        "updated_at": upgraded_at
    }
    await db.users.update_one({"_id": current_user.id}, {"$set": update_data})
    updated_user = await db.users.find_one({"_id": current_user.id})

    # Log the upgrade in the membership_upgrades collection
    log_entry = {
        "user_id": str(current_user.id),
        "email": current_user.email,
        "old_membership": old_membership,
        "new_membership": membership,
        "price": price,
        "upgraded_at": upgraded_at,
        "transaction_id": transaction_id,
        "status": status
    }
    await db.membership_upgrades.insert_one(log_entry)

    return User.from_db(UserInDB(**updated_user)) 

@router.post("/membership/upgrade-request")
async def request_membership_upgrade(
    membership: str = Body(..., embed=True, description="Membership tier: gold or diamond"),
    payment_proof: UploadFile = UploadFile(None),
    current_user: UserInDB = Depends(get_current_active_user)
):
    db = get_database()
    allowed_memberships = {"gold": 49000, "diamond": 199000}
    if membership not in allowed_memberships:
        raise HTTPException(status_code=400, detail="Invalid membership tier. Choose 'gold' or 'diamond'.")
    if current_user.membership == membership:
        raise HTTPException(status_code=400, detail=f"You already have {membership} membership.")

    # Prevent duplicate pending requests
    existing = await db.membership_upgrades.find_one({
        "user_id": str(current_user.id),
        "status": "pending"
    })
    if existing:
        logging.warning(f"Duplicate pending request attempt by user {current_user.id}")
        raise HTTPException(status_code=400, detail="You already have a pending upgrade request.")

    # Save payment proof if provided
    payment_proof_url = None
    if payment_proof:
        proof_filename = f"payment_proof_{current_user.id}_{membership}_{datetime.utcnow().timestamp()}_{payment_proof.filename}"
        proof_path = f"app/static/uploads/{proof_filename}"
        with open(proof_path, "wb") as f:
            f.write(await payment_proof.read())
        payment_proof_url = f"/static/uploads/{proof_filename}"

    # Log the upgrade request in the membership_upgrades collection
    log_entry = {
        "user_id": str(current_user.id),
        "email": current_user.email,
        "old_membership": current_user.membership,
        "new_membership": membership,
        "price": allowed_memberships[membership],
        "upgraded_at": datetime.utcnow(),
        "transaction_id": None,
        "status": "pending",
        "payment_proof_url": payment_proof_url
    }
    result = await db.membership_upgrades.insert_one(log_entry)
    created = await db.membership_upgrades.find_one({"_id": result.inserted_id})
    # Always include _id as string in the response
    if created:
        created["_id"] = str(created["_id"])
    logging.info(f"Created membership upgrade request for user {current_user.id} with id {result.inserted_id}")
    return {"message": "Upgrade request submitted. Awaiting admin approval.", "request": created} 

@router.get("/membership/upgrade-request/status")
async def get_latest_upgrade_request_status(current_user: UserInDB = Depends(get_current_active_user)):
    db = get_database()
    log = await db.membership_upgrades.find({"user_id": str(current_user.id)}).sort("upgraded_at", -1).to_list(length=1)
    if log:
        return log[0]
    return {"status": "none"} 