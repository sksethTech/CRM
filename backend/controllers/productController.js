import Product from '../models/Product.js';

// @desc    Get all products with pagination and filters
// @route   GET /api/products
// @access  Public (or Private for internal only)
export const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query
    const query = { status: 'active' };
    
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { name: searchRegex },
        { sku: searchRegex },
        { description: searchRegex }
      ];
    }
    
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    if (req.query.metalType) {
      query.metalType = req.query.metalType;
    }
    
    if (req.query.minPrice || req.query.maxPrice) {
      query['pricing.finalPrice'] = {};
      if (req.query.minPrice) query['pricing.finalPrice'].$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) query['pricing.finalPrice'].$lte = parseFloat(req.query.maxPrice);
    }
    
    if (req.query.gemstone) {
      query['gemstones.type'] = req.query.gemstone;
    }

    if (req.query.featured) {
      query.featured = req.query.featured === 'true';
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      count: products.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private (Admin/Manager only)
export const createProduct = async (req, res) => {
  try {
    // Check if SKU already exists
    const existing = await Product.findOne({ sku: req.body.sku.toUpperCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists'
      });
    }

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin/Manager only)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin only)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Soft delete - set status to discontinued
    product.status = 'discontinued';
    await product.save();

    res.json({
      success: true,
      message: 'Product discontinued successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    
    const categoryDetails = categories.map(cat => ({
      value: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1)
    }));

    res.json({
      success: true,
      data: categoryDetails
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const products = await Product.search(q).limit(20);

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload product images
// @route   POST /api/products/:id/images
// @access  Private
export const uploadImages = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Handle file uploads (assuming multer middleware is used)
    const images = req.files.map(file => ({
      url: file.path, // or file.location for S3/Cloudinary
      alt: file.originalname,
      isPrimary: product.images.length === 0
    }));

    product.images.push(...images);
    await product.save();

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      data: product.images
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    
    const products = await Product.find({ 
      featured: true, 
      status: 'active' 
    }).limit(limit);

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product stock
// @route   PATCH /api/products/:id/stock
// @access  Private
export const updateStock = async (req, res) => {
  try {
    const { quantity, action } = req.body; // action: 'set', 'add', 'subtract'
    
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (action === 'set') {
      product.stock.quantity = quantity;
    } else if (action === 'add') {
      product.stock.quantity += quantity;
    } else if (action === 'subtract') {
      product.stock.quantity = Math.max(0, product.stock.quantity - quantity);
    }

    product.stock.available = product.stock.quantity > 0 && product.status === 'active';
    await product.save();

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: product.stock
    });
  } catch (error) {
    next(error);
  }
};
