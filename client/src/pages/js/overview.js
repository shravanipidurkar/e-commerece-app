import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/overview.css';
import { FiEye } from 'react-icons/fi';
import {
  PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis,
  CartesianGrid, ResponsiveContainer
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#4B9FE1', '#69C2B0', '#FFD166', '#FF8C94', '#A29BFE', '#A3CEDC'];

const Overview = () => {
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [data, setData] = useState({
    orders: 0,
    productsSold: 0,
    customers: 0,
    revenue: 0,
    topProducts: [],
    pendingOrders: [],
    orderStatusData: [],
    dailyRevenue: []
  });

  const storeId = localStorage.getItem('storeId');
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchOverview = async () => {
      if (!storeId) {
        console.warn('No storeId found in localStorage');
        return;
      }

      try {
        const res = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/overview/${storeId}`);
        const fetchedData = res.data;

        const formattedRevenue = fetchedData.dailyRevenue
          .filter(entry => entry.revenue !== null && !isNaN(entry.revenue))
          .map(entry => ({
            ...entry,
            revenue: Number(entry.revenue) || 0,
            originalDate: new Date(entry.date),
            date: new Date(entry.date).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short'
            })
          }))
          .sort((a, b) => a.originalDate - b.originalDate);

        setData({ ...fetchedData, dailyRevenue: formattedRevenue });
      } catch (err) {
        console.error('Error fetching overview:', err);
      }
    };

    const fetchStore = async () => {
      if (!storeId || !token) {
        console.warn('Missing storeId or token');
        return;
      }

      try {
        const res = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/stores_backup/${storeId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStore(res.data);
      } catch (err) {
        console.error('Error fetching store:', err);
      }
    };

    fetchOverview();
    fetchStore();
  }, [storeId, token]);

  return (
    <>
    

      <div className="overview-container">
        <h2>📊 Shop Overview</h2>

        <div className="overview-cards">
          <div className="card">🛒 Orders: <strong>{data.orders}</strong></div>
          <div className="card">📦 Products Sold: <strong>{data.productsSold}</strong></div>
          <div className="card">👥 Customers: <strong>{data.customers}</strong></div>
          <div className="card">💰 Revenue: ₹<strong>{Number(data.revenue || 0).toFixed(2)}</strong></div>
        </div>

        <div className="charts-row">
          {data.orderStatusData.length > 0 && (
            <div className="chart-box">
              <h3>📌 Order Status</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={data.orderStatusData}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {data.orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {data.dailyRevenue.length > 0 && (
            <div className="chart-box">
              <h3>📈 Daily Revenue</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart
                  data={data.dailyRevenue}
                  margin={{ top: 20, right: 20, left: 0, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    angle={-45}
                    textAnchor="end"
                    interval="preserveStartEnd"
                    height={60}
                  />
                  <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip />
                  <Legend verticalAlign="top" height={36} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4B9FE1"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {data.topProducts.length > 0 && (
          <div className="section">
            <h3>🏆 Top Selling Products</h3>
            <ul>
              {data.topProducts.map((product, index) => (
                <li key={index}>
                  {product.product_name} — {product.sold} pcs
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="section">
          <h3>🕓 Pending Orders</h3>
          {data.pendingOrders.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.pendingOrders.map((order, index) => (
                  <tr key={index}>
                    <td>{order.order_id}</td>
                    <td>{order.customer_name}</td>
                    <td>{order.status}</td>
                    <td>₹{parseFloat(order.total_amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No pending orders found.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Overview;
