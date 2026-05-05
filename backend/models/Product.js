import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['rings', 'necklaces', 'earrings', 'bracelets', 'pendants', 'bangles', 'custom']
  },
  subcategory: {
    type: String,
    enum: ['engagement', 'wedding', 'fashion', 'traditional', 'daily-wear']
  },
  metalType: {
    type: String,
    required: [true, 'Metal type is required'],
    enum: ['gold', 'silver', 'platinum', 'rose-gold', 'white-gold']
  },
  metalPurity: {
    type: String,
    required: [true, 'Metal purity is required'],
    enum: ['24K', '22K', '18K', '14K', '925', 'PT950', 'PT900']
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required'],
    min: 0
  },
  gemstones: [{
    type: {
      type: String,
      required: true,
      enum: ['diamond', 'ruby', 'sapphire', 'emerald', 'pearl', 'topaz', 'amethyst', 'other']
    },
    carat: Number,
    clarity: {
      type: String,
      enum: ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3']
    },
    color: String,
    cut: {
      type: String,
      enum: ['excellent', 'very-good', 'good', 'fair', 'poor']
    },
    certification: String,
    quantity: {
      type: Number,
      default: 1
    }
  }],
  pricing: {
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: 0
    },
    makingCharges: {
      type: Number,
      default: 0,
      min: 0
    },
    gst: {
      type: Number,
      default: 3,
      min: 0
    },
    finalPrice: {
      type: Number
    },
    discountTiers: [{
      minQuantity: {
        type: Number,
        default: 1
      },
      discountPercent: {
        type: Number,
        default: 0
      }
    }]
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  certificates: [String],
  stock: {
    available: {
      type: Boolean,
      default: true
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0
    },
    location: String,
    reorderLevel: {
      type: Number,
      default: 5
    }
  },
  collections: [String],
  tags: [String],
  status: {
    type: String,
    enum: ['active', 'discontinued', 'out-of-stock', 'coming-soon'],
    default: 'active'
  },
  featured: {
    type: Boolean,
    default: false
  },
  videoUrl: String
}, {
  timestamps: true
});

// Indexes for better query performance
productSchema.index({ sku: 1 });
productSchema.index({ category: 1 });
productSchema.index({ metalType: 1 });
productSchema.index({ status: 1 });
productSchema.index({ 'gemstones.type': 1 });
productSchema.index({ 'pricing.finalPrice': 1 });
productSchema.index({ featured: 1 });
productSchema.index({ createdAt: -1 });

// Calculate final price before saving
productSchema.pre('save', function(next) {
  if (this.pricing.basePrice) {
    const makingCharges = this.pricing.makingCharges || 0;
    const gstPercent = this.pricing.gst || 3;
    
    const subtotal = this.pricing.basePrice + makingCharges;
    const gstAmount = (subtotal * gstPercent) / 100;
    
    this.pricing.finalPrice = subtotal + gstAmount;
  }
  next();
});

// Virtual for total gemstone carats
productSchema.virtual('totalCarats').get(function() {
  if (!this.gemstones || this.gemstones.length === 0) return 0;
  return this.gemstones.reduce((total, gem) => total + (gem.carat || 0), 0);
});

// Method to check availability
productSchema.methods.isAvailable = function() {
  return this.status === 'active' && this.stock.available && this.stock.quantity > 0;
};

// Static method to search products
productSchema.statics.search = function(query) {
  const searchRegex = new RegExp(query, 'i');
  
  return this.find({
    $or: [
      { name: searchRegex },
      { sku: searchRegex },
      { description: searchRegex },
      { tags: searchRegex }
    ],
    status: 'active'
  });
};

const Product = mongoose.model('Product', productSchema);

export default Product;
