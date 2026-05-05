import { body, param, query } from 'express-validator';

// Customer validation rules
export const createCustomerValidator = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Invalid email format'),
  body('preferences.metalTypes').optional().isArray(),
  body('customerTier').optional().isIn(['vip', 'regular', 'lead']),
  body('status').optional().isIn(['active', 'inactive', 'blacklisted'])
];

export const updateCustomerValidator = [
  param('id').isMongoId().withMessage('Invalid customer ID'),
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail().withMessage('Invalid email format'),
  body('customerTier').optional().isIn(['vip', 'regular', 'lead']),
  body('status').optional().isIn(['active', 'inactive', 'blacklisted'])
];

// Product validation rules
export const createProductValidator = [
  body('sku').trim().toUpperCase().notEmpty().withMessage('SKU is required'),
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('category').isIn(['rings', 'necklaces', 'earrings', 'bracelets', 'pendants', 'bangles', 'custom']).withMessage('Invalid category'),
  body('metalType').isIn(['gold', 'silver', 'platinum', 'rose-gold', 'white-gold']).withMessage('Invalid metal type'),
  body('metalPurity').isIn(['24K', '22K', '18K', '14K', '925', 'PT950', 'PT900']).withMessage('Invalid metal purity'),
  body('weight').isFloat({ min: 0 }).withMessage('Weight must be a positive number'),
  body('pricing.basePrice').isFloat({ min: 0 }).withMessage('Base price must be a positive number'),
  body('stock.quantity').optional().isInt({ min: 0 }),
  body('status').optional().isIn(['active', 'discontinued', 'out-of-stock', 'coming-soon'])
];

export const updateProductValidator = [
  param('id').isMongoId().withMessage('Invalid product ID'),
  body('name').optional().trim().notEmpty(),
  body('category').optional().isIn(['rings', 'necklaces', 'earrings', 'bracelets', 'pendants', 'bangles', 'custom']),
  body('metalType').optional().isIn(['gold', 'silver', 'platinum', 'rose-gold', 'white-gold']),
  body('pricing.basePrice').optional().isFloat({ min: 0 }),
  body('status').optional().isIn(['active', 'discontinued', 'out-of-stock', 'coming-soon'])
];

// Order validation rules
export const createOrderValidator = [
  body('customerId').isMongoId().withMessage('Invalid customer ID'),
  body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
  body('items.*.productName').notEmpty().withMessage('Product name is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be positive'),
  body('pricing.discount').optional().isFloat({ min: 0 }),
  body('status').optional().isIn(['pending', 'confirmed', 'in-production', 'quality-check', 'ready', 'shipped', 'delivered', 'cancelled'])
];

export const updateOrderStatusValidator = [
  param('id').isMongoId().withMessage('Invalid order ID'),
  body('status').isIn(['pending', 'confirmed', 'in-production', 'quality-check', 'ready', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status')
];

export const addPaymentValidator = [
  param('id').isMongoId().withMessage('Invalid order ID'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
  body('method').isIn(['cash', 'card', 'upi', 'bank-transfer', 'cheque']).withMessage('Invalid payment method'),
  body('transactionId').optional().trim()
];

// Appointment validation rules
export const createAppointmentValidator = [
  body('customerId').isMongoId().withMessage('Invalid customer ID'),
  body('customerName').trim().notEmpty().withMessage('Customer name is required'),
  body('customerEmail').isEmail().normalizeEmail().withMessage('Invalid email'),
  body('customerPhone').trim().notEmpty().withMessage('Phone number is required'),
  body('appointmentType').isIn(['consultation', 'fitting', 'collection', 'viewing', 'repair']).withMessage('Invalid appointment type'),
  body('date').isISO8601().withMessage('Invalid date format'),
  body('timeSlot').trim().notEmpty().withMessage('Time slot is required'),
  body('duration').optional().isInt({ min: 15, max: 180 }),
  body('staffId').optional().isMongoId()
];

export const updateAppointmentValidator = [
  param('id').isMongoId().withMessage('Invalid appointment ID'),
  body('appointmentType').optional().isIn(['consultation', 'fitting', 'collection', 'viewing', 'repair']),
  body('status').optional().isIn(['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'])
];

// Custom Order validation rules
export const createCustomOrderValidator = [
  body('customerId').isMongoId().withMessage('Invalid customer ID'),
  body('requirements.description').trim().notEmpty().withMessage('Description is required'),
  body('requirements.budget').optional().isFloat({ min: 0 }),
  body('requirements.metalPreference').optional().isIn(['gold', 'silver', 'platinum', 'rose-gold', 'white-gold']),
  body('designConsultant').optional().isMongoId()
];

export const updateCustomOrderStageValidator = [
  param('id').isMongoId().withMessage('Invalid custom order ID'),
  body('stageName').isIn(['inquiry', 'design-concept', 'design-approval', 'production', 'polishing', 'quality-check', 'ready', 'delivered']).withMessage('Invalid stage name'),
  body('status').isIn(['pending', 'in-progress', 'completed', 'approved']).withMessage('Invalid status')
];

// Interaction validation rules
export const createInteractionValidator = [
  body('customerId').isMongoId().withMessage('Invalid customer ID'),
  body('type').isIn(['call', 'email', 'meeting', 'whatsapp', 'visit', 'sms', 'other']).withMessage('Invalid interaction type'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('followUpDate').optional().isISO8601().withMessage('Invalid follow-up date format')
];

// User validation rules
export const createUserValidator = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'manager', 'sales', 'designer', 'viewer']),
  body('phone').optional().trim()
];

export const loginValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required')
];
