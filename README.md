# 🛍️ Flashion - E-commerce Platform

A modern e-commerce platform built with React, FastAPI, and MongoDB. Features include user management, product catalog, shopping cart, order management, admin dashboard, and virtual makeup try-on.

## 🚀 Features

### User Features
- **User Authentication** - Register, login, password reset
- **Product Browsing** - Browse products by category, search, filters
- **Shopping Cart** - Add, remove, update cart items
- **Order Management** - Place orders, track order status
- **Virtual Makeup** - Try-on makeup products virtually
- **Beauty Tips** - Read beauty advice and tips
- **Profile Management** - Update profile, change password
- **Membership System** - Free, Gold, Diamond tiers

### Admin Features
- **Dashboard** - Sales analytics, user statistics
- **Product Management** - Add, edit, delete products
- **Order Management** - Process orders, update status
- **User Management** - Manage users, reset passwords
- **Password Reset Requests** - Handle password reset requests manually
- **Category Management** - Manage product categories
- **Beauty Tips Management** - Create and manage beauty content

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **MongoDB** - NoSQL database
- **JWT** - Authentication
- **Pydantic** - Data validation
- **Python 3.9+**

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Material-UI** - Component library
- **React Router** - Navigation
- **Context API** - State management

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy

## 📋 Prerequisites

- Docker and Docker Compose
- Node.js 16+ (for local development)
- Python 3.9+ (for local development)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Flashion
```

### 2. Environment Setup
```bash
# Copy environment variables
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

### 3. Build and Run with Docker
```bash
# Build images (no cache)
docker-compose build --no-cache

# Start services
docker-compose up

# Or run in background
docker-compose up -d
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🔧 Configuration

### Environment Variables (.env)

Create a `.env` file in the root directory:

```env
# Database
MONGODB_URL=mongodb://localhost:27017/flashion
MONGODB_DATABASE=flashion

# JWT Security
SECRET_KEY=your-super-secret-jwt-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Server
HOST=0.0.0.0
PORT=8000
DEBUG=True

# CORS
ALLOWED_ORIGINS=http://localhost:3000

# Frontend
REACT_APP_API_URL=http://localhost:8000/api
```

## 📁 Project Structure

```
Flashion/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── models/         # Database models
│   │   ├── routes/         # API endpoints
│   │   ├── schemas/        # Pydantic schemas
│   │   └── utils/          # Utilities
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   └── utils/         # Utilities
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml      # Docker orchestration
├── .env.example           # Environment template
└── README.md
```

## 🔐 Authentication

### User Roles
- **User** - Regular customer access
- **Admin** - Full administrative access

### Default Admin Account
Create an admin user using the backend API or database directly.

## 🛒 Key Features Explained

### Password Reset Flow
1. User requests password reset via "Quên mật khẩu"
2. Admin sees request in admin dashboard
3. Admin manually handles password reset
4. Admin sends new password to user via email/SMS
5. User logs in with new password
6. User changes password in profile

### Virtual Makeup
- Try-on makeup products virtually
- Upload photos and apply makeup effects
- Save and share results

### Membership System
- **Free** - Basic access
- **Gold** - Premium features
- **Diamond** - VIP access

## 🐳 Docker Commands

```bash
# Build images
docker-compose build

# Start services
docker-compose up

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose build backend

# Access container shell
docker-compose exec backend bash
docker-compose exec frontend sh
```

## 🔍 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/change-password` - Change password

### Products
- `GET /api/products` - List products
- `GET /api/products/{id}` - Get product details
- `POST /api/admin/products` - Create product (admin)

### Orders
- `GET /api/orders` - List user orders
- `POST /api/orders` - Create order
- `PUT /api/admin/orders/{id}/status` - Update order status (admin)

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/password-reset-requests` - Password reset requests
- `PUT /api/admin/password-reset-requests/{id}/complete` - Mark request complete

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using the port
   lsof -i :3000
   lsof -i :8000
   
   # Kill process or change ports in .env
   ```

2. **MongoDB connection failed**
   ```bash
   # Check if MongoDB is running
   docker-compose ps
   
   # Restart MongoDB
   docker-compose restart mongodb
   ```

3. **Frontend not loading**
   ```bash
   # Check frontend logs
   docker-compose logs frontend
   
   # Rebuild frontend
   docker-compose build frontend --no-cache
   ```

### Development Mode

For local development without Docker:

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm start
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🤝 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

---

**Flashion** - Your Beauty, Your Style ✨