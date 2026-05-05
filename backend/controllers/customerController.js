import Customer from '../models/Customer.js';

// @desc    Get all customers with pagination and filters
// @route   GET /api/customers
// @access  Private
export const getCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    
    if (req.query.search) {
      query.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { phone: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    if (req.query.tier) {
      query.customerTier = req.query.tier;
    }
    
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    if (req.query.assignedTo) {
      query.assignedTo = req.query.assignedTo;
    }

    const customers = await Customer.find(query)
      .populate('assignedTo', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Customer.countDocuments(query);

    res.json({
      success: true,
      count: customers.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: customers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private
export const getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('wishlist.productId', 'name sku images pricing.finalPrice');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create customer
// @route   POST /api/customers
// @access  Private
export const createCustomer = async (req, res) => {
  try {
    // Check if customer with email already exists
    if (req.body.email) {
      const existing = await Customer.findOne({ email: req.body.email });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Customer with this email already exists'
        });
      }
    }

    // Set assignedTo to current user if not provided
    if (!req.body.assignedTo && req.user) {
      req.body.assignedTo = req.user.id;
    }

    const customer = await Customer.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
export const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'firstName lastName email');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private (Admin/Manager only)
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Soft delete - set status to inactive instead of deleting
    customer.status = 'inactive';
    await customer.save();

    res.json({
      success: true,
      message: 'Customer deactivated successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer orders
// @route   GET /api/customers/:id/orders
// @access  Private
export const getCustomerOrders = async (req, res) => {
  try {
    const Order = await import('../models/Order.js');
    
    const orders = await Order.default.find({ customerId: req.params.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer interactions
// @route   GET /api/customers/:id/interactions
// @access  Private
export const getCustomerInteractions = async (req, res) => {
  try {
    const Interaction = await import('../models/Interaction.js');
    
    const interactions = await Interaction.default.find({ customerId: req.params.id })
      .populate('createdBy', 'firstName lastName email')
      .sort({ date: -1 })
      .limit(50);

    res.json({
      success: true,
      count: interactions.length,
      data: interactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add note to customer
// @route   POST /api/customers/:id/notes
// @access  Private
export const addCustomerNote = async (req, res) => {
  try {
    const { notes } = req.body;

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { 
        $push: { 
          notes: { 
            text: notes, 
            addedBy: req.user.id, 
            addedAt: new Date() 
          } 
        } 
      },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Note added successfully',
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product to customer wishlist
// @route   POST /api/customers/:id/wishlist
// @access  Private
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check if already in wishlist
    const exists = customer.wishlist.find(
      item => item.productId.toString() === productId
    );

    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    customer.wishlist.push({ productId });
    await customer.save();

    res.json({
      success: true,
      message: 'Added to wishlist',
      data: customer
    });
  } catch (error) {
    next(error);
  }
};
