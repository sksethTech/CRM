import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px' }}>💍 Products Catalog</h2>
        {loading ? <p>Loading...</p> : (
          <div className="card">
            <table className="table">
              <thead>
                <tr><th>Name</th><th>Category</th><th>Metal</th><th>Price</th><th>Stock</th></tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>{p.metalType}</td>
                    <td>₹{p.price.toLocaleString()}</td>
                    <td>{p.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && <p style={{textAlign:'center',padding:'40px'}}>No products yet</p>}
          </div>
        )}
      </main>
    </div>
  );
};
export default Products;
