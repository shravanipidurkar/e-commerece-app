// admin-customers.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/admin-customers.css';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/customers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCustomers(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((customer) => {
    const search = searchTerm.toLowerCase();
    return (
      customer.customer_name.toLowerCase().includes(search) ||
      customer.phone_number.includes(search)
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

  const handleAddCustomer = () => {
    navigate('/addcustomer');
  };

  if (loading) return <div className="loading">Loading customers...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="customers-container">
      <h1>Customers</h1>

      <div className="customers-header">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search Name or Phone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="add-customer-btn" onClick={handleAddCustomer}>
          + Add New Customer
        </button>
      </div>

      <div className="customers-table-container">
        <table className="customers-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>No. of Orders</th>
              <th>Amount Spent</th>
              <th>Date Joined</th>
              <th>Phone Number</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((cust) => (
              <tr key={cust.customer_id}>
                <td>{cust.customer_name}</td>
                <td>{cust.no_of_orders}</td>
                <td>{formatCurrency(cust.amount_spent)}</td>
                <td>{formatDate(cust.date_joined)}</td>
                <td>{cust.phone_number}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Customers;
