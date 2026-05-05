# 💎 Jewellery CRM - MERN Stack

A complete Customer Relationship Management system built for jewellery brands using the MERN stack (MongoDB, Express.js, React, Node.js).

## 📋 Features

### Backend (Node.js + Express + MongoDB)
- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Customer Management**: Complete profiles with preferences, sizes, important dates
- **Product Catalog**: Jewellery-specific attributes (metals, gemstones, certifications)
- **Order Management**: Full workflow from pending to delivered
- **Appointment Scheduling**: Consultation booking system
- **Custom Orders**: Bespoke jewellery design workflow
- **Interaction Logging**: Track all customer communications
- **Dashboard Analytics**: Real-time business insights

### Frontend (React + Vite)
- **Modern UI**: Clean, responsive interface with Tailwind-like styling
- **Authentication Flow**: Login/Register pages with protected routes
- **Dashboard**: Overview with key metrics and quick actions
- **Customer Management**: CRUD operations with search functionality
- **Product Catalog**: Browse and filter jewellery items
- **Role-based Navigation**: Different views based on user role

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   React     │────▶│  Express.js  │────▶│  MongoDB    │
│  Frontend   │◀────│   Backend    │◀────│  Database   │
│  (Port 3000)│     │  (Port 5000) │     │             │
└─────────────┘     └──────────────┘     └─────────────┘
```

## 📁 Project Structure

```
/workspace/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Business logic (8 controllers)
│   ├── middleware/      # Auth, error handling, validation
│   ├── models/          # MongoDB schemas (7 models)
│   ├── routes/          # API endpoints (8 route files)
│   ├── .env.example     # Environment variables template
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # React context (AuthContext)
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service layer
│   │   ├── App.jsx      # Main app component
│   │   └── main.jsx     # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── SPECIFICATION.md     # Detailed implementation plan
└── README.md           # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- MongoDB running locally or MongoDB Atlas URI

### Backend Setup

```bash
cd /workspace/backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start development server
npm run dev
```

Backend will run on http://localhost:5000

### Frontend Setup

```bash
cd /workspace/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on http://localhost:3000

## 🔑 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/profile` - Get current user profile
- `PUT /api/v1/auth/profile` - Update profile
- `POST /api/v1/auth/logout` - Logout user

### Customers
- `GET /api/v1/customers` - List all customers
- `POST /api/v1/customers` - Create customer
- `GET /api/v1/customers/:id` - Get customer details
- `PUT /api/v1/customers/:id` - Update customer
- `DELETE /api/v1/customers/:id` - Delete customer

### Products
- `GET /api/v1/products` - List products
- `POST /api/v1/products` - Create product
- `GET /api/v1/products/:id` - Get product details
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product

### Orders
- `GET /api/v1/orders` - List orders
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders/:id` - Get order details
- `PUT /api/v1/orders/:id` - Update order status
- `POST /api/v1/orders/:id/payment` - Record payment

### Dashboard
- `GET /api/v1/dashboard/stats` - Get dashboard statistics

## 🔐 Default Credentials

After running the backend seed script or creating a user:
- Email: admin@jewellery.com
- Password: admin123

## 🛡️ Security Features

- JWT token authentication
- Password hashing with bcrypt
- Role-based access control (Admin, Manager, Sales, Designer, Viewer)
- Input validation with express-validator
- Rate limiting
- Helmet security headers
- CORS protection

## 📊 User Roles

1. **Admin**: Full access to all features
2. **Manager**: Manage orders, customers, appointments
3. **Sales**: Handle customers, orders, appointments
4. **Designer**: View custom orders, update designs
5. **Viewer**: Read-only access

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📝 Technologies Used

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Express-validator for validation

**Frontend:**
- React 18
- React Router v6
- Axios for HTTP requests
- Vite for build tooling
- CSS modules for styling

## 📄 License

MIT License - feel free to use this for your jewellery business!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
