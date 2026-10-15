import asyncio
import os
from datetime import datetime
from app.models.user import User
from app.utils.auth import get_password_hash
from app.utils.database import connect_to_mongo, get_database

# Example values from .env.example that must never become a real admin password.
PLACEHOLDER_PASSWORDS = {"change-me", "changeme"}


async def create_admin():
    # Credentials come from the environment (.env); nothing is hard-coded.
    admin_email = (os.getenv("ADMIN_EMAIL") or "").strip()
    admin_password = os.getenv("ADMIN_PASSWORD") or ""

    if not admin_email or not admin_password:
        print("ADMIN_EMAIL or ADMIN_PASSWORD is not set: skipping admin user creation.")
        return
    if admin_password.strip().lower() in PLACEHOLDER_PASSWORDS:
        print("ADMIN_PASSWORD is still the example placeholder: skipping admin user creation. "
              "Set a strong ADMIN_PASSWORD in .env.")
        return

    await connect_to_mongo()
    db = get_database()
    admin = await db.users.find_one({"email": admin_email})
    if admin:
        print(f"Admin user already exists: {admin_email}")
        return
    hashed_pw = get_password_hash(admin_password)
    # Create admin document directly with hashed_password field
    admin_doc = {
        "email": admin_email,
        "hashed_password": hashed_pw,
        "name": "Admin",
        "role": "admin",
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    await db.users.insert_one(admin_doc)
    # Never log the password.
    print(f"Admin user created: {admin_email}")

if __name__ == "__main__":
    asyncio.run(create_admin()) 