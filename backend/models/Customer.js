import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  alternatePhone: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  anniversary: {
    type: Date
  },
  addresses: [{
    type: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home'
    },
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'India'
    }
  }],
  preferences: {
    metalTypes: [{
      type: String,
      enum: ['gold', 'silver', 'platinum', 'rose-gold']
    }],
    gemstonePreferences: [String],
    stylePreferences: [{
      type: String,
      enum: ['traditional', 'modern', 'vintage', 'contemporary']
    }],
    ringSize: String,
    budgetRange: {
      type: String,
      enum: ['budget', 'mid-range', 'premium', 'luxury']
    }
  },
  customerTier: {
    type: String,
    enum: ['vip', 'regular', 'lead'],
    default: 'lead'
  },
  totalPurchases: {
    type: Number,
    default: 0
  },
  lifetimeValue: {
    type: Number,
    default: 0
  },
  notes: {
    type: String
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [String],
  status: {
    type: String,
    enum: ['active', 'inactive', 'blacklisted'],
    default: 'active'
  },
  wishlist: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
customerSchema.index({ email: 1 });
customerSchema.index({ phone: 1 });
customerSchema.index({ customerTier: 1 });
customerSchema.index({ status: 1 });
customerSchema.index({ assignedTo: 1 });
customerSchema.index({ createdAt: -1 });

// Virtual for full name
customerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Method to calculate lifetime value
customerSchema.methods.updateLifetimeValue = async function() {
  const Order = mongoose.model('Order');
  const orders = await Order.find({ 
    customerId: this._id, 
    status: { $ne: 'cancelled' } 
  });
  
  this.lifetimeValue = orders.reduce((sum, order) => {
    return sum + order.pricing.totalAmount;
  }, 0);
  
  this.totalPurchases = orders.length;
  
  // Update tier based on lifetime value
  if (this.lifetimeValue >= 500000) {
    this.customerTier = 'vip';
  } else if (this.lifetimeValue >= 100000) {
    this.customerTier = 'regular';
  }
  
  return this.save();
};

// Remove sensitive data when converting to JSON
customerSchema.methods.toJSON = function() {
  const customer = this.toObject();
  delete customer.__v;
  return customer;
};

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
