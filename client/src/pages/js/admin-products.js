// export default Products;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/admin-products.css';
import { useNavigate } from 'react-router-dom';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isListView, setIsListView] = useState(true);
  const [isFiltered, setIsFiltered] = useState(false);

  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    minSold: '',
    maxSold: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!isFiltered) fetchProducts(token);
    fetchCategories(token);
  }, []);

  const fetchProducts = async (token) => {
    const res = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/products`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setProducts(res.data);
  };

  const fetchFilteredProducts = async (token) => {
    try {
      const params = {
        category: filters.category || (activeCategory !== 'All' ? activeCategory : ''),
        search: searchTerm,
        startDate: filters.startDate,
        endDate: filters.endDate,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        minSold: filters.minSold,
        maxSold: filters.maxSold,
      };

      const res = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/products/filter`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      setProducts(res.data);
      setIsFiltered(true);
    } catch (error) {
      console.error('Error fetching filtered products:', error);
    }
  };

  const fetchCategories = async (token) => {
    const res = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/products/category-counts`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = res.data;
    const totalCount = data.reduce((sum, cat) => sum + cat.count, 0);
    setCategories([{ name: 'All', count: totalCount }, ...data]);
  };

  const filteredProducts = products.filter(product => {
    if (isFiltered) return true;

    const name = product.product_name || '';
    const category = product.product_category || '';

    const matchSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = activeCategory === 'All' || category === activeCategory;

    return matchSearch && matchCategory;
  });

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      minSold: '',
      maxSold: '',
    });
    setIsFiltered(false);
    fetchProducts(localStorage.getItem('authToken'));
  };

  return (
    <div className="products-container">
      <h1>Products</h1>

      <div className="products-header">
        <input
          className="search-input"
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        <div className="products-actions">
          <button className="filter-btn" onClick={() => setShowFilterDialog(true)}>Filter</button>
          <button className="add-btn" onClick={() => navigate('/add-product')}>+ Add New Product</button>
        </div>
      </div>

      <div className="category-bar">
        <div className="category-scroll">
          {categories.map(cat => (
            <button
              key={cat.name}
              className={`category-btn ${activeCategory === cat.name ? 'active' : ''}`}
              onClick={() => {
                setActiveCategory(cat.name);
                if (!isFiltered) fetchProducts(localStorage.getItem('authToken'));
              }}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>

        <div className="category-actions">
          

          <button className="toggle-view-btn" onClick={() => setIsListView(!isListView)}>
            {isListView ? '🗂️ Table View' : '📋 List View'}
          </button>
        </div>
      </div>

      {/* Product Display Section */}
      {isListView ? (
        <div className="product-grid">
          {filteredProducts.map(product => (
            <div className="product-card" key={product.product_id}>
              <img
                src={`${process.env.REACT_APP_SERVER_URL}/${product.image_url}`}
                alt={product.product_name}
                onError={(e) => (e.target.src = '/placeholder.png')}
              />
              <h3>{product.product_name}</h3>
              <p className="category">{product.product_category || 'No Category'}</p>
              <p className="price">₹{product.price}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="product-table-view">
          <table className="product-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price (₹)</th>
                <th>Description</th>
                <th>Stock Qty</th>
                <th>Sold</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.product_id}>
                  <td>{product.product_name}</td>
                  <td>{product.product_category || 'No Category'}</td>
                  <td>₹{product.price}</td>
                  <td>{product.description || '-'}</td>
                  <td>{product.stock_quantity ?? '-'}</td>
                  <td>{product.total_sold ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterDialog && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Filter products</h2>
            <button className="close-btn" onClick={() => setShowFilterDialog(false)}>×</button>

            <label>Filter by date created</label>
            <div className="date-range">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
              <span>→</span>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>

            <label>Filter by category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">Select</option>
              {categories
                .filter(cat => cat.name !== 'All')
                .map(cat => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
              ))}
            </select>

            <label>Filter by price</label>
            <div className="range-input">
              <input
                type="number"
                placeholder="₦ 00.000"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              />
              <span>To</span>
              <input
                type="number"
                placeholder="₦ 00.000"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              />
            </div>

            <label>Filter by quantity sold</label>
            <div className="range-input">
              <input
                type="number"
                placeholder="Min sold"
                value={filters.minSold}
                onChange={(e) => setFilters({ ...filters, minSold: e.target.value })}
              />
              <span>To</span>
              <input
                type="number"
                placeholder="Max sold"
                value={filters.maxSold}
                onChange={(e) => setFilters({ ...filters, maxSold: e.target.value })}
              />
            </div>

            <div className="modal-actions">
              <button
                className="apply-btn"
                onClick={() => {
                  const token = localStorage.getItem('authToken');
                  fetchFilteredProducts(token);
                  setShowFilterDialog(false);
                }}
              >
                Apply
              </button>
              <button className="clear-btn" onClick={clearFilters}>Clear filters</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
