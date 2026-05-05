import express from 'express';
import { 
  getCustomers, 
  getCustomer, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer,
  getCustomerOrders,
  getCustomerInteractions,
  addToWishlist
} from '../controllers/customerController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/error.js';
import { 
  createCustomerValidator, 
  updateCustomerValidator 
} from '../middleware/validators.js';

const router = express.Router();

router.route('/')
  .get(protect, getCustomers)
  .post(protect, createCustomerValidator, validate, createCustomer);

router.route('/:id')
  .get(protect, getCustomer)
  .put(protect, updateCustomerValidator, validate, updateCustomer)
  .delete(protect, authorize('admin', 'manager'), deleteCustomer);

router.get('/:id/orders', protect, getCustomerOrders);
router.get('/:id/interactions', protect, getCustomerInteractions);
router.post('/:id/wishlist', protect, addToWishlist);

export default router;
