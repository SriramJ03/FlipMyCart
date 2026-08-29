import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { listProductsApi } from '../../api/products';
import { listCategoriesApi } from '../../api/categories';

import ProductCard from '../../components/ProductCard';
import Loader from '../../components/Loader';

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [meta, setMeta] = useState({
    total: 0
  });

  const [search, setSearch] = useState(
    searchParams.get('search') || ''
  );

  const [sortBy, setSortBy] = useState('latest');


  // ================================
  // FETCH PRODUCTS
  // ================================

  const fetchProducts = useCallback(() => {
    setLoading(true);

    const params = Object.fromEntries(
      searchParams.entries()
    );

    listProductsApi(params)
      .then((res) => {
        setProducts(res.data || []);

        setMeta(
          res.meta || {
            total: res.data?.length || 0
          }
        );
      })
      .catch((error) => {
        console.error(
          'Failed to fetch products:',
          error
        );

        setProducts([]);
      })
      .finally(() => {
        setLoading(false);
      });

  }, [searchParams]);


  // ================================
  // FETCH CATEGORIES
  // ================================

  useEffect(() => {
    listCategoriesApi()
      .then((res) => {
        setCategories(res.data || []);
      })
      .catch((error) => {
        console.error(
          'Failed to fetch categories:',
          error
        );
      });

  }, []);


  // ================================
  // LOAD PRODUCTS
  // ================================

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);


  // ================================
  // UPDATE URL PARAMETER
  // ================================

  const updateParam = (key, value) => {
    const next = new URLSearchParams(
      searchParams
    );

    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    setSearchParams(next);
  };


  // ================================
  // SEARCH
  // ================================

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    updateParam(
      'search',
      search.trim()
    );
  };


  // ================================
  // CLEAR FILTERS
  // ================================

  const handleClearFilters = () => {
    setSearch('');
    setSortBy('latest');
    setSearchParams({});
  };


  // ================================
  // SORT PRODUCTS
  // ================================

  const sortedProducts = useMemo(() => {

    // Create copy so original state is not changed
    const sorted = [...products];


    // ----------------
    // PRICE LOW → HIGH
    // ----------------

    if (sortBy === 'price-low') {

      return sorted.sort((a, b) => {
        return Number(a.price) - Number(b.price);
      });

    }


    // ----------------
    // PRICE HIGH → LOW
    // ----------------

    if (sortBy === 'price-high') {

      return sorted.sort((a, b) => {
        return Number(b.price) - Number(a.price);
      });

    }


    // ----------------
    // NAME A → Z
    // ----------------

    if (sortBy === 'name') {

      return sorted.sort((a, b) => {

        return (a.name || '')
          .localeCompare(
            b.name || ''
          );

      });

    }


    // ----------------
    // LATEST
    // ----------------

    if (sortBy === 'latest') {

      return sorted.sort((a, b) => {

        const dateA = new Date(
          a.createdAt ||
          a.created_at ||
          0
        );

        const dateB = new Date(
          b.createdAt ||
          b.created_at ||
          0
        );

        return dateB - dateA;

      });

    }


    return sorted;

  }, [products, sortBy]);


  return (

    <div className="page-products">


      {/* ============================
          FILTER SIDEBAR
      ============================ */}

      <aside className="filters-panel">

        <h3>
          FlexMyCart
        </h3>


        {/* SEARCH */}

        <form
          onSubmit={handleSearchSubmit}
          className="product-search-form"
        >

          <div className="search-input-wrapper">

            <span className="search-icon">
              🔍
            </span>

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>


          <button
            type="submit"
            className="search-button"
          >
            Search
          </button>

        </form>


        <div className="filter-divider" />


        {/* CATEGORY */}

        <label className="filter-field">

          <span>
            Category
          </span>

          <select
            value={
              searchParams.get('categoryId') || ''
            }
            onChange={(e) =>
              updateParam(
                'categoryId',
                e.target.value
              )
            }
          >

            <option value="">
              All categories
            </option>


            {categories.map((category) => (

              <option
                key={category.category_id}
                value={category.category_id}
              >

                {category.name}

              </option>

            ))}

          </select>

        </label>


        <div className="filter-divider" />


        {/* PRICE */}

        <div className="price-range-group">

          <span className="filter-title">
            Price range
          </span>


          <input
            type="number"
            min="0"
            placeholder="₹ Minimum"
            value={
              searchParams.get('minPrice') || ''
            }
            onChange={(e) =>
              updateParam(
                'minPrice',
                e.target.value
              )
            }
          />


          <div className="price-separator">
            -
          </div>


          <input
            type="number"
            min="0"
            placeholder="₹ Maximum"
            value={
              searchParams.get('maxPrice') || ''
            }
            onChange={(e) =>
              updateParam(
                'maxPrice',
                e.target.value
              )
            }
          />

        </div>


        {/* STOCK */}

        <label className="filter-checkbox">

          <input
            type="checkbox"
            checked={
              searchParams.get('inStock') === 'true'
            }
            onChange={(e) =>
              updateParam(
                'inStock',
                e.target.checked
                  ? 'true'
                  : ''
              )
            }
          />

          <span>
            In stock only
          </span>

        </label>


        {/* CLEAR */}

        <button
          type="button"
          className="clear-filters-button"
          onClick={handleClearFilters}
        >

          ⚙ Clear filters

        </button>


      </aside>



      {/* ============================
          PRODUCTS SECTION
      ============================ */}

      <section className="products-panel">


        {/* HEADER */}

        <div className="products-panel-header">


          <h2>
            Products
          </h2>


          <div className="products-header-right">


            <span className="results-count">

              {meta.total} result
              {meta.total === 1 ? '' : 's'}

            </span>


            {/* SORT DROPDOWN */}

            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value)
              }
            >

              <option value="latest">
                Sort by: Latest
              </option>


              <option value="price-low">
                Price: Low to High
              </option>


              <option value="price-high">
                Price: High to Low
              </option>


              <option value="name">
                Name: A-Z
              </option>

            </select>


          </div>


        </div>



        {/* ============================
            PRODUCT CONTENT
        ============================ */}

        {loading ? (

          <Loader />

        ) : sortedProducts.length === 0 ? (

          <p className="empty-state">

            No products match your filters.

          </p>

        ) : (

          <div className="product-grid">

            {sortedProducts.map((product) => (

              <ProductCard
                key={product.productId}
                product={product}
              />

            ))}

          </div>

        )}


      </section>


    </div>

  );

}