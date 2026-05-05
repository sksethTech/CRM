import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <div className="page-content">
          {children}
        </div>
      </div>
      
      <style jsx global>{`
        .layout {
          display: flex;
          min-height: 100vh;
          background: #f5f7fa;
        }

        .main-content {
          margin-left: 250px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .page-content {
          margin-top: 70px;
          padding: 30px;
          min-height: calc(100vh - 70px);
        }

        @media (max-width: 768px) {
          .main-content {
            margin-left: 0;
          }

          .page-content {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;
