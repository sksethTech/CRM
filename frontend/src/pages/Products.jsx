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
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <main style={{ padding: '0' }}>
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
                    <td style={{ textTransform: 'capitalize' }}>{p.category}</td>
                    <td style={{ textTransform: 'capitalize' }}>{p.metalType}</td>
                    <td>₹{p.pricing?.finalPrice?.toLocaleString() || p.pricing?.basePrice?.toLocaleString() || '0'}</td>
                    <td>{p.stock?.quantity ?? 0}</td>
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
