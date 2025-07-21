import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/admin-orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
      (filter === 'all' || order.status.toLowerCase() === filter.toLowerCase()) &&
      (
        order.customer_name?.toLowerCase().includes(search) ||
        String(order.order_id).includes(search)
      )
    );
  });

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${process.env.REACT_APP_SERVER_URL}/api/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.order_id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleAddNewOrder = () => {
    navigate('/addorder'); // ✅ Corrected route
  };

  if (loading) return <div className="loading">Loading orders...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="orders-container">
      <h1>Orders</h1>

      <div className="orders-header">
        <div className="sales-types">
          <button className="active">All Sales</button>
        </div>
        <button className="add-order-btn" onClick={handleAddNewOrder}>
          + Add New Order
        </button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search Order ID or Customer"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
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
            {filteredOrders.map(order => (
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
