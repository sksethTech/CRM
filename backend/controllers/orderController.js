import Order from '../models/Order.js';

// @desc    Get all orders with pagination and filters
// @route   GET /api/orders
// @access  Private
export const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    if (req.query.customerId) {
      query.customerId = req.query.customerId;
    }

    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const orders = await Order.find(query)
      .populate('customerId', 'firstName lastName email phone')
      .populate('assignedTo', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      count: orders.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'firstName lastName email phone addresses')
      .populate('items.productId', 'name sku images metalType gemstones')
      .populate('assignedTo', 'firstName lastName email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...order.toObject(),
        totalPaid: order.totalPaid,
        balanceDue: order.balanceDue
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    // Set assignedTo to current user if not provided
    if (!req.body.assignedTo && req.user) {
      req.body.assignedTo = req.user.id;
    }

    const order = await Order.create(req.body);

    // Update customer lifetime value
    const Customer = await import('../models/Customer.js');
    const customer = await Customer.default.findById(req.body.customerId);
    if (customer) {
      await customer.updateLifetimeValue();
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private
export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('customerId', 'firstName lastName email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        ...(notes && { notes }),
        ...(status === 'delivered' && { actualDelivery: new Date() })
      },
      { new: true, runValidators: true }
    ).populate('customerId', 'firstName lastName email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add payment to order
// @route   POST /api/orders/:id/payment
// @access  Private
export const addPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await order.addPayment(req.body);

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      data: {
        payments: order.payments,
        totalPaid: order.totalPaid,
        balanceDue: order.balanceDue
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private (Admin/Manager only)
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Cancel order instead of deleting
    order.status = 'cancelled';
    await order.save();

    // Update customer lifetime value
    const Customer = await import('../models/Customer.js');
    const customer = await Customer.default.findById(order.customerId);
    if (customer) {
      await customer.updateLifetimeValue();
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate invoice
// @route   GET /api/orders/:id/invoice
// @access  Private
export const generateInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'firstName lastName email phone addresses')
      .populate('items.productId');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // In production, generate PDF here using libraries like pdfkit or puppeteer
    // For now, return order data formatted for invoice
    res.json({
      success: true,
      data: {
        invoiceNumber: order.orderNumber,
        invoiceDate: order.createdAt,
        customer: order.customerId,
        items: order.items,
        pricing: order.pricing,
        payments: order.payments,
        totalPaid: order.totalPaid,
        balanceDue: order.balanceDue,
        status: order.status
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get orders by status
// @route   GET /api/orders/status/:status
// @access  Private
export const getOrdersByStatus = async (req, res) => {
  try {
    const orders = await Order.getByStatus(req.params.status);

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};
