import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getWishlistApi, removeFromWishlistApi } from '../../api/wishlist';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/format';
import Loader from '../../components/Loader';
import ErrorMessage, { extractErrorMessage } from '../../components/ErrorMessage';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addItem } = useCart();

  const load = () => {
    setLoading(true);
    getWishlistApi().then((res) => setItems(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleRemove = async (productId) => {
    await removeFromWishlistApi(productId);
    load();
  };

  const handleMoveToCart = async (productId) => {
    setError('');
    try {
      await addItem(productId, 1);
      await handleRemove(productId);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="dashboard-page">
      <h1>Wishlist</h1>
      <ErrorMessage message={error} />
      {items.length === 0 ? (
        <p className="empty-state">Your wishlist is empty.</p>
      ) : (
        <table className="data-table">
          <thead><tr><th>Product</th><th>Price</th><th>Status</th><th /></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.wishlist_id}>
                <td><Link to={`/products/${item.product_id}`}>{item.name}</Link></td>
                <td>{formatCurrency(item.price)}</td>
                <td>{item.stock_quantity > 0 ? 'In stock' : 'Out of stock'}</td>
                <td className="table-actions">
                  <button className="btn btn-primary btn-sm" disabled={item.stock_quantity === 0} onClick={() => handleMoveToCart(item.product_id)}>Move to cart</button>
                  <button className="btn btn-outline btn-sm" onClick={() => handleRemove(item.product_id)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
