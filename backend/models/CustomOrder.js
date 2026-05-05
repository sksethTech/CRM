import mongoose from 'mongoose';

const customOrderSchema = new mongoose.Schema({
  customOrderId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer is required']
  },
  designConsultant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  requirements: {
    description: {
      type: String,
      required: true,
      trim: true
    },
    referenceImages: [String],
    metalPreference: {
      type: String,
      enum: ['gold', 'silver', 'platinum', 'rose-gold', 'white-gold']
    },
    gemstoneRequirements: {
      type: {
        type: String,
        enum: ['diamond', 'ruby', 'sapphire', 'emerald', 'pearl', 'other', 'none']
      },
      carat: Number,
      color: String,
      notes: String
    },
    budget: {
      type: Number,
      min: 0
    },
    deadline: Date,
    ringSize: String,
    style: {
      type: String,
      enum: ['traditional', 'modern', 'vintage', 'contemporary', 'custom']
    }
  },
  designFiles: [{
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['sketch', '3d-render', 'technical-drawing', 'photo']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    approved: {
      type: Boolean,
      default: false
    },
    approvedAt: Date,
    notes: String
  }],
  stages: [{
    name: {
      type: String,
      required: true,
      enum: ['inquiry', 'design-concept', 'design-approval', 'production', 'polishing', 'quality-check', 'ready', 'delivered']
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'approved'],
      default: 'pending'
    },
    startedAt: Date,
    completedAt: Date,
    approvedAt: Date,
    notes: String,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  pricing: {
    estimatedCost: {
      type: Number,
      min: 0
    },
    finalCost: {
      type: Number,
      min: 0
    },
    advancePaid: {
      type: Number,
      default: 0,
      min: 0
    },
    balanceDue: {
      type: Number
    }
  },
  payments: [{
    amount: {
      type: Number,
      required: true
    },
    method: {
      type: String,
      enum: ['cash', 'card', 'upi', 'bank-transfer', 'cheque']
    },
    date: {
      type: Date,
      default: Date.now
    },
    transactionId: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed'
    }
  }],
  status: {
    type: String,
    enum: ['inquiry', 'design', 'production', 'finishing', 'ready', 'delivered', 'cancelled'],
    default: 'inquiry'
  },
  timeline: {
    estimatedCompletion: Date,
    actualCompletion: Date
  },
  notes: String,
  internalNotes: String
}, {
  timestamps: true
});

// Indexes for better query performance
customOrderSchema.index({ customOrderId: 1 });
customOrderSchema.index({ customerId: 1 });
customOrderSchema.index({ status: 1 });
customOrderSchema.index({ createdAt: -1 });

// Generate custom order ID before saving
customOrderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('CustomOrder').countDocuments();
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    this.customOrderId = `CUST-${year}${month}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Calculate balance due before saving
customOrderSchema.pre('save', function(next) {
  if (this.pricing.finalCost !== undefined) {
    const totalPaid = this.payments
      .filter(p => p.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    this.pricing.balanceDue = this.pricing.finalCost - totalPaid - this.pricing.advancePaid;
  }
  next();
});

// Virtual for current stage
customOrderSchema.virtual('currentStage').get(function() {
  if (!this.stages || this.stages.length === 0) return null;
  return this.stages[this.stages.length - 1];
});

// Method to add stage
customOrderSchema.methods.addStage = async function(stageData) {
  this.stages.push(stageData);
  await this.save();
  return this;
};

// Method to update stage status
customOrderSchema.methods.updateStageStatus = async function(stageName, status, notes = '') {
  const stage = this.stages.find(s => s.name === stageName);
  if (!stage) {
    throw new Error(`Stage ${stageName} not found`);
  }
  
  stage.status = status;
  
  if (status === 'in-progress' && !stage.startedAt) {
    stage.startedAt = new Date();
  }
  
  if (status === 'completed' && !stage.completedAt) {
    stage.completedAt = new Date();
  }
  
  if (notes) {
    stage.notes = notes;
  }
  
  // Update overall status based on stage
  if (stageName === 'delivered' && status === 'completed') {
    this.status = 'delivered';
    this.timeline.actualCompletion = new Date();
  }
  
  await this.save();
  return this;
};

// Method to add payment
customOrderSchema.methods.addPayment = async function(paymentData) {
  this.payments.push(paymentData);
  await this.save();
  return this;
};

const CustomOrder = mongoose.model('CustomOrder', customOrderSchema);

export default CustomOrder;
