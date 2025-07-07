# Flashion

Flashion is a full-stack e-commerce platform with a virtual makeup try-on feature. It consists of a React/TypeScript frontend and a FastAPI backend, supporting user authentication, product management, shopping cart, orders, and more.

## Features

- **Virtual Makeup Try-On:** Use your camera or upload photos to try on makeup virtually.
- **E-commerce Platform:** Browse products, manage a shopping cart, and place orders.
- **User Authentication:** Secure login and registration with JWT.
- **Admin Features:** Product and order management, role-based access control.
- **Modern UI:** Responsive design using Material-UI and smooth animations with Framer Motion.

## Project Structure

```
.
├── frontend/   # React + TypeScript client
├── backend/    # FastAPI server
├── environment.yml  # Python environment for backend
└── README.md   # (You are here)
```

## Getting Started

### Prerequisites

- Node.js & npm (for frontend)
- Python 3.11+ (for backend)
- MongoDB (for backend database)

---

### Backend Setup

1. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   # or use conda:
   conda env create -f environment.yml
   ```

3. **Configure environment variables:**  
   Create a `.env` file in the `backend/` directory:
   ```
   MONGODB_URL=mongodb://localhost:27017
   DATABASE_NAME=flashion
   SECRET_KEY=your-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

4. **Start MongoDB** (ensure it's running locally).

5. **Run the backend server:**
   ```bash
   uvicorn app.main:app --reload
   ```
   - API: http://localhost:8000
   - Docs: http://localhost:8000/docs

---

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```
   - App: http://localhost:3000

---

## API Overview

- **Authentication:** `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- **Products:** `/api/products`
- **Cart:** `/api/cart`
- **Orders:** `/api/orders`
- **Virtual Makeup:** `/api/virtual-makeup`
- ...and more (see backend/README.md for full list)

---

## Technologies Used

- **Frontend:** React, TypeScript, Material-UI, Framer Motion, React Router
- **Backend:** FastAPI, MongoDB, JWT, Beanie ODM
- **DevOps:** Uvicorn, Conda, npm

---

## Contributing

See individual `frontend/README.md` and `backend/README.md` for more details on contributing, running tests, and project structure.