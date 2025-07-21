import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/CustomerProfile.css";

const CustomerProfile = () => {
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { storeId } = useParams(); // ✅ get storeId from URL if dynamic

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const token = localStorage.getItem("customerToken");
        if (!token) {
          setError("Please log in ");
          return;
        }

        const localData = localStorage.getItem("customerData");
        if (!localData) {
          setError("No customer data found in localStorage.");
          return;
        }

        const parsed = JSON.parse(localData);
        const customerId = parsed.id;

        const response = await fetch(`http://localhost:5000/api/customers/${customerId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || "Failed to fetch customer data");
        }

        const data = await response.json();

        if (!data.id || !data.name) {
          throw new Error("Invalid customer data structure");
        }

        setCustomer(data);
      } catch (err) {
        console.error("❌ Failed to fetch customer data:", err);
        setError(err.message);
      }
    };

    fetchCustomerData();
  }, []);

  // ✅ Logout handler
  const handleLogout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerData");
    localStorage.removeItem("customerId");
    localStorage.removeItem("storeId");
    navigate(`/store/${storeId}/login`);
  };

  if (error) return <div className="customer-profile-error">⚠️ {error}</div>;
  if (!customer) return <div className="customer-profile-loading">Loading profile...</div>;

  return (
    <div className="customer-profile">
      <h2>👤 Customer Profile</h2>
      <div className="profile-card">
        <p><strong>ID:</strong> {customer.id}</p>
        <p><strong>Name:</strong> {customer.name}</p>
        <p><strong>Email:</strong> {customer.email}</p>
        <p><strong>Phone:</strong> {customer.phone}</p>
        <p><strong>Address:</strong> {customer.address}</p>
        <p><strong>Date Joined:</strong> {new Date(customer.date_joined).toLocaleDateString()}</p>
      </div>

      {/* ✅ Logout Button */}
      <div className="logout-btn-wrapper">
  <button className="logout-btn" onClick={handleLogout}>
    Logout
  </button>
</div>

    </div>
  );
};

export default CustomerProfile;
