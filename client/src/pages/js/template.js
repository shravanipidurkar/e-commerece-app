import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/template.css';
import Header from '../components/header';
import { useCart } from '../js/CartContext';
import axios from 'axios';

const ProductTemplate = () => {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  const [store, setStore] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('customerToken'));
  const productGridRef = useRef(null);
  const navigate = useNavigate();
  const { storeId } = useParams();
  const { cartItems, addToCart, updateQuantity } = useCart();

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/stores_backup/${storeId}`);
        setStore(res.data.store);
      } catch (err) {
        console.error('❌ Failed to fetch store info:', err);
      }
    };

    const fetchProducts = async () => {
      const token = localStorage.getItem('authToken');
      try {
        const res = await axios.get('http://localhost:5000/api/products', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const productList = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.products)
          ? res.data.products
          : [];

        const filtered = productList.filter(p => String(p.store_id) === storeId);
        setProducts(filtered);
      } catch (err) {
        console.error('❌ Failed to fetch products:', err);
      }
    };
console.log('storeId from useParams:', storeId);

    const fetchCategories = async () => {
      const token = localStorage.getItem('authToken');
      try {
        const res = await axios.get('http://localhost:5000/api/products/categories', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(['All', ...res.data.map(c => c.name)]);
      } catch (err) {
        console.error('❌ Failed to fetch categories:', err);
      }
    };

    fetchStore();
    fetchProducts();
    fetchCategories();
  }, [storeId]);

  const filteredProducts = products.filter(product => {
    const matchesCategory = category === 'All' || product.product_category === category;
    const matchesSearch = product.product_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const handlePageChange = (pageNum) => setCurrentPage(pageNum);

  const getCartItem = (productId) =>
    cartItems.find(item => item.product_id === productId);

  return (
    <div className="template-container">
      <Header
        cartCount={cartItems.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        store={store}
      />

      {/* Hero Section */}
      <section className="hero">
        <img
          src={store?.banner_image ? `http://localhost:5000${store.banner_image}` : '/images/default-placeholder.png'}
          alt="banner"
          className="hero-img"
        />
        <div className="hero-text">
          <h1>{store?.slug || 'Welcome to Our Store'}</h1>
          <p>{store?.description || 'Find the best clothing and accessories here.'}</p>
          <button
            className="shop-btn"
            onClick={() => productGridRef.current?.scrollIntoView({ behavior: 'smooth' })}
          >
            Shop now
          </button>
        </div>
      </section>

      {/* Category Tabs */}
      <div className="filter-tabs">
        {categories.map(cat => (
          <button
            key={cat}
            className={`tab ${category === cat ? 'active' : ''}`}
            onClick={() => {
              setCategory(cat);
              setCurrentPage(1);
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="product-grid" ref={productGridRef}>
        {products.length === 0 ? (
          <div>Loading products...</div>
        ) : (
          currentProducts.map(product => {
            const inCart = getCartItem(product.product_id);

            return (
              <div className="product-card" key={product.product_id}>
                <img
                  src={
                    product.image_url
                      ? `http://localhost:5000/${product.image_url}`
                      : '/images/default-placeholder.png'
                  }
                  alt={product.product_name}
                />
                <h3>{product.product_name}</h3>
                <p>{product.description}</p>
                <div className="price">₹ {Number(product.price).toLocaleString()}</div>

                {inCart ? (
                  <div className="qty-control">
                    <button onClick={() => updateQuantity(product.product_id, -1)}>-</button>
                    <span>{inCart.quantity}</span>
                    <button onClick={() => updateQuantity(product.product_id, 1)}>+</button>
                  </div>
                ) : (
                  <button
                    className="add-to-cart"
                    onClick={() => {
                      const productData = {
                        ...product,
                        image: product.image_url
                          ? `http://localhost:5000/${product.image_url}`
                          : '/images/default-placeholder.png',
                      };

                      if (!isLoggedIn) {
                        console.warn('🚫 Not logged in, redirecting to login...');
                        localStorage.setItem('pendingCartItem', JSON.stringify(productData));
                        localStorage.setItem('redirectAfterLogin', `/store/${storeId}/template`);
                        navigate(`/store/${storeId}/login`);
                        return;
                      }

                      addToCart(productData);
                    }}
                  >
                    Add to cart
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="pagination">
          <span>
            Showing {indexOfFirstProduct + 1}–{Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} products
          </span>
          <div className="pages">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTemplate;
