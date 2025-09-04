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
import secrets
import smtplib
import re
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

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

def make_https_url(path: str) -> str:
    # If already a full URL, return as is
    if path.startswith("http://") or path.startswith("https://"):
        return path
    # Remove accidental duplicate domain
    if path.startswith("//flashion.xyz"):
        return f"https://flashion.xyz{path[14:]}"
    # Ensure single leading slash
    if not path.startswith("/"):
        path = "/" + path
    return f"https://flashion.xyz{path}"

router = APIRouter()

@router.post("/register", response_model=User)
async def register(user: UserCreate):
    db = get_database()
    
    # Check if user already exists by email or phone
    existing_user = await db.users.find_one({
        "$or": [
            {"email": user.email},
            {"phone": user.phone} if user.phone else {"_id": None}
        ]
    })
    
    if existing_user:
        if existing_user.get("email") == user.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        elif existing_user.get("phone") == user.phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number already registered"
            )
    
    # Create new user
    user_dict = user.model_dump()
    user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
    
    # If email field contains a phone number, move it to phone field
    if re.match(r'^(0|\+84)[3|5|7|8|9][0-9]{8}$', user.email):
        user_dict["phone"] = user.email
        user_dict["email"] = f"{user.email}@flashion.com"  # Create a unique email
    
    result = await db.users.insert_one(user_dict)
    created_user = await db.users.find_one({"_id": result.inserted_id})
    
    return User.from_db(UserInDB(**created_user))

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_database()
    
    # Check if username is email or phone number
    username = form_data.username
    
    # Try to find user by email first
    user = await db.users.find_one({"email": username})
    
    # If not found by email, try by phone number
    if not user:
        user = await db.users.find_one({"phone": username})
    
    # If still not found, try by phone number with @flashion.com suffix
    if not user and username.endswith('@flashion.com'):
        phone_number = username.replace('@flashion.com', '')
        user = await db.users.find_one({"phone": phone_number})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email or phone number not found",
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

    # Mark all previous pending requests as approved
    await db.membership_upgrades.update_many(
        {"user_id": str(current_user.id), "status": "pending"},
        {"$set": {"status": "approved"}}
    )

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

    # Mark all previous pending requests as approved
    await db.membership_upgrades.update_many(
        {"user_id": str(current_user.id), "status": "pending"},
        {"$set": {"status": "approved"}}
    )

    # Prevent duplicate pending requests (after marking previous as approved, this should not block new ones)
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
        payment_proof_url = make_https_url(f"/static/uploads/{proof_filename}")

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
    # Always include _id and user_id as string in the response
    if created:
        created["_id"] = str(created["_id"])
        if "user_id" in created:
            created["user_id"] = str(created["user_id"])
    logging.info(f"Created membership upgrade request for user {current_user.id} with id {result.inserted_id}")
    return {"message": "Upgrade request submitted. Awaiting admin approval.", "request": created} 

@router.get("/membership/upgrade-request/status")
async def get_latest_upgrade_request_status(current_user: UserInDB = Depends(get_current_active_user)):
    db = get_database()
    log = await db.membership_upgrades.find({"user_id": str(current_user.id)}).sort("upgraded_at", -1).to_list(length=1)
    if log:
        doc = log[0]
        # Convert ObjectId fields to string
        doc["_id"] = str(doc["_id"])
        if "user_id" in doc:
            doc["user_id"] = str(doc["user_id"])
        return doc
    return {"status": "none"} 

# Password reset token storage (in production, use Redis or database)
password_reset_tokens = {}

# Password reset requests tracking for admin visibility
password_reset_requests = {}

# Email configuration (simulated)
EMAIL_CONFIG = {
    "smtp_server": "smtp.gmail.com",
    "smtp_port": 587,
    "sender_email": "noreply@flashion.com",
    "sender_password": "your-app-password"  # In production, use environment variables
}

def send_password_reset_email(email: str, reset_token: str, user_name: str = None):
    """Send password reset email (simulated for development)"""
    try:
        # In production, implement actual email sending
        # Use HTTPS and your domain for production
        frontend_url = os.getenv("FRONTEND_URL", "https://flashion.xyz")
        reset_url = f"{frontend_url}/reset-password?token={reset_token}"
        
        # For development, just log the reset URL
        logging.info(f"Password reset email would be sent to {email}")
        logging.info(f"Reset URL: {reset_url}")
        
        # Simulate email sending
        return True
    except Exception as e:
        logging.error(f"Failed to send password reset email: {e}")
        return False

def send_password_reset_sms(phone: str, reset_token: str):
    """Send password reset SMS (simulated for development)"""
    try:
        # In production, integrate with SMS service
        logging.info(f"Password reset SMS would be sent to {phone}")
        logging.info(f"Reset token: {reset_token}")
        return True
    except Exception as e:
        logging.error(f"Failed to send password reset SMS: {e}")
        return False

@router.post("/forgot-password")
async def forgot_password(request: dict = Body(...)):
    """Request password reset via email or phone - Admin will handle manually"""
    db = get_database()
    
    email = request.get("email")
    phone = request.get("phone")
    
    if not email and not phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or phone number is required"
        )
    
    # Find user by email or phone
    query = {}
    if email:
        query["email"] = email
    elif phone:
        query["phone"] = phone
    
    user = await db.users.find_one(query)
    if not user:
        # Don't reveal if user exists or not for security
        return {"message": "If the account exists, a password reset request has been submitted. Please contact admin for assistance."}
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=24)  # Token expires in 24 hours for admin processing
    
    # Store reset token (in production, store in database)
    password_reset_tokens[reset_token] = {
        "user_id": str(user["_id"]),
        "email": user.get("email"),
        "phone": user.get("phone"),
        "expires_at": expires_at
    }
    
    # Track password reset request for admin visibility
    request_id = str(uuid.uuid4())
    password_reset_requests[request_id] = {
        "request_id": request_id,
        "user_id": str(user["_id"]),
        "user_email": user.get("email"),
        "user_phone": user.get("phone"),
        "user_name": user.get("name"),
        "requested_at": datetime.utcnow(),
        "expires_at": expires_at,
        "status": "pending",  # pending, completed, expired
        "reset_method": "email" if email else "phone",
        "token": reset_token
    }
    
    # Log the request for admin visibility
    logging.info(f"Password reset requested for user {user.get('email')} (ID: {user['_id']}) via {request_id}")
    
    # Don't send automatic email/SMS - admin will handle manually
    return {"message": "Password reset request has been submitted. Please contact admin for assistance."}

@router.post("/reset-password")
async def reset_password(request: dict = Body(...)):
    """Reset password using reset token"""
    db = get_database()
    
    token = request.get("token")
    new_password = request.get("new_password")
    
    if not token or not new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token and new password are required"
        )
    
    # Validate token
    token_data = password_reset_tokens.get(token)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    if datetime.utcnow() > token_data["expires_at"]:
        # Remove expired token
        password_reset_tokens.pop(token, None)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired"
        )
    
    # Update user password
    hashed_password = get_password_hash(new_password)
    result = await db.users.update_one(
        {"_id": ObjectId(token_data["user_id"])},
        {"$set": {"hashed_password": hashed_password, "updated_at": datetime.utcnow()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update password"
        )
    
    # Update password reset request status
    for request_id, request_data in password_reset_requests.items():
        if request_data.get("token") == token:
            request_data["status"] = "completed"
            request_data["completed_at"] = datetime.utcnow()
            logging.info(f"Password reset completed for user {request_data.get('user_email')} (Request ID: {request_id})")
            break
    
    # Remove used token
    password_reset_tokens.pop(token, None)
    
    return {"message": "Password has been reset successfully"}

@router.post("/validate-reset-token")
async def validate_reset_token(request: dict = Body(...)):
    """Validate reset token without resetting password"""
    token = request.get("token")
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token is required"
        )
    
    token_data = password_reset_tokens.get(token)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset token"
        )
    
    if datetime.utcnow() > token_data["expires_at"]:
        # Remove expired token
        password_reset_tokens.pop(token, None)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired"
        )
    
    return {"valid": True, "email": token_data.get("email"), "phone": token_data.get("phone")}

@router.post("/change-password")
async def change_password(
    request: dict = Body(...),
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Change password for logged-in user"""
    db = get_database()
    
    current_password = request.get("current_password")
    new_password = request.get("new_password")
    
    if not current_password or not new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password and new password are required"
        )
    
    # Verify current password
    if not verify_password(current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Validate new password (same as registration validation)
    if len(new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters long"
        )
    
    # Update password
    hashed_password = get_password_hash(new_password)
    result = await db.users.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": {"hashed_password": hashed_password, "updated_at": datetime.utcnow()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update password"
        )
    
    # Log the password change
    logging.info(f"User {current_user.email} changed their password")
    
    return {"message": "Password has been changed successfully"} 