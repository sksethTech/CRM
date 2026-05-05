import express from 'express';
import { 
  getDashboardStats, 
  getSalesReport, 
  getTopProducts, 
  getCustomerInsights 
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', protect, getDashboardStats);
router.get('/sales-report', protect, getSalesReport);
router.get('/top-products', protect, getTopProducts);
router.get('/customer-insights', protect, getCustomerInsights);

export default router;
