import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { placeOrderApi } from '../../api/orders';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/format';
import ErrorMessage, { extractErrorMessage } from '../../components/ErrorMessage';

export default function Cart() {
  const { items, total, updateItem, removeItem, refresh } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState(
    [user.address_line1, user.city, user.state, user.postal_code, user.country].filter(Boolean).join(', ')
  );
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);

  const handlePlaceOrder = async () => {
    if (!address) {
      setError('Please enter a shipping address');
      return;
    }
    setError('');
    setPlacing(true);
    try {
      const { data } = await placeOrderApi({ shippingAddress: address, paymentMethod: 'mock_card' });
      navigate(`/buyer/orders/${data.order_id}`);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="dashboard-page">
      <h1>Your cart</h1>
      <ErrorMessage message={error} />
      {items.length === 0 ? (
        <p className="empty-state">Your cart is empty.</p>
      ) : (
        <div className="cart-layout">
          <table className="data-table">
            <thead><tr><th>Product</th><th>Price</th><th>Quantity</th><th>Line total</th><th /></tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.cart_item_id}>
                  <td>{item.name}</td>
                  <td>{formatCurrency(item.price)}</td>
                  <td>
                    <input
                      type="number"
                      min={1}
                      max={item.stock_quantity}
                      value={item.quantity}
                      className="qty-input"
                      onChange={(e) => updateItem(item.cart_item_id, Number(e.target.value))}
                    />
                  </td>
                  <td>{formatCurrency(item.lineTotal)}</td>
                  <td><button className="btn btn-outline btn-sm" onClick={() => removeItem(item.cart_item_id)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="cart-summary">
            <h2>Order summary</h2>
            <p className="cart-total">Total: {formatCurrency(total)}</p>
            <label>
              Shipping address
              <textarea rows={3} value={address} onChange={(e) => setAddress(e.target.value)} />
            </label>
            <button className="btn btn-primary" disabled={placing} onClick={handlePlaceOrder}>
              {placing ? 'Placing order...' : 'Place order (simulated payment)'}
            </button>
            <button className="btn btn-outline btn-sm" onClick={refresh}>Refresh cart</button>
          </div>
        </div>
      )}
    </div>
  );
}
