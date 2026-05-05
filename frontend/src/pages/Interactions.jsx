import { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';

const Interactions = () => {
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInteraction, setEditingInteraction] = useState(null);

  const [formData, setFormData] = useState({
    customerId: '',
    type: 'call',
    subject: '',
    notes: '',
    followUpDate: '',
    status: 'completed'
  });

  useEffect(() => {
    fetchInteractions();
  }, []);

  const fetchInteractions = async () => {
    try {
      const response = await api.get('/interactions');
      setInteractions(response.data.interactions || []);
    } catch (error) {
      console.error('Error fetching interactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingInteraction(null);
    setFormData({
      customerId: '',
      type: 'call',
      subject: '',
      notes: '',
      followUpDate: '',
      status: 'completed'
    });
    setModalOpen(true);
  };

  const handleEdit = (interaction) => {
    setEditingInteraction(interaction);
    setFormData({
      customerId: interaction.customerId?._id || interaction.customerId,
      type: interaction.type,
      subject: interaction.subject,
      notes: interaction.notes || '',
      followUpDate: interaction.followUpDate ? new Date(interaction.followUpDate).toISOString().split('T')[0] : '',
      status: interaction.status
    });
    setModalOpen(true);
  };

  const handleDelete = async (interaction) => {
    if (window.confirm('Are you sure you want to delete this interaction?')) {
      try {
        await api.delete(`/interactions/${interaction._id}`);
        fetchInteractions();
      } catch (error) {
        alert('Error deleting interaction');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingInteraction) {
        await api.put(`/interactions/${editingInteraction._id}`, formData);
      } else {
        await api.post('/interactions', formData);
      }
      setModalOpen(false);
      fetchInteractions();
    } catch (error) {
      alert('Error saving interaction');
    }
  };

  const columns = [
    { 
      key: 'customerId', 
      title: 'Customer', 
      width: '200px',
      render: (val) => val?.firstName ? `${val.firstName} ${val.lastName}` : 'N/A'
    },
    { 
      key: 'type', 
      title: 'Type', 
      width: '100px',
      render: (val) => (
        <span className="type-badge">{val}</span>
      )
    },
    { 
      key: 'subject', 
      title: 'Subject', 
      width: '250px'
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
      key: 'followUpDate', 
      title: 'Follow-up', 
      width: '130px',
      render: (val) => val ? new Date(val).toLocaleDateString() : '-'
    },
    { 
      key: 'createdAt', 
      title: 'Date', 
      width: '130px',
      render: (val) => new Date(val).toLocaleDateString()
    }
  ];

  if (loading) return <div>Loading interactions...</div>;

  return (
    <div className="interactions-page">
      <div className="page-header">
        <h1>💬 Customer Interactions</h1>
        <p>Track all communications and follow-ups with customers</p>
      </div>

      <DataTable
        columns={columns}
        data={interactions}
        onAdd={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingInteraction ? 'Edit Interaction' : 'Log New Interaction'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="interaction-form">
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
              <label>Interaction Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="call">Phone Call</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="in-person">In-Person</option>
                <option value="video-call">Video Call</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                placeholder="Brief summary of the interaction"
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Notes</label>
              <textarea
                rows="5"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Detailed notes about the conversation..."
                required
              />
            </div>

            <div className="form-group">
              <label>Follow-up Date</label>
              <input
                type="date"
                value={formData.followUpDate}
                onChange={(e) => setFormData({...formData, followUpDate: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="completed">Completed</option>
                <option value="pending-followup">Pending Follow-up</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              {editingInteraction ? 'Update Interaction' : 'Log Interaction'}
            </button>
          </div>
        </form>
      </Modal>

      <style jsx>{`
        .interactions-page {
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

        .type-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          background: #e3f2fd;
          color: #1976d2;
          text-transform: capitalize;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .status-completed { background: #d4edda; color: #155724; }
        .status-pending-followup { background: #fff3cd; color: #856404; }
        .status-scheduled { background: #cce5ff; color: #004085; }

        .interaction-form .form-grid {
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

export default Interactions;
