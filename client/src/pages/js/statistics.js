import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js';
import '../css/statistics.css'; 
//npm install react-chartjs-2 chart.js

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const Statistics = () => {
  const [totalSales, setTotalSales] = useState(0);
  const [onlineSales, setOnlineSales] = useState(Array(7).fill(0));
  const [offlineSales, setOfflineSales] = useState(Array(7).fill(0));
  const [rawData, setRawData] = useState(null);
  const [showRawData, setShowRawData] = useState(false);
  const [loading, setLoading] = useState(true);

  const dayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const storeId = localStorage.getItem('storeId');

  useEffect(() => {
    if (!storeId) return;

    const fetchStats = async () => {
      try {
        const [totalRes, dateRes] = await Promise.all([
          axios.get('http://localhost:5000/api/statistics', { params: { storeId } }),
          axios.get('http://localhost:5000/api/statistics/by-date', { params: { storeId } }),
        ]);

        setTotalSales(totalRes.data.total_sales || 0);
        setRawData(dateRes.data);

        const onlineMap = Array(7).fill(0);
        const offlineMap = Array(7).fill(0);

        Object.entries(dateRes.data.online).forEach(([date, total]) => {
          const day = new Date(date).getDay();
          onlineMap[day] += total;
        });

        Object.entries(dateRes.data.offline).forEach(([date, total]) => {
          const day = new Date(date).getDay();
          offlineMap[day] += total;
        });

        setOnlineSales(onlineMap);
        setOfflineSales(offlineMap);
      } catch (err) {
        console.error('❌ Failed to load statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [storeId]);

  const chartData = (data, color) => ({
    labels: dayLabels,
    datasets: [
      {
        label: '',
        data,
        fill: true,
        backgroundColor: `${color}22`,
        borderColor: color,
        pointRadius: 4,
        tension: 0.4,
      },
    ],
  });

  if (loading) return <div className="statistics-container">Loading store stats...</div>;

  return (
    <div className="statistics-container">
      <h2 className="page-title">Store Statistics</h2>

      <div className="total-sales-box">
        <p>Total amount sold</p>
        <h1>₹{totalSales.toLocaleString()}</h1>
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <div className="card-header">
            <h3>Online Sales</h3>
            <span>₹{onlineSales.reduce((a, b) => a + b, 0).toLocaleString()}</span>
          </div>
          <div className="chart-container">
            <Line 
              data={chartData(onlineSales, '#16a34a')} 
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>

        <div className="chart-card">
          <div className="card-header">
            <h3>Offline Sales</h3>
            <span>₹{offlineSales.reduce((a, b) => a + b, 0).toLocaleString()}</span>
          </div>
          <div className="chart-container">
            <Line 
              data={chartData(offlineSales, '#2563eb')} 
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>
      </div>

      <button className="details-btn" onClick={() => setShowRawData(prev => !prev)}>
        {showRawData ? 'Hide Data' : 'See more details'}
      </button>

      {showRawData && rawData && (
        <div className="raw-data-section">
          <h4>Sales by Date </h4>
          <pre>{JSON.stringify(rawData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Statistics;
