import { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  const [formData, setFormData] = useState({
    customerId: '',
    date: '',
    time: '',
    type: 'consultation',
    status: 'scheduled',
    notes: ''
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments');
      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingAppointment(null);
    setFormData({
      customerId: '',
      date: '',
      time: '',
      type: 'consultation',
      status: 'scheduled',
      notes: ''
    });
    setModalOpen(true);
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      customerId: appointment.customerId?._id || appointment.customerId,
      date: new Date(appointment.date).toISOString().split('T')[0],
      time: appointment.time,
      type: appointment.type,
      status: appointment.status,
      notes: appointment.notes || ''
    });
    setModalOpen(true);
  };

  const handleDelete = async (appointment) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await api.delete(`/appointments/${appointment._id}`);
        fetchAppointments();
      } catch (error) {
        alert('Error deleting appointment');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAppointment) {
        await api.put(`/appointments/${editingAppointment._id}`, formData);
      } else {
        await api.post('/appointments', formData);
      }
      setModalOpen(false);
      fetchAppointments();
    } catch (error) {
      alert('Error saving appointment');
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
      key: 'date', 
      title: 'Date', 
      width: '120px',
      render: (val) => new Date(val).toLocaleDateString()
    },
    { 
      key: 'time', 
      title: 'Time', 
      width: '100px'
    },
    { 
      key: 'type', 
      title: 'Type', 
      width: '150px',
      render: (val) => (
        <span className="type-badge">{val}</span>
      )
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
      key: 'notes', 
      title: 'Notes', 
      width: '200px',
      render: (val) => val || '-'
    }
  ];

  if (loading) return <div>Loading appointments...</div>;

  return (
    <div className="appointments-page">
      <div className="page-header">
        <h1>📅 Appointments</h1>
        <p>Schedule and manage customer consultations</p>
      </div>

      <DataTable
        columns={columns}
        data={appointments}
        onAdd={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingAppointment ? 'Edit Appointment' : 'Schedule Appointment'}
        size="medium"
      >
        <form onSubmit={handleSubmit} className="appointment-form">
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
              <label>Appointment Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="consultation">Consultation</option>
                <option value="fitting">Fitting</option>
                <option value="repair">Repair Discussion</option>
                <option value="custom-design">Custom Design</option>
                <option value="valuation">Valuation</option>
              </select>
            </div>

            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No Show</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Notes</label>
              <textarea
                rows="3"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Additional details..."
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              {editingAppointment ? 'Update Appointment' : 'Schedule Appointment'}
            </button>
          </div>
        </form>
      </Modal>

      <style jsx>{`
        .appointments-page {
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

        .status-scheduled { background: #fff3cd; color: #856404; }
        .status-confirmed { background: #d1ecf1; color: #0c5460; }
        .status-completed { background: #d4edda; color: #155724; }
        .status-cancelled { background: #f8d7da; color: #721c24; }
        .status-no-show { background: #e2e3e5; color: #383d41; }

        .appointment-form .form-grid {
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

export default Appointments;
