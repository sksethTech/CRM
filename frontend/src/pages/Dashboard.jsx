import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      const data = response.data.data;
      setStats({
        totalCustomers: data.customers.total,
        totalProducts: data.products.total,
        pendingOrders: data.orders.pending,
        todayAppointments: data.appointments.today,
        monthlyRevenue: data.revenue.total,
        customOrders: data.orders.total
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const statCards = [
    { title: 'Total Customers', value: stats?.totalCustomers || 0, icon: '👥', color: '#7c3aed' },
    { title: 'Total Products', value: stats?.totalProducts || 0, icon: '💍', color: '#059669' },
    { title: 'Pending Orders', value: stats?.pendingOrders || 0, icon: '📦', color: '#d97706' },
    { title: 'Today Appointments', value: stats?.todayAppointments || 0, icon: '📅', color: '#dc2626' },
    { title: 'Monthly Revenue', value: `₹${stats?.monthlyRevenue?.toLocaleString() || 0}`, icon: '💰', color: '#0891b2' },
    { title: 'Custom Orders', value: stats?.customOrders || 0, icon: '✨', color: '#7c3aed' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      {/* Header */}
      <header style={{
        background: 'white',
        padding: '16px 24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>💎</span>
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>Jewellery CRM</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontWeight: '500', color: '#1f2937' }}>{user?.name}</p>
            <p style={{ fontSize: '12px', color: '#6b7280', textTransform: 'capitalize' }}>{user?.role}</p>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
            Dashboard Overview
          </h2>
          <p style={{ color: '#6b7280' }}>Welcome back! Here's what's happening today.</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Loading dashboard...</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            {statCards.map((stat, index) => (
              <div key={index} className="card" style={{
                borderLeft: `4px solid ${stat.color}`,
                transition: 'transform 0.2s'
              }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>{stat.title}</p>
                    <p style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937' }}>{stat.value}</p>
                  </div>
                  <span style={{ fontSize: '40px', opacity: 0.3 }}>{stat.icon}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="card">
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
            Quick Actions
          </h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/customers')}>
              👥 Manage Customers
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/products')}>
              💍 View Products
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/orders')}>
              📦 Process Orders
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/appointments')}>
              📅 Schedule Appointment
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/custom-orders')}>
              ✨ Custom Order
            </button>
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="card" style={{ marginTop: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
            Recent Activity
          </h3>
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <p>No recent activity to display</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>Start by adding customers or creating orders</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
