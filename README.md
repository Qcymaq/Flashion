# 🛍️ Flashion - E-commerce Platform

A modern e-commerce platform built with React, FastAPI, and MongoDB Atlas. Features include user management, product catalog, shopping cart, order management, admin dashboard, virtual makeup try-on, and comprehensive beauty content management.

## 🚀 Features

### User Features
- **User Authentication** - Register, login, password reset with admin approval
- **Product Browsing** - Browse products by category, search, filters with product summaries
- **Shopping Cart** - Add, remove, update cart items with persistent storage
- **Order Management** - Place orders, track order status, view order history
- **Virtual Makeup** - Try-on makeup products virtually with photo upload
- **Beauty Tips** - Read beauty advice, tips, and tutorials by category
- **Product Reviews** - Write and read product reviews (login required)
- **Profile Management** - Update profile, change password, view order history
- **Membership System** - Free, Gold, Diamond tiers with different benefits
- **Consultation Booking** - Book beauty consultations with professionals

### Admin Features
- **Dashboard** - Sales analytics, user statistics, revenue tracking
- **Product Management** - Add, edit, delete products with summary and description fields
- **Order Management** - Process orders, update status, view user details
- **User Management** - Manage users, reset passwords, view user profiles
- **Password Reset Requests** - Handle password reset requests manually
- **Category Management** - Manage product categories and beauty tip categories
- **Beauty Tips Management** - Create and manage beauty content with categories
- **Review Management** - Moderate product reviews and user feedback
- **Upload Management** - Handle file uploads for products and beauty tips

## 🎬 Demo Videos

### 1. **Frontend Tour (Public Access)**
*Complete walkthrough of all public pages and features without authentication*

![Frontend Tour](docs/media/frontend-tour.gif)

**What you'll see:**
- Homepage and navigation
- Product browsing and search
- Beauty tips and tutorials
- Virtual makeup interface
- Public product catalog
- Responsive design across devices

### 2. **Interactive Features Demo (User Experience)**
*Hands-on demonstration of core features and user interactions*

![Features Demo](docs/media/features-demo.gif)

**Features demonstrated:**
- User authentication and login
- Shopping cart and checkout
- Product reviews and ratings
- Admin panel functionality
- Order management
- Beauty tips creation
- User profile management

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework with automatic API documentation
- **MongoDB Atlas** - Cloud-hosted NoSQL database for persistent data storage
- **JWT** - Secure authentication with token-based sessions
- **Pydantic** - Data validation and serialization
- **Python 3.11+** - Latest Python features and performance
- **Motor** - Async MongoDB driver for high-performance database operations

### Frontend
- **React 18** - Latest React features with hooks and concurrent rendering
- **TypeScript** - Type safety and better development experience
- **Material-UI (MUI)** - Modern component library with custom theming
- **React Router** - Client-side routing and navigation
- **Context API** - State management for authentication and user data
- **Axios** - HTTP client for API communication

### DevOps & Infrastructure
- **Docker** - Containerization for consistent deployment
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy and static file serving
- **MongoDB Atlas** - Cloud database with automatic backups and scaling
- **GitHub** - Version control and deployment

## 📋 Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)
- MongoDB Atlas account (for production database)

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

# Edit .env file with your MongoDB Atlas configuration
nano .env
```

### 3. Build and Run with Docker
```bash
# Build images (no cache for clean build)
docker-compose build --no-cache

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 4. Access the Application
- **Frontend**: https://flashion.xyz
- **Backend API**: https://flashion.xyz/api
- **API Documentation**: https://flashion.xyz/docs

## 🔧 Configuration

### Environment Variables (.env)

Create a `.env` file in the root directory:

```env
# MongoDB Atlas Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/flashion?retryWrites=true&w=majority

# JWT Security
SECRET_KEY=your-super-secret-jwt-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Server
HOST=0.0.0.0
PORT=8000
DEBUG=False

# CORS
ALLOWED_ORIGINS=https://flashion.xyz,https://www.flashion.xyz

# Frontend
REACT_APP_API_URL=https://flashion.xyz/api
```

## 📁 Project Structure

```
Flashion/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── models/         # Database models (User, Product, Order, etc.)
│   │   ├── routes/         # API endpoints and business logic
│   │   ├── schemas/        # Pydantic schemas for data validation
│   │   ├── utils/          # Authentication, database, and utility functions
│   │   ├── static/         # File uploads and static assets
│   │   └── main.py         # FastAPI application entry point
│   ├── Dockerfile          # Backend container configuration
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/         # Page-level components
│   │   ├── contexts/      # React contexts for state management
│   │   ├── services/      # API service functions
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions and helpers
│   ├── public/            # Static assets and index.html
│   ├── Dockerfile         # Frontend container configuration
│   ├── nginx.conf         # Nginx configuration for production
│   └── package.json       # Node.js dependencies
├── docker-compose.yml      # Docker orchestration configuration
├── .gitignore             # Git ignore rules for production
└── README.md              # Project documentation
```

## 🔐 Authentication & Security

### User Roles
- **User** - Regular customer access with shopping and review capabilities
- **Admin** - Full administrative access to all system features

### Security Features
- JWT-based authentication with configurable expiration
- Password hashing with bcrypt
- CORS protection for cross-origin requests
- Input validation with Pydantic schemas
- File upload security and validation

## 🛒 Key Features Explained

### Product Management
- **Summary Field**: Brief product descriptions for main display
- **Detailed Description**: Comprehensive product information in dedicated tabs
- **Category Organization**: Hierarchical product categorization
- **Image Management**: Multiple product images with upload support

### Order System
- **User Information**: Complete user details in admin orders panel
- **Status Tracking**: Order lifecycle management (Pending, Processing, Shipped, Delivered)
- **Payment Integration**: Payment proof upload and verification
- **Shipping Management**: Address management and delivery tracking

### Beauty Tips System
- **Category Management**: Organized beauty content by topics
- **Fallback Categories**: Default categories when database is empty
- **Rich Content**: Text and image support for beauty tutorials
- **Admin Interface**: Easy content creation and management

### Virtual Makeup
- **Photo Upload**: User photo upload for makeup try-on
- **Real-time Processing**: Instant makeup effect application
- **Result Sharing**: Save and share makeup results
- **Product Integration**: Link virtual makeup to actual products

### Membership Tiers
- **Free Tier**: Basic access to products and beauty tips
- **Gold Tier**: Premium features and exclusive content
- **Diamond Tier**: VIP access with priority support

## 🐳 Docker Commands

```bash
# Build all services
docker-compose build --no-cache

# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Rebuild specific service
docker-compose build backend --no-cache
docker-compose build frontend --no-cache

# Access container shell
docker-compose exec backend bash
docker-compose exec frontend sh

# Check service status
docker-compose ps

# Restart specific service
docker-compose restart backend
```

## 🔍 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/change-password` - Change password (authenticated)

### Products
- `GET /api/products` - List products with pagination and search
- `GET /api/products/{id}` - Get product details
- `POST /api/admin/products` - Create product (admin only)
- `PUT /api/admin/products/{id}` - Update product (admin only)
- `DELETE /api/admin/products/{id}` - Delete product (admin only)

### Orders
- `GET /api/orders` - List user orders (authenticated)
- `POST /api/orders` - Create new order (authenticated)
- `GET /api/admin/orders/` - List all orders with user details (admin)
- `PUT /api/admin/orders/{id}/status` - Update order status (admin)

### Beauty Tips
- `GET /api/beauty-tips` - List beauty tips with pagination
- `GET /api/beauty-tips/{id}` - Get beauty tip details
- `GET /api/beauty-tips/categories/list` - Get available categories
- `POST /api/admin/beauty-tips` - Create beauty tip (admin)

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - User management
- `GET /api/admin/password-reset-requests` - Password reset requests
- `PUT /api/admin/password-reset-requests/{id}/complete` - Mark request complete

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check MongoDB Atlas connection
   # Verify network access and credentials
   # Check backend logs
   docker-compose logs backend
   ```

2. **Frontend Build Failed**
   ```bash
   # Clear Docker cache and rebuild
   docker-compose build frontend --no-cache
   
   # Check for TypeScript errors
   docker-compose logs frontend
   ```

3. **Service Not Starting**
   ```bash
   # Check service status
   docker-compose ps
   
   # View service logs
   docker-compose logs [service-name]
   
   # Restart service
   docker-compose restart [service-name]
   ```

### Development Mode

For local development without Docker:

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend
cd frontend
npm install
npm start
```

## 📝 Recent Updates

### v1.0 - Production Release
- ✅ Migrated to MongoDB Atlas cloud database
- ✅ Added product summary field for better UX
- ✅ Fixed admin orders panel user display
- ✅ Implemented fallback categories for beauty tips
- ✅ Added clear login prompts for reviews
- ✅ Enhanced beauty tip category management
- ✅ Cleaned project structure for production
- ✅ Comprehensive error handling and validation

## 📄 License

This project is licensed under the MIT License.

## 🤝 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation at `/docs` endpoint

---

**Flashion** - Your Beauty, Your Style ✨

*Built with ❤️ using modern web technologies*