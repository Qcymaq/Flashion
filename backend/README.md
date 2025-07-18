# Flashion Backend

This is the FastAPI backend for the Flashion e-commerce application.

## Setup
```

3. Create a `.env` file in the backend directory with the following variables:
```
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=flashion
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

4. Start MongoDB:
Make sure MongoDB is running on your system. You can download it from [MongoDB's website](https://www.mongodb.com/try/download/community).

5. Run the application:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.

## API Documentation

Once the server is running, you can access:
- Swagger UI documentation: `http://localhost:8000/docs`
- ReDoc documentation: `http://localhost:8000/redoc`

## Features

- User authentication with JWT
- Product management
- Shopping cart functionality
- Order management
- Role-based access control (admin/user)

## API Endpoints

### Authentication
- POST `/auth/register` - Register a new user
- POST `/auth/login` - Login and get access token
- GET `/auth/me` - Get current user info

### Products
- GET `/products` - List all products
- GET `/products/{id}` - Get product details
- POST `/products` - Create new product (admin only)
- PUT `/products/{id}` - Update product (admin only)
- DELETE `/products/{id}` - Delete product (admin only)

### Cart
- GET `/cart` - Get user's cart
- POST `/cart/items` - Add item to cart
- PUT `/cart/items/{id}` - Update cart item quantity
- DELETE `/cart/items/{id}` - Remove item from cart
- DELETE `/cart` - Clear cart

### Orders
- POST `/orders` - Create new order
- GET `/orders` - List user's orders
- GET `/orders/{id}` - Get order details
- PUT `/orders/{id}/status` - Update order status (admin only)
- PUT `/orders/{id}/payment` - Update payment status (admin only) 