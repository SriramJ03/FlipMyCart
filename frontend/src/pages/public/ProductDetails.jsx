import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductApi } from '../../api/products';
import { getProductReviewsApi, addReviewApi } from '../../api/reviews';
import { startConversationApi } from '../../api/chat';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { addToWishlistApi } from '../../api/wishlist';
import Loader from '../../components/Loader';
import ErrorMessage, { extractErrorMessage } from '../../components/ErrorMessage';
import StarRating from '../../components/StarRating';
import { formatCurrency, formatDate } from '../../utils/format';
import { mediaUrl } from '../../utils/media';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState({ reviews: [], summary: { count: 0, average: 0 } });
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [reviewForm, setReviewForm] = useState({ rating: 5, reviewText: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [chatMessage, setChatMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([getProductApi(id), getProductReviewsApi(id)])
      .then(([productRes, reviewRes]) => {
        setProduct(productRes.data);
        setReviews(reviewRes.data);
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (!product) return <ErrorMessage message={error || 'Product not found'} />;

  const images = product.media?.images || [];
  const specs = product.specifications || {};

  const handleAddToCart = async () => {
    setError('');
    setNotice('');
    try {
      await addItem(product.productId, 1);
      setNotice('Added to cart');
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const handleAddToWishlist = async () => {
    setError('');
    setNotice('');
    try {
      await addToWishlistApi(product.productId);
      setNotice('Added to wishlist');
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await addReviewApi({ productId: product.productId, ...reviewForm });
      setReviews((prev) => ({
        summary: { count: prev.summary.count + 1, average: Number(((prev.summary.average * prev.summary.count + data.rating) / (prev.summary.count + 1)).toFixed(2)) },
        reviews: [data, ...prev.reviews],
      }));
      setReviewForm({ rating: 5, reviewText: '' });
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const handleContactSeller = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await startConversationApi({ productId: product.productId, message: chatMessage });
      setChatMessage('');
      setMessage('Message sent! Check your Messages page for the reply.');
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <div className="page-product-details">
      <ErrorMessage message={error} />
      {notice && <div className="alert alert-success">{notice}</div>}

      <div className="product-details-grid">
        <div className="product-gallery">
          <div className="product-gallery-main">
            {images.length > 0 ? (
              <img src={mediaUrl(images[activeImage]?.url)} alt={images[activeImage]?.altText || product.name} />
            ) : (
              <div className="product-card-image-placeholder">No image available</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="product-gallery-thumbs">
              {images.map((img, idx) => (
                <button key={img.url} className={idx === activeImage ? 'active' : ''} onClick={() => setActiveImage(idx)}>
                  <img src={mediaUrl(img.url)} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-info">
          <span className="product-card-category">{product.categoryName}</span>
          <h1>{product.name}</h1>
          <p className="product-details-seller">Sold by {product.sellerName}</p>
          <div className="product-details-rating">
            <StarRating value={reviews.summary.average} />
            <span>{reviews.summary.average} ({reviews.summary.count} reviews)</span>
          </div>
          <p className="product-details-price">{formatCurrency(product.price)}</p>
          <p className={product.stockQuantity > 0 ? 'stock-ok' : 'stock-out'}>
            {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
          </p>
          <p className="product-details-description">{product.description}</p>

          {(!user || user.role === 'buyer') && (
            <div className="product-details-actions">
              <button className="btn btn-primary" disabled={product.stockQuantity === 0} onClick={handleAddToCart}>Add to cart</button>
              <button className="btn btn-outline" onClick={handleAddToWishlist}>Add to wishlist</button>
            </div>
          )}
          {!user && <p className="form-note">You must be logged in as a buyer to purchase or message the seller.</p>}

          {Object.keys(specs).length > 0 && (
            <div className="spec-table">
              <h3>Specifications</h3>
              <table>
                <tbody>
                  {Object.entries(specs).map(([key, value]) => (
                    <tr key={key}>
                      <th>{key}</th>
                      <td>{Array.isArray(value) ? value.join(', ') : String(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {user?.role === 'buyer' && (
            <div className="contact-seller">
              <h3>Contact the seller</h3>
              {message && <p className="alert alert-success">{message}</p>}
              <form onSubmit={handleContactSeller}>
                <textarea
                  rows={2}
                  required
                  placeholder="Ask a question about this product..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                />
                <button type="submit" className="btn btn-outline btn-sm">Send message</button>
              </form>
            </div>
          )}
        </div>
      </div>

      <section className="reviews-section">
        <h2>Reviews</h2>
        {user?.role === 'buyer' && (
          <form className="review-form" onSubmit={handleReviewSubmit}>
            <label>
              Rating
              <select value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}>
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
              </select>
            </label>
            <textarea
              rows={2}
              placeholder="Share your experience (only available for delivered orders)"
              value={reviewForm.reviewText}
              onChange={(e) => setReviewForm({ ...reviewForm, reviewText: e.target.value })}
            />
            <button type="submit" className="btn btn-primary btn-sm">Submit review</button>
          </form>
        )}

        {reviews.reviews.length === 0 ? (
          <p className="empty-state">No reviews yet.</p>
        ) : (
          <ul className="review-list">
            {reviews.reviews.map((r) => (
              <li key={r._id} className="review-item">
                <div className="review-item-header">
                  <strong>{r.userName}</strong>
                  <StarRating value={r.rating} size={14} />
                  <span className="review-date">{formatDate(r.createdAt)}</span>
                </div>
                <p>{r.reviewText}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
