import { useEffect, useState } from 'react';
import { getAllProductsAdminApi, moderateProductStatusApi } from '../../api/admin';
import { formatCurrency } from '../../utils/format';
import Loader from '../../components/Loader';
import ErrorMessage, { extractErrorMessage } from '../../components/ErrorMessage';

const statuses = ['draft', 'active', 'inactive'];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    getAllProductsAdminApi().then((res) => setProducts(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleStatusChange = async (id, status) => {
    setError('');
    try {
      await moderateProductStatusApi(id, status);
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="dashboard-page">
      <h1>All products</h1>
      <ErrorMessage message={error} />
      <table className="data-table">
        <thead><tr><th>Name</th><th>Seller</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th></tr></thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.product_id}>
              <td>{p.name}</td>
              <td>{p.business_name}</td>
              <td>{p.category_name}</td>
              <td>{formatCurrency(p.price)}</td>
              <td>{p.stock_quantity}</td>
              <td>
                <select value={p.status} onChange={(e) => handleStatusChange(p.product_id, e.target.value)}>
                  {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
