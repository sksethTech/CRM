import Interaction from '../models/Interaction.js';

// @desc    Get all interactions
// @route   GET /api/interactions
// @access  Private
export const getInteractions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const query = {};
    
    if (req.query.customerId) query.customerId = req.query.customerId;
    if (req.query.type) query.type = req.query.type;
    if (req.query.createdBy) query.createdBy = req.query.createdBy;

    const interactions = await Interaction.find(query)
      .populate('customerId', 'firstName lastName email phone')
      .populate('createdBy', 'firstName lastName email')
      .sort({ date: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Interaction.countDocuments(query);

    res.json({
      success: true,
      count: interactions.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: interactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single interaction
// @route   GET /api/interactions/:id
// @access  Private
export const getInteraction = async (req, res) => {
  try {
    const interaction = await Interaction.findById(req.params.id)
      .populate('customerId', 'firstName lastName email phone')
      .populate('createdBy', 'firstName lastName email');

    if (!interaction) {
      return res.status(404).json({
        success: false,
        message: 'Interaction not found'
      });
    }

    res.json({
      success: true,
      data: interaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create interaction
// @route   POST /api/interactions
// @access  Private
export const createInteraction = async (req, res) => {
  try {
    // Set createdBy to current user
    req.body.createdBy = req.user.id;

    const interaction = await Interaction.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Interaction logged successfully',
      data: interaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update interaction
// @route   PUT /api/interactions/:id
// @access  Private
export const updateInteraction = async (req, res) => {
  try {
    const interaction = await Interaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('customerId', 'firstName lastName email');

    if (!interaction) {
      return res.status(404).json({
        success: false,
        message: 'Interaction not found'
      });
    }

    res.json({
      success: true,
      message: 'Interaction updated successfully',
      data: interaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete interaction
// @route   DELETE /api/interactions/:id
// @access  Private
export const deleteInteraction = async (req, res) => {
  try {
    const interaction = await Interaction.findById(req.params.id);

    if (!interaction) {
      return res.status(404).json({
        success: false,
        message: 'Interaction not found'
      });
    }

    await interaction.deleteOne();

    res.json({
      success: true,
      message: 'Interaction deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get interactions by customer
// @route   GET /api/interactions/customer/:customerId
// @access  Private
export const getInteractionsByCustomer = async (req, res) => {
  try {
    const interactions = await Interaction.getByCustomer(req.params.customerId);

    res.json({
      success: true,
      count: interactions.length,
      data: interactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending follow-ups
// @route   GET /api/interactions/followups
// @access  Private
export const getPendingFollowUps = async (req, res) => {
  try {
    const followUps = await Interaction.getPendingFollowUps(req.user.id);

    res.json({
      success: true,
      count: followUps.length,
      data: followUps
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete follow-up
// @route   PATCH /api/interactions/:id/followup-complete
// @access  Private
export const completeFollowUp = async (req, res) => {
  try {
    const { notes } = req.body;
    const interaction = await Interaction.findById(req.params.id);

    if (!interaction) {
      return res.status(404).json({
        success: false,
        message: 'Interaction not found'
      });
    }

    await interaction.completeFollowUp(notes);

    res.json({
      success: true,
      message: 'Follow-up completed',
      data: interaction
    });
  } catch (error) {
    next(error);
  }
};
