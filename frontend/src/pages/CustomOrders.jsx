import { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';

const CustomOrders = () => {
  const [customOrders, setCustomOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  const [formData, setFormData] = useState({
    customerId: '',
    designType: '',
    metalType: '',
    gemstoneDetails: '',
    ringSize: '',
    specialInstructions: '',
    estimatedPrice: '',
    status: 'consultation',
    deliveryDate: ''
  });

  useEffect(() => {
    fetchCustomOrders();
  }, []);

  const fetchCustomOrders = async () => {
    try {
      const response = await api.get('/custom-orders');
      setCustomOrders(response.data.customOrders || []);
    } catch (error) {
      console.error('Error fetching custom orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingOrder(null);
    setFormData({
      customerId: '',
      designType: '',
      metalType: '',
      gemstoneDetails: '',
      ringSize: '',
      specialInstructions: '',
      estimatedPrice: '',
      status: 'consultation',
      deliveryDate: ''
    });
    setModalOpen(true);
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setFormData({
      customerId: order.customerId?._id || order.customerId,
      designType: order.designType,
      metalType: order.metalType,
      gemstoneDetails: order.gemstoneDetails || '',
      ringSize: order.ringSize || '',
      specialInstructions: order.specialInstructions || '',
      estimatedPrice: order.estimatedPrice,
      status: order.status,
      deliveryDate: order.deliveryDate ? new Date(order.deliveryDate).toISOString().split('T')[0] : ''
    });
    setModalOpen(true);
  };

  const handleDelete = async (order) => {
    if (window.confirm('Are you sure you want to delete this custom order?')) {
      try {
        await api.delete(`/custom-orders/${order._id}`);
        fetchCustomOrders();
      } catch (error) {
        alert('Error deleting custom order');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingOrder) {
        await api.put(`/custom-orders/${editingOrder._id}`, formData);
      } else {
        await api.post('/custom-orders', formData);
      }
      setModalOpen(false);
      fetchCustomOrders();
    } catch (error) {
      alert('Error saving custom order');
    }
  };

  const columns = [
    { 
      key: 'orderNumber', 
      title: 'Order #', 
      width: '100px'
    },
    { 
      key: 'customerId', 
      title: 'Customer', 
      width: '180px',
      render: (val) => val?.firstName ? `${val.firstName} ${val.lastName}` : 'N/A'
    },
    { 
      key: 'designType', 
      title: 'Design Type', 
      width: '150px'
    },
    { 
      key: 'metalType', 
      title: 'Metal', 
      width: '120px'
    },
    { 
      key: 'status', 
      title: 'Status', 
      width: '140px',
      render: (val) => (
        <span className={`status-badge status-${val}`}>{val}</span>
      )
    },
    { 
      key: 'estimatedPrice', 
      title: 'Est. Price', 
      width: '120px',
      render: (val) => `$${parseFloat(val).toFixed(2)}`
    },
    { 
      key: 'deliveryDate', 
      title: 'Delivery', 
      width: '130px',
      render: (val) => val ? new Date(val).toLocaleDateString() : 'TBD'
    }
  ];

  if (loading) return <div>Loading custom orders...</div>;

  return (
    <div className="custom-orders-page">
      <div className="page-header">
        <h1>✨ Custom Orders</h1>
        <p>Manage bespoke jewellery designs and production</p>
      </div>

      <DataTable
        columns={columns}
        data={customOrders}
        onAdd={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingOrder ? 'Edit Custom Order' : 'Create Custom Order'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="custom-order-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Customer</label>
              <select
                value={formData.customerId}
                onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                required
              >
                <option value="">Select Customer</option>
              </select>
            </div>

            <div className="form-group">
              <label>Design Type</label>
              <select
                value={formData.designType}
                onChange={(e) => setFormData({...formData, designType: e.target.value})}
                required
              >
                <option value="">Select Design</option>
                <option value="ring">Ring</option>
                <option value="necklace">Necklace</option>
                <option value="earrings">Earrings</option>
                <option value="bracelet">Bracelet</option>
                <option value="pendant">Pendant</option>
                <option value="brooch">Brooch</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Metal Type</label>
              <select
                value={formData.metalType}
                onChange={(e) => setFormData({...formData, metalType: e.target.value})}
                required
              >
                <option value="">Select Metal</option>
                <option value="gold-14k-yellow">14K Yellow Gold</option>
                <option value="gold-14k-white">14K White Gold</option>
                <option value="gold-14k-rose">14K Rose Gold</option>
                <option value="gold-18k-yellow">18K Yellow Gold</option>
                <option value="gold-18k-white">18K White Gold</option>
                <option value="gold-18k-rose">18K Rose Gold</option>
                <option value="platinum">Platinum</option>
                <option value="silver">Sterling Silver</option>
              </select>
            </div>

            <div className="form-group">
              <label>Ring Size</label>
              <input
                type="text"
                value={formData.ringSize}
                onChange={(e) => setFormData({...formData, ringSize: e.target.value})}
                placeholder="e.g., 6.5"
              />
            </div>

            <div className="form-group">
              <label>Estimated Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.estimatedPrice}
                onChange={(e) => setFormData({...formData, estimatedPrice: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Delivery Date</label>
              <input
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="consultation">Consultation</option>
                <option value="design-approved">Design Approved</option>
                <option value="in-production">In Production</option>
                <option value="quality-check">Quality Check</option>
                <option value="ready">Ready for Pickup</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Gemstone Details</label>
              <textarea
                rows="3"
                value={formData.gemstoneDetails}
                onChange={(e) => setFormData({...formData, gemstoneDetails: e.target.value})}
                placeholder="Diamond, sapphire, emerald details..."
              />
            </div>

            <div className="form-group full-width">
              <label>Special Instructions</label>
              <textarea
                rows="4"
                value={formData.specialInstructions}
                onChange={(e) => setFormData({...formData, specialInstructions: e.target.value})}
                placeholder="Any specific requirements or notes..."
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              {editingOrder ? 'Update Order' : 'Create Custom Order'}
            </button>
          </div>
        </form>
      </Modal>

      <style jsx>{`
        .custom-orders-page {
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

        .status-consultation { background: #e3f2fd; color: #1976d2; }
        .status-design-approved { background: #d1ecf1; color: #0c5460; }
        .status-in-production { background: #fff3cd; color: #856404; }
        .status-quality-check { background: #cce5ff; color: #004085; }
        .status-ready { background: #d4edda; color: #155724; }
        .status-delivered { background: #d4edda; color: #155724; }

        .custom-order-form .form-grid {
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

export default CustomOrders;
