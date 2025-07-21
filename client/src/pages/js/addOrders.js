import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/add-order.css';

const AddOrder = () => {
  const [customerId, setCustomerId] = useState('');
  const [status, setStatus] = useState('Pending');
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  const storeId = localStorage.getItem('storeId');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!storeId) return alert('Store ID missing');

    const fetchCustomers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/orders/customers_orders', {
          params: { storeId }
        });
        setCustomers(res.data);
      } catch (err) {
        console.error('❌ Failed to fetch customers:', err);
      }
    };

    const fetchProducts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/orders/products', {
          params: { storeId }
        });
        setProducts(res.data);
      } catch (err) {
        console.error('❌ Failed to fetch products:', err);
      }
    };

    fetchCustomers();
    fetchProducts();
  }, [storeId]);

  // ✅ Auto-set price from products list when a product is selected
  useEffect(() => {
    const product = products.find(p => p.product_id === Number(selectedProductId));
    if (product) {
      setPrice(product.price);
    } else {
      setPrice('');
    }
  }, [selectedProductId, products]);

  const addItem = () => {
    if (!selectedProductId || !quantity || !price) {
      alert('Please fill product and quantity');
      return;
    }

    const product = products.find(p => p.product_id === Number(selectedProductId));
    const item = {
      product_id: Number(selectedProductId),
      quantity: Number(quantity),
      price: Number(price),
      product_name: product?.product_name || `Product ${selectedProductId}`
    };

    setItems(prev => [...prev, item]);
    setSelectedProductId('');
    setQuantity('');
    setPrice('');
  };

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!storeId) return alert('Store ID not found');
    if (!customerId) return alert('Please select a customer');
    if (items.length === 0) return alert('Please add at least one product');

    const payload = {
      customer_id: Number(customerId),
      total_amount: totalAmount,
      status,
      store_id: Number(storeId),
      items: items.map(({ product_id, quantity }) => ({
        product_id,
        quantity
      }))
    };

    try {
      const res = await axios.post('http://localhost:5000/api/orders', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const orderId = res.data.orderId;

      if (status === 'Delivered') {
        await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, {
          status: 'Delivered',
          storeId: Number(storeId)
        });
        console.log('✅ Sale record inserted for Delivered order');
      }

      alert('✅ Order created');
      localStorage.setItem('redirectToOrders', 'true');
      navigate('/AdminOverview');
    } catch (err) {
      console.error('❌ Order submit failed:', err);
      alert('Error adding order: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="add-order-page">
      <div className="order-container">
        <div className="add-order-card">
          <h1>Add New Order</h1>
          <form onSubmit={handleSubmit} className="order-form">
            <label>Customer:</label>
            <select value={customerId} onChange={e => setCustomerId(e.target.value)} required>
              <option value="">-- Select Customer --</option>
              {customers.map(c => (
                <option key={c.customer_id} value={c.customer_id}>
                  {c.customer_name} (ID: {c.customer_id})
                </option>
              ))}
            </select>

            <label>Status:</label>
            <select value={status} onChange={e => setStatus(e.target.value)}>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <hr />
            <h3>Add Products</h3>

            <label>Product:</label>
            <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)}>
              <option value="">-- Select Product --</option>
              {products.map(p => (
                <option key={p.product_id} value={p.product_id}>
                  {p.product_name} (ID: {p.product_id})
                </option>
              ))}
            </select>

            <label>Quantity:</label>
            <input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} />

            <label>Price:</label>
            <input type="number" value={price} readOnly disabled />

            <button type="button" className="add-order-btn" onClick={addItem}>
              + Add Product
            </button>

            <hr />
            <h4>Products Added:</h4>
            <ul>
              {items.map((item, index) => (
                <li key={index}>
                  {item.product_name} × {item.quantity} @ ₹{item.price} = ₹{item.quantity * item.price}
                </li>
              ))}
            </ul>

            <p><strong>Total:</strong> ₹{totalAmount}</p>

            <button type="submit" className="add-order-btn">Submit Order</button>

            <button type="button" className="add-order-btn cancel-btn" onClick={() => navigate(-1)}>
            Cancel
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default AddOrder;
