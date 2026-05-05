import mongoose from 'mongoose';

const interactionSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer is required']
  },
  type: {
    type: String,
    enum: ['call', 'email', 'meeting', 'whatsapp', 'visit', 'sms', 'other'],
    required: true
  },
  subject: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number, // in minutes
    min: 0
  },
  outcome: {
    type: String,
    trim: true
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  followUpNotes: String,
  attachments: [{
    url: String,
    name: String,
    type: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relatedTo: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel'
  },
  relatedModel: {
    type: String,
    enum: ['Order', 'Appointment', 'CustomOrder', null]
  },
  tags: [String],
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: 'neutral'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
interactionSchema.index({ customerId: 1 });
interactionSchema.index({ type: 1 });
interactionSchema.index({ date: -1 });
interactionSchema.index({ createdBy: 1 });
interactionSchema.index({ followUpRequired: 1, followUpDate: 1 });

// Virtual for customer details (populated)
interactionSchema.virtual('customer', {
  ref: 'Customer',
  localField: 'customerId',
  foreignField: '_id',
  justOne: true
});

// Static method to get interactions by customer
interactionSchema.statics.getByCustomer = function(customerId, limit = 50) {
  return this.find({ customerId })
    .populate('createdBy', 'firstName lastName email')
    .sort({ date: -1 })
    .limit(limit);
};

// Static method to get pending follow-ups
interactionSchema.statics.getPendingFollowUps = async function(userId = null) {
  const query = {
    followUpRequired: true,
    followUpDate: { $lte: new Date() }
  };
  
  if (userId) {
    query.createdBy = userId;
  }
  
  return this.find(query)
    .populate('customerId', 'firstName lastName email phone')
    .populate('createdBy', 'firstName lastName email')
    .sort({ followUpDate: 1 });
};

// Method to mark follow-up as complete
interactionSchema.methods.completeFollowUp = async function(notes = '') {
  this.followUpRequired = false;
  this.followUpNotes = notes;
  await this.save();
  return this;
};

const Interaction = mongoose.model('Interaction', interactionSchema);

export default Interaction;
