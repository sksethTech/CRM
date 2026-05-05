import express from 'express';
import { 
  getCustomOrders, 
  getCustomOrder, 
  createCustomOrder, 
  updateCustomOrder, 
  updateStage,
  uploadDesignFile,
  approveDesignFile,
  addPayment,
  deleteCustomOrder
} from '../controllers/customOrderController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/error.js';
import { 
  createCustomOrderValidator,
  updateCustomOrderStageValidator
} from '../middleware/validators.js';

const router = express.Router();

router.route('/')
  .get(protect, getCustomOrders)
  .post(protect, createCustomOrderValidator, validate, createCustomOrder);

router.route('/:id')
  .get(protect, getCustomOrder)
  .put(protect, updateCustomOrder)
  .delete(protect, authorize('admin', 'manager'), deleteCustomOrder);

router.put('/:id/stage', protect, updateCustomOrderStageValidator, validate, updateStage);
router.post('/:id/files', protect, uploadDesignFile);
router.patch('/:id/files/:fileId/approve', protect, approveDesignFile);
router.post('/:id/payment', protect, addPayment);

export default router;
