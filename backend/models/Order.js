import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: {
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
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    productName: {
      type: String,
      required: true
    },
    productSku: String,
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    unitPrice: {
      type: Number,
      required: true
    },
    customization: {
      ringSize: String,
      engraving: String,
      metalChange: String,
      notes: String
    },
    subtotal: {
      type: Number,
      required: true
    }
  }],
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      default: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    shippingCharges: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0
    }
  },
  payments: [{
    amount: {
      type: Number,
      required: true
    },
    method: {
      type: String,
      enum: ['cash', 'card', 'upi', 'bank-transfer', 'cheque'],
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    transactionId: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    notes: String
  }],
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'India'
    },
    phone: String
  },
  billingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'India'
    },
    phone: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-production', 'quality-check', 'ready', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  notes: String,
  internalNotes: String,
  estimatedDelivery: Date,
  actualDelivery: Date,
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  trackingInfo: {
    courierName: String,
    trackingNumber: String,
    trackingUrl: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ customerId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Order').countDocuments();
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    this.orderNumber = `ORD-${year}${month}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Calculate totals before saving
orderSchema.pre('save', function(next) {
  // Calculate subtotal
  this.pricing.subtotal = this.items.reduce((sum, item) => {
    return sum + (item.unitPrice * item.quantity);
  }, 0);
  
  // Calculate tax (GST)
  this.pricing.tax = (this.pricing.subtotal - this.pricing.discount) * 0.03; // 3% GST
  
  // Calculate total
  this.pricing.totalAmount = this.pricing.subtotal - this.pricing.discount + this.pricing.tax + this.pricing.shippingCharges;
  
  next();
});

// Virtual for total paid
orderSchema.virtual('totalPaid').get(function() {
  return this.payments
    .filter(p => p.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0);
});

// Virtual for balance due
orderSchema.virtual('balanceDue').get(function() {
  return this.pricing.totalAmount - this.totalPaid;
});

// Method to check if fully paid
orderSchema.methods.isFullyPaid = function() {
  return this.balanceDue <= 0;
};

// Method to add payment
orderSchema.methods.addPayment = async function(paymentData) {
  this.payments.push(paymentData);
  await this.save();
  
  // Update customer lifetime value if payment is completed
  if (paymentData.status === 'completed') {
    const Customer = mongoose.model('Customer');
    const customer = await Customer.findById(this.customerId);
    if (customer) {
      await customer.updateLifetimeValue();
    }
  }
  
  return this;
};

// Static method to get orders by status
orderSchema.statics.getByStatus = function(status) {
  return this.find({ status }).populate('customerId', 'firstName lastName email phone');
};

const Order = mongoose.model('Order', orderSchema);

export default Order;
