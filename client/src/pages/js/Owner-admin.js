import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Store, Users, ShoppingCart, DollarSign } from 'lucide-react';
import '../css/OwnerAdmin.css'; // custom CSS
export default function OwnerAdmin() {
  const token = localStorage.getItem('token');

  const [currentPage, setCurrentPage] = useState(1);
  const storesPerPage = 10;
  const [searchTerm, setSearchTerm] = useState('');
const [sortOrder, setSortOrder] = useState('desc');
const [filterStatus, setFilterStatus] = useState('');



  const [stats, setStats] = useState({
    totalStores: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalSales: 0,
  });

  const [storeData, setStoreData] = useState([]);
  useEffect(() => {
    fetchSummary();
    fetchStores();
  }, []);
  

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const fetchSummary = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/admin/summary`,config);
      console.log('Summary data:', data);

      setStats({
        totalStores: data.total_stores,
        totalCustomers: data.total_customers,
        totalProducts: data.total_products,
        totalSales: data.total_sales,
      });
    } catch (err) {
      console.error('Summary fetch failed:', err);
    }
  };

  const fetchStores = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/admin/stores`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          search: searchTerm,
          sort: sortOrder,
          status: filterStatus
        }
      });
      
      setStoreData(data);
      setCurrentPage(1); // Reset to page 1 on new fetch
    } catch (err) {
      console.error('Store fetch failed:', err);
    }
  };
  
  const toggleStoreStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'enabled' ? 'disabled' : 'enabled';
    try {
      await axios.put(
        `${process.env.REACT_APP_SERVER_URL}/api/admin/stores/${id}/status`,
        { status: newStatus },
        config
      );
      
      fetchStores(); // Refresh the store list after update
    } catch (err) {
      console.error('Failed to update store status:', err.response?.data || err.message);
    }
  };


  
  const handleLogout = () => {
    // Example: remove token from localStorage and reload
    localStorage.removeItem('token'); // or whatever key you use
    window.location.href = '/login'; // adjust this based on your routing
  };
  
  const indexOfLastStore = currentPage * storesPerPage;
  const indexOfFirstStore = indexOfLastStore - storesPerPage;
  const currentStores = storeData.slice(indexOfFirstStore, indexOfLastStore);
  const totalPages = Math.ceil(storeData.length / storesPerPage);

  const SummaryCard = ({ title, value, icon }) => (
    <div className="owner-admin-summary-card">
  <div className="owner-admin-summary-icon-wrapper">
    <div className="owner-admin-summary-icon">{icon}</div>
  </div>
  <div className="owner-admin-summary-text">
    <h2 className="owner-admin-summary-title">{title}</h2>
    <p className="owner-admin-summary-value">{value}</p>
  </div>
</div>

  );

  return (
    <div className="owner-admin-container">
      <h1 className="owner-admin-heading">Admin Dashboard</h1>

      <div className="owner-admin-summary-grid">
        <SummaryCard title="Total Stores" value={stats.totalStores} icon={<Store size={32} />} />
        <SummaryCard title="Customers" value={stats.totalCustomers} icon={<Users size={32} />} />
        <SummaryCard title="Products" value={stats.totalProducts} icon={<ShoppingCart size={32} />} />
        <SummaryCard title="Total Sales" value={`₹${stats.totalSales}`} icon={<DollarSign size={32} />} />
      </div>

      <div className="owner-admin-table-wrapper">
      <div className="owner-admin-header">

        <h2 className="owner-admin-table-heading">All Stores</h2>
        <button className="owner-admin-logout-btn" onClick={handleLogout}>Logout</button>
</div>
        <div className="owner-admin-controls">
  <input
    type="text"
    placeholder="Search by store name or owner email"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="owner-admin-search-input"
  />
  <select
    value={sortOrder}
    onChange={(e) => setSortOrder(e.target.value)}
    className="owner-admin-select"
  >
    <option value="desc">Sort by ID ↓(Asc)</option>
    <option value="asc">Sort by ID ↑(Desc)</option>
  </select>
  <select
    value={filterStatus}
    onChange={(e) => setFilterStatus(e.target.value)}
    className="owner-admin-select"
  >
    <option value="">All Status</option>
    <option value="enabled">Enabled</option>
    <option value="disabled">Disabled</option>
  </select>
  <button className="owner-admin-btn" onClick={fetchStores}>Apply</button>
</div>

        <table className="owner-admin-table">
          <thead>
            <tr>
              <th>Owner Email</th>
              <th>Store ID</th>
              <th>Store Name</th>
              <th>Store Email</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentStores.map((store) => (
              <tr key={store.id}>
                <td>{store.owner_email}</td>
                <td>{store.id}</td>
                <td>{store.store_name}</td>
                <td>{store.store_email ||'NULL'}</td>
                <td>{store.store_status}</td>
                <td>
                  <button
                    className={
                      store.store_status === 'enabled'
                        ? 'owner-admin-btn-disable'
                        : 'owner-admin-btn-enable'
                    }
                    onClick={() => toggleStoreStatus(store.id, store.store_status)}
                  >
                    {store.store_status === 'enabled' ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          

        </table>
        <div className="pagination">
  <button
    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
    disabled={currentPage === 1}
  >
    Previous
  </button>

  {[...Array(totalPages)].map((_, i) => (
    <button
      key={i}
      className={currentPage === i + 1 ? 'active' : ''}
      onClick={() => setCurrentPage(i + 1)}
    >
      {i + 1}
    </button>
  ))}

  <button
    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
    disabled={currentPage === totalPages}
  >
    Next
  </button>
</div>

      </div>
    
    </div>
  );
}
