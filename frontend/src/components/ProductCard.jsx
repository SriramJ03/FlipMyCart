import { Link } from 'react-router-dom';
import { mediaUrl } from '../utils/media';
export default function ProductCard({ product }) {

const image =
  product.image ||
  product.images?.[0] ||
  product.media?.images?.find((img) => img.isPrimary)?.url ||
  product.media?.images?.[0]?.url ||
  null;


  // Get stock from the backend safely
  const stock = Number(
    product.stock ??
    product.stock_quantity ??
    product.stockQuantity ??
    product.quantity ??
    0
  );

  const isInStock = stock > 0;


  return (

    <Link
      to={`/products/${product.productId}`}
      className="product-card"
    >

      <div className="product-image-container">

        {product.isNew && (
          <span className="product-badge">
            New
          </span>
        )}

        {product.discountPercentage && (
          <span className="product-badge discount">
            {product.discountPercentage}% OFF
          </span>
        )}

        {image ? (

<img
  src={mediaUrl(image)}
  alt={product.name}
  className="product-image"
/>

        ) : (

          <div className="no-product-image">
            No image
          </div>

        )}

      </div>


      <div className="product-card-content">

        <p className="product-category">
          {product.categoryName || 'PRODUCT'}
        </p>


        <h3 className="product-name">
          {product.name}
        </h3>


        <p className="product-seller">
          by {product.sellerName || 'FlipMyCart Seller'}
        </p>


        <div className="product-price">
          ₹{Number(product.price).toLocaleString('en-IN')}
        </div>


        <div
          className={
            isInStock
              ? 'stock available'
              : 'stock unavailable'
          }
        >

          {isInStock
            ? 'In stock'
            : 'Out of stock'}

        </div>

      </div>

    </Link>

  );

}