import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/customers', label: 'Customers', icon: '👥' },
    { path: '/products', label: 'Products', icon: '💎' },
    { path: '/orders', label: 'Orders', icon: '🛒' },
    { path: '/appointments', label: 'Appointments', icon: '📅' },
    { path: '/custom-orders', label: 'Custom Orders', icon: '✨' },
    { path: '/interactions', label: 'Interactions', icon: '💬' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>💎 Jewellery CRM</h2>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <span className="nav-icon">🚪</span>
          <span className="nav-label">Logout</span>
        </button>
      </div>

      <style jsx>{`
        .sidebar {
          width: 250px;
          height: 100vh;
          background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
          color: white;
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 1000;
        }

        .sidebar-header {
          padding: 24px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sidebar-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
        }

        .sidebar-nav {
          flex: 1;
          padding: 20px 0;
          overflow-y: auto;
        }

        .nav-item {
          display: flex;
          align-items: center;
          padding: 12px 20px;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .nav-item.active {
          background: rgba(233, 69, 96, 0.2);
          color: #ff6b6b;
          border-left: 3px solid #ff6b6b;
        }

        .nav-icon {
          font-size: 20px;
          margin-right: 12px;
          width: 24px;
          text-align: center;
        }

        .nav-label {
          font-size: 14px;
          font-weight: 500;
        }

        .sidebar-footer {
          padding: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding: 12px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .logout-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border-color: rgba(255, 255, 255, 0.4);
        }

        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }

          .sidebar.open {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
