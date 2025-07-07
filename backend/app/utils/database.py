import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from beanie import init_beanie
from app.models.order import Order
from app.models.payment import Payment
from app.models.product import Product
from app.models.category import Category
from app.models.user import User
from app.models.consultation import Consultation

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = "flashion"

client = None
database = None

async def connect_to_mongo():
    global client, database
    client = AsyncIOMotorClient(MONGODB_URL)
    database = client[DATABASE_NAME]
    await init_beanie(
        database=database,
        document_models=[
            Order,
            Payment,
            Product,
            Category,
            User,
            Consultation
        ]
    )
    print("Connected to MongoDB")

async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("Closed MongoDB connection")

def get_database():
    return database 