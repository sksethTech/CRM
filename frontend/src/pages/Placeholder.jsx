import { useNavigate } from 'react-router-dom';

const Placeholder = ({ title, icon }) => {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
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
        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">← Back to Dashboard</button>
      </header>
      <main className="container" style={{ padding: '24px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <span style={{ fontSize: '64px' }}>{icon}</span>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginTop: '20px' }}>{title}</h2>
          <p style={{ color: '#6b7280', marginTop: '12px' }}>This module is under development</p>
        </div>
      </main>
    </div>
  );
};
export default Placeholder;
