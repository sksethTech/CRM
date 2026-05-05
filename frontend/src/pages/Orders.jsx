import { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    customerId: '',
    products: [],
    totalAmount: '',
    status: 'pending',
    paymentStatus: 'pending',
    notes: ''
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingOrder(null);
    setFormData({
      customerId: '',
      products: [],
      totalAmount: '',
      status: 'pending',
      paymentStatus: 'pending',
      notes: ''
    });
    setModalOpen(true);
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setFormData({
      customerId: order.customerId?._id || order.customerId,
      products: order.products || [],
      totalAmount: order.totalAmount,
      status: order.status,
      paymentStatus: order.paymentStatus,
      notes: order.notes || ''
    });
    setModalOpen(true);
  };

  const handleDelete = async (order) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await api.delete(`/orders/${order._id}`);
        fetchOrders();
      } catch (error) {
        alert('Error deleting order');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingOrder) {
        await api.put(`/orders/${editingOrder._id}`, formData);
      } else {
        await api.post('/orders', formData);
      }
      setModalOpen(false);
      fetchOrders();
    } catch (error) {
      alert('Error saving order');
    }
  };

  const columns = [
    { key: 'orderNumber', title: 'Order #', width: '120px' },
    { 
      key: 'customerId', 
      title: 'Customer', 
      width: '200px',
      render: (val) => val?.firstName ? `${val.firstName} ${val.lastName}` : 'N/A'
    },
    { 
      key: 'totalAmount', 
      title: 'Amount', 
      width: '120px',
      render: (val) => `$${parseFloat(val).toFixed(2)}`
    },
    { 
      key: 'status', 
      title: 'Status', 
      width: '120px',
      render: (val) => (
        <span className={`status-badge status-${val}`}>{val}</span>
      )
    },
    { 
      key: 'paymentStatus', 
      title: 'Payment', 
      width: '120px',
      render: (val) => (
        <span className={`status-badge payment-${val}`}>{val}</span>
      )
    },
    { 
      key: 'createdAt', 
      title: 'Date', 
      width: '150px',
      render: (val) => new Date(val).toLocaleDateString()
    }
  ];

  if (loading) return <div>Loading orders...</div>;

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1>🛒 Orders Management</h1>
        <p>Track and manage all customer orders</p>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        onAdd={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingOrder ? 'Edit Order' : 'Create New Order'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="order-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Customer</label>
              <select
                value={formData.customerId}
                onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                required
              >
                <option value="">Select Customer</option>
                {/* Would populate from customers API */}
              </select>
            </div>

            <div className="form-group">
              <label>Total Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.totalAmount}
                onChange={(e) => setFormData({...formData, totalAmount: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="form-group">
              <label>Payment Status</label>
              <select
                value={formData.paymentStatus}
                onChange={(e) => setFormData({...formData, paymentStatus: e.target.value})}
              >
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Notes</label>
              <textarea
                rows="4"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Additional notes..."
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              {editingOrder ? 'Update Order' : 'Create Order'}
            </button>
          </div>
        </form>
      </Modal>

      <style jsx>{`
        .orders-page {
          padding: 20px;
        }

        .page-header {
          margin-bottom: 30px;
        }

        .page-header h1 {
          font-size: 28px;
          color: #1a1a2e;
          margin: 0 0 8px 0;
        }

        .page-header p {
          color: #666;
          margin: 0;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .status-pending { background: #fff3cd; color: #856404; }
        .status-confirmed { background: #d1ecf1; color: #0c5460; }
        .status-processing { background: #cce5ff; color: #004085; }
        .status-shipped { background: #d4edda; color: #155724; }
        .status-delivered { background: #d4edda; color: #155724; }
        .status-cancelled { background: #f8d7da; color: #721c24; }

        .payment-pending { background: #fff3cd; color: #856404; }
        .payment-partial { background: #d1ecf1; color: #0c5460; }
        .payment-paid { background: #d4edda; color: #155724; }
        .payment-refunded { background: #f8d7da; color: #721c24; }

        .order-form .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          font-size: 14px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 10px 14px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
        }

        .btn-cancel {
          padding: 10px 24px;
          background: #f5f7fa;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .btn-cancel:hover {
          background: #e9ecef;
        }

        .btn-submit {
          padding: 10px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .btn-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
      `}</style>
    </div>
  );
};

export default Orders;
