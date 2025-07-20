import asyncio
import os
from datetime import datetime
from app.models.user import User
from app.utils.auth import get_password_hash
from app.utils.database import connect_to_mongo, get_database

ADMIN_EMAIL = "admin@flashion.com"
ADMIN_PASSWORD = "admin123"

async def create_admin():
    await connect_to_mongo()
    db = get_database()
    admin = await db.users.find_one({"email": ADMIN_EMAIL})
    if admin:
        print(f"Admin user already exists: {ADMIN_EMAIL}")
        return
    hashed_pw = get_password_hash(ADMIN_PASSWORD)
    # Create admin document directly with hashed_password field
    admin_doc = {
        "email": ADMIN_EMAIL,
        "hashed_password": hashed_pw,
        "name": "Admin",
        "role": "admin",
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    await db.users.insert_one(admin_doc)
    print(f"Admin user created: {ADMIN_EMAIL} / {ADMIN_PASSWORD}")

if __name__ == "__main__":
    asyncio.run(create_admin()) 