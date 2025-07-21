import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [recordsToShow, setRecordsToShow] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    
     console.log('Orders component mounted');
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const storeId = localStorage.getItem('storeId');

        if (!storeId) {
          setError('Store ID not found. Please log in again.');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { storeId }
        });
console.log('✅ Orders fetched:', response);

        setOrders(response.data);
        setLoading(false);
        
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const search = searchTerm.toLowerCase();
    return (
      order.customer_name?.toLowerCase().includes(search) ||
      String(order.order_id).includes(search)
    );
  });

  const visibleOrders = filteredOrders.slice(0, recordsToShow);

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      const storeId = localStorage.getItem('storeId');

      if (!storeId) {
        alert('Store ID missing. Please log in again.');
        return;
      }

      await axios.put(
        `http://localhost:5000/api/orders/${orderId}/status`,
        { status: newStatus, storeId }, // ✅ send storeId in body
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.order_id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error('Error updating status:', err);
      alert('❌ Failed to update order status. Please try again.');
    }
  };

  const handleAddNewOrder = () => {
    navigate('/addorder');
  };

  if (loading) return <div className="loading">Loading orders...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="orders-container">
      <h1>Orders</h1>

      <div className="orders-header">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search Order ID or Customer"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <button className="add-order-btn" onClick={handleAddNewOrder}>
          + Add New Order
        </button>
      </div>

      <div className="record-buttons">
        <span>Show:</span>
        <button onClick={() => setRecordsToShow(25)}>25</button>
        <button onClick={() => setRecordsToShow(50)}>50</button>
        <button onClick={() => setRecordsToShow(filteredOrders.length)}>All</button>
      </div>

      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Total</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {visibleOrders.map(order => (
              <tr key={order.order_id}>
                <td>{order.order_id}</td>
                <td>{formatDate(order.date_ordered)}</td>
                <td>{formatCurrency(order.total_amount)}</td>
                <td>{order.customer_name || 'Guest'}</td>
                <td>
                  <span className={`status-badge ${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                    className="status-select"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
