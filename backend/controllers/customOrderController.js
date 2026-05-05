import CustomOrder from '../models/CustomOrder.js';

// @desc    Get all custom orders
// @route   GET /api/custom-orders
// @access  Private
export const getCustomOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    
    if (req.query.status) query.status = req.query.status;
    if (req.query.customerId) query.customerId = req.query.customerId;

    const customOrders = await CustomOrder.find(query)
      .populate('customerId', 'firstName lastName email phone')
      .populate('designConsultant', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await CustomOrder.countDocuments(query);

    res.json({
      success: true,
      count: customOrders.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: customOrders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single custom order
// @route   GET /api/custom-orders/:id
// @access  Private
export const getCustomOrder = async (req, res) => {
  try {
    const customOrder = await CustomOrder.findById(req.params.id)
      .populate('customerId', 'firstName lastName email phone addresses')
      .populate('designConsultant', 'firstName lastName email');

    if (!customOrder) {
      return res.status(404).json({
        success: false,
        message: 'Custom order not found'
      });
    }

    res.json({
      success: true,
      data: customOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create custom order
// @route   POST /api/custom-orders
// @access  Private
export const createCustomOrder = async (req, res) => {
  try {
    // Set design consultant to current user if not provided
    if (!req.body.designConsultant && req.user) {
      req.body.designConsultant = req.user.id;
    }

    // Initialize stages
    const initialStages = [
      { name: 'inquiry', status: 'completed', completedAt: new Date() },
      { name: 'design-concept', status: 'pending' },
      { name: 'design-approval', status: 'pending' },
      { name: 'production', status: 'pending' },
      { name: 'polishing', status: 'pending' },
      { name: 'quality-check', status: 'pending' },
      { name: 'ready', status: 'pending' },
      { name: 'delivered', status: 'pending' }
    ];

    req.body.stages = initialStages;

    const customOrder = await CustomOrder.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Custom order created successfully',
      data: customOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update custom order
// @route   PUT /api/custom-orders/:id
// @access  Private
export const updateCustomOrder = async (req, res) => {
  try {
    const customOrder = await CustomOrder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('customerId', 'firstName lastName email');

    if (!customOrder) {
      return res.status(404).json({
        success: false,
        message: 'Custom order not found'
      });
    }

    res.json({
      success: true,
      message: 'Custom order updated successfully',
      data: customOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update custom order stage
// @route   PUT /api/custom-orders/:id/stage
// @access  Private
export const updateStage = async (req, res) => {
  try {
    const { stageName, status, notes } = req.body;

    const customOrder = await CustomOrder.findById(req.params.id);

    if (!customOrder) {
      return res.status(404).json({
        success: false,
        message: 'Custom order not found'
      });
    }

    await customOrder.updateStageStatus(stageName, status, notes);

    res.json({
      success: true,
      message: `Stage ${stageName} updated to ${status}`,
      data: customOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload design file
// @route   POST /api/custom-orders/:id/files
// @access  Private
export const uploadDesignFile = async (req, res) => {
  try {
    const { url, type, notes } = req.body;

    const customOrder = await CustomOrder.findById(req.params.id);

    if (!customOrder) {
      return res.status(404).json({
        success: false,
        message: 'Custom order not found'
      });
    }

    customOrder.designFiles.push({
      url,
      type,
      notes
    });

    await customOrder.save();

    res.json({
      success: true,
      message: 'Design file uploaded successfully',
      data: customOrder.designFiles
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve design file
// @route   PATCH /api/custom-orders/:id/files/:fileId/approve
// @access  Private
export const approveDesignFile = async (req, res) => {
  try {
    const customOrder = await CustomOrder.findById(req.params.id);

    if (!customOrder) {
      return res.status(404).json({
        success: false,
        message: 'Custom order not found'
      });
    }

    const file = customOrder.designFiles.id(req.params.fileId);
    
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Design file not found'
      });
    }

    file.approved = true;
    file.approvedAt = new Date();
    await customOrder.save();

    res.json({
      success: true,
      message: 'Design file approved',
      data: file
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add payment to custom order
// @route   POST /api/custom-orders/:id/payment
// @access  Private
export const addPayment = async (req, res) => {
  try {
    const customOrder = await CustomOrder.findById(req.params.id);

    if (!customOrder) {
      return res.status(404).json({
        success: false,
        message: 'Custom order not found'
      });
    }

    await customOrder.addPayment(req.body);

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      data: {
        payments: customOrder.payments,
        balanceDue: customOrder.pricing.balanceDue
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete custom order
// @route   DELETE /api/custom-orders/:id
// @access  Private (Admin/Manager only)
export const deleteCustomOrder = async (req, res) => {
  try {
    const customOrder = await CustomOrder.findById(req.params.id);

    if (!customOrder) {
      return res.status(404).json({
        success: false,
        message: 'Custom order not found'
      });
    }

    customOrder.status = 'cancelled';
    await customOrder.save();

    res.json({
      success: true,
      message: 'Custom order cancelled successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
