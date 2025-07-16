from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routes import auth, products, cart, orders, upload, admin, reports, virtual_makeup, consultation, beauty_tips, reviews
from app.utils.database import connect_to_mongo, close_mongo_connection

app = FastAPI(title="Flashion API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Mount static files
app.mount("/uploads", StaticFiles(directory="app/uploads"), name="uploads")
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Event handlers
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(cart.router, prefix="/api/cart", tags=["cart"])
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(upload.router, prefix="/api/upload", tags=["upload"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(reports.router, prefix="/api/admin", tags=["reports"])
app.include_router(virtual_makeup.router, prefix="/api/virtual-makeup", tags=["virtual-makeup"])
app.include_router(consultation.router, prefix="/api/consultations", tags=["consultations"])
app.include_router(beauty_tips.router, prefix="/api", tags=["beauty-tips"])
app.include_router(reviews.router, prefix="/api", tags=["reviews"])

@app.get("/")
async def root():
    return {"message": "Welcome to Flashion API"} 