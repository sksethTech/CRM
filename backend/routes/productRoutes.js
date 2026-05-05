import express from 'express';
import { 
  getProducts, 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getCategories,
  searchProducts,
  getFeaturedProducts,
  updateStock
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/error.js';
import { 
  createProductValidator, 
  updateProductValidator 
} from '../middleware/validators.js';

const router = express.Router();

router.get('/categories', getCategories);
router.get('/search', searchProducts);
router.get('/featured', getFeaturedProducts);

router.route('/')
  .get(getProducts)
  .post(protect, authorize('admin', 'manager'), createProductValidator, validate, createProduct);

router.route('/:id')
  .get(getProduct)
  .put(protect, authorize('admin', 'manager'), updateProductValidator, validate, updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

router.patch('/:id/stock', protect, updateStock);

export default router;
