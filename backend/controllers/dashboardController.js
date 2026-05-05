import Customer from '../models/Customer.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Appointment from '../models/Appointment.js';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    // Total customers by tier
    const vipCustomers = await Customer.countDocuments({ customerTier: 'vip' });
    const regularCustomers = await Customer.countDocuments({ customerTier: 'regular' });
    const leadCustomers = await Customer.countDocuments({ customerTier: 'lead' });
    const totalCustomers = await Customer.countDocuments();

    // Orders statistics
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const completedOrders = await Order.countDocuments({ 
      status: { $in: ['delivered', 'ready'] } 
    });
    
    // Revenue calculations
    const allOrders = await Order.find({ 
      status: { $ne: 'cancelled' } 
    }).select('pricing.totalAmount');
    
    const totalRevenue = allOrders.reduce((sum, order) => {
      return sum + order.pricing.totalAmount;
    }, 0);

    // Today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayAppointments = await Appointment.countDocuments({
      date: { $gte: today, $lt: tomorrow }
    });

    // Products count
    const totalProducts = await Product.countDocuments();
    const lowStockProducts = await Product.countDocuments({
      'stock.quantity': { $lte: 5 },
      status: 'active'
    });

    // Recent orders
    const recentOrders = await Order.find()
      .populate('customerId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);

    // Upcoming appointments
    const upcomingAppointments = await Appointment.find({
      date: { $gte: new Date() },
      status: { $in: ['scheduled', 'confirmed'] }
    })
      .populate('customerId', 'firstName lastName phone')
      .sort({ date: 1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        customers: {
          total: totalCustomers,
          vip: vipCustomers,
          regular: regularCustomers,
          leads: leadCustomers
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          completed: completedOrders
        },
        revenue: {
          total: totalRevenue,
          currency: 'INR'
        },
        appointments: {
          today: todayAppointments
        },
        products: {
          total: totalProducts,
          lowStock: lowStockProducts
        },
        recentOrders,
        upcomingAppointments
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sales report
// @route   GET /api/dashboard/sales-report
// @access  Private
export const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      status: { $ne: 'cancelled' }
    }).select('createdAt pricing.totalAmount');

    // Group sales by period
    const salesData = {};
    
    orders.forEach(order => {
      let key;
      const date = order.createdAt;
      
      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (groupBy === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else if (groupBy === 'year') {
        key = date.getFullYear().toString();
      }

      if (!salesData[key]) {
        salesData[key] = {
          period: key,
          revenue: 0,
          orders: 0
        };
      }
      
      salesData[key].revenue += order.pricing.totalAmount;
      salesData[key].orders += 1;
    });

    res.json({
      success: true,
      data: Object.values(salesData).sort((a, b) => a.period.localeCompare(b.period))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top selling products
// @route   GET /api/dashboard/top-products
// @access  Private
export const getTopProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const orders = await Order.find({
      status: { $ne: 'cancelled' }
    }).select('items');

    // Count product occurrences
    const productSales = {};
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.productId?.toString() || 'unknown';
        if (!productSales[productId]) {
          productSales[productId] = {
            productId,
            productName: item.productName,
            quantitySold: 0,
            revenue: 0
          };
        }
        productSales[productId].quantitySold += item.quantity;
        productSales[productId].revenue += item.subtotal;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);

    res.json({
      success: true,
      count: topProducts.length,
      data: topProducts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer insights
// @route   GET /api/dashboard/customer-insights
// @access  Private
export const getCustomerInsights = async (req, res) => {
  try {
    // New customers per month
    const customers = await Customer.find().select('createdAt customerTier');
    
    const newCustomersByMonth = {};
    customers.forEach(customer => {
      const key = `${customer.createdAt.getFullYear()}-${String(customer.createdAt.getMonth() + 1).padStart(2, '0')}`;
      newCustomersByMonth[key] = (newCustomersByMonth[key] || 0) + 1;
    });

    // Tier distribution
    const tierDistribution = {
      vip: await Customer.countDocuments({ customerTier: 'vip' }),
      regular: await Customer.countDocuments({ customerTier: 'regular' }),
      lead: await Customer.countDocuments({ customerTier: 'lead' })
    };

    // Top customers by lifetime value
    const topCustomers = await Customer.find()
      .sort({ lifetimeValue: -1 })
      .limit(10)
      .select('firstName lastName email lifetimeValue totalPurchases customerTier');

    res.json({
      success: true,
      data: {
        newCustomersByMonth: Object.entries(newCustomersByMonth).map(([period, count]) => ({
          period,
          count
        })).sort((a, b) => a.period.localeCompare(b.period)),
        tierDistribution,
        topCustomers
      }
    });
  } catch (error) {
    next(error);
  }
};
