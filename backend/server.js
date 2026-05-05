import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

// Import database connection
import connectDB from './config/db.js';

// Import middleware
import { errorHandler, notFound } from './middleware/error.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import customOrderRoutes from './routes/customOrderRoutes.js';
import interactionRoutes from './routes/interactionRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/custom-orders', customOrderRoutes);
app.use('/api/v1/interactions', interactionRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Jewellery CRM API - Welcome!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      customers: '/api/v1/customers',
      products: '/api/v1/products',
      orders: '/api/v1/orders',
      appointments: '/api/v1/appointments',
      customOrders: '/api/v1/custom-orders',
      interactions: '/api/v1/interactions',
      dashboard: '/api/v1/dashboard'
    }
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   💎 Jewellery CRM Backend Server                         ║
║                                                           ║
║   🚀 Server running on port ${PORT}                        ║
║   📊 Environment: ${process.env.NODE_ENV || 'development'}                          ║
║   🗄️  Database: Connected                                 ║
║                                                           ║
║   API Endpoints:                                          ║
║   • Auth:         /api/v1/auth                            ║
║   • Customers:    /api/v1/customers                        ║
║   • Products:     /api/v1/products                         ║
║   • Orders:       /api/v1/orders                           ║
║   • Appointments: /api/v1/appointments                     ║
║   • Custom Orders:/api/v1/custom-orders                    ║
║   • Interactions: /api/v1/interactions                     ║
║   • Dashboard:    /api/v1/dashboard                        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Error: ${err.message}`);
  server.close(() => process.exit(1));
});

export default app;
