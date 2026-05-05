import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <div className="navbar">
      <div className="navbar-left">
        <h1 className="page-title">Jewellery CRM</h1>
      </div>
      
      <div className="navbar-right">
        <div className="user-info">
          <span className="user-avatar">
            {user?.firstName?.charAt(0) || 'U'}
          </span>
          <div className="user-details">
            <span className="user-name">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="user-role">{user?.role}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .navbar {
          height: 70px;
          background: white;
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 30px;
          position: fixed;
          top: 0;
          left: 250px;
          right: 0;
          z-index: 900;
        }

        .navbar-left {
          display: flex;
          align-items: center;
        }

        .page-title {
          margin: 0;
          font-size: 24px;
          color: #1a1a2e;
          font-weight: 600;
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 16px;
          background: #f8f9fa;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .user-info:hover {
          background: #e9ecef;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 16px;
        }

        .user-details {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .user-role {
          font-size: 12px;
          color: #666;
          text-transform: capitalize;
        }

        @media (max-width: 768px) {
          .navbar {
            left: 0;
            padding: 0 20px;
          }

          .page-title {
            font-size: 18px;
          }

          .user-details {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Navbar;
