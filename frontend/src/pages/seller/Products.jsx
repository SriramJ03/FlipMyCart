import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listMyProductsApi, deleteProductApi } from '../../api/products';
import { formatCurrency } from '../../utils/format';
import Loader from '../../components/Loader';
import ErrorMessage, { extractErrorMessage } from '../../components/ErrorMessage';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    listMyProductsApi().then((res) => setProducts(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    setError('');
    try {
      await deleteProductApi(id);
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="dashboard-page">
      <div className="dashboard-panel-header">
        <h1>My products</h1>
        <Link to="/seller/products/new" className="btn btn-primary btn-sm">Add product</Link>
      </div>
      <ErrorMessage message={error} />
      {products.length === 0 ? (
        <p className="empty-state">You haven't added any products yet.</p>
      ) : (
        <table className="data-table">
          <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th /></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.productId}>
                <td>{p.name}</td>
                <td>{p.categoryName}</td>
                <td>{formatCurrency(p.price)}</td>
                <td>{p.stockQuantity}</td>
                <td><span className={`status-badge status-${p.status === 'active' ? 'delivered' : p.status === 'draft' ? 'placed' : 'cancelled'}`}>{p.status}</span></td>
                <td className="table-actions">
                  <Link to={`/seller/products/${p.productId}/edit`} className="btn btn-outline btn-sm">Edit</Link>
                  <button className="btn btn-outline btn-sm" onClick={() => handleDelete(p.productId)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
