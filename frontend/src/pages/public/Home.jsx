import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listProductsApi } from '../../api/products';
import { listCategoriesApi } from '../../api/categories';
import ProductCard from '../../components/ProductCard';
import Loader from '../../components/Loader';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listProductsApi({ limit: 8 }), listCategoriesApi()])
      .then(([productRes, categoryRes]) => {
        setProducts(productRes.data);
        setCategories(categoryRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-home">
      <section className="hero">
        <div className="hero-text">
          <h1>Shop more, sellers keep more.</h1>
          <p>
            FlipMyCart is a commission-free marketplace. Sellers pay a single one-time onboarding
            fee instead of a cut of every sale — so prices stay fair and sellers keep their margins.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary">Browse products</Link>
            <Link to="/register" className="btn btn-outline">Become a seller</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Shop by category</h2>
        <div className="category-grid">
          {categories.map((c) => (
            <Link key={c.category_id} to={`/products?categoryId=${c.category_id}`} className="category-chip">
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Featured products</h2>
        {loading ? (
          <Loader />
        ) : (
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p.productId} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
