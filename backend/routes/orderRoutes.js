import express from 'express';
import { 
  getOrders, 
  getOrder, 
  createOrder, 
  updateOrder, 
  updateOrderStatus,
  addPayment,
  deleteOrder,
  generateInvoice,
  getOrdersByStatus
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/error.js';
import { 
  createOrderValidator, 
  updateOrderStatusValidator,
  addPaymentValidator
} from '../middleware/validators.js';

const router = express.Router();

router.get('/status/:status', protect, getOrdersByStatus);

router.route('/')
  .get(protect, getOrders)
  .post(protect, createOrderValidator, validate, createOrder);

router.route('/:id')
  .get(protect, getOrder)
  .put(protect, updateOrder)
  .delete(protect, authorize('admin', 'manager'), deleteOrder);

router.put('/:id/status', protect, updateOrderStatusValidator, validate, updateOrderStatus);
router.post('/:id/payment', protect, addPaymentValidator, validate, addPayment);
router.get('/:id/invoice', protect, generateInvoice);

export default router;
