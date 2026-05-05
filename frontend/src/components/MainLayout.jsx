import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Customers', path: '/customers', icon: '👥' },
    { name: 'Products', path: '/products', icon: '💍' },
    { name: 'Orders', path: '/orders', icon: '📦' },
    { name: 'Appointments', path: '/appointments', icon: '📅' },
    { name: 'Custom Orders', path: '/custom-orders', icon: '✨' },
  ];

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <span style={{ fontSize: '24px' }}>💎</span>
          <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>CRM</h1>
        </div>

        <nav className="sidebar-content">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button 
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="top-nav">
          <div className="search-placeholder">
            {/* Search bar can go here */}
          </div>
          <div className="user-profile">
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                {user?.firstName} {user?.lastName}
              </p>
              <p style={{ fontSize: '12px', color: '#6b7280', textTransform: 'capitalize' }}>
                {user?.role}
              </p>
            </div>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '50%', 
              background: '#7c3aed', 
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          </div>
        </header>

        <main style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
