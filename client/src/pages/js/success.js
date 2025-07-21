import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../js/CartContext';
import '../css/success.css';

const SuccessPage = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const { setCartItems } = useCart();

  useEffect(() => {
    const customerId = localStorage.getItem("customerId");
    const customerToken = localStorage.getItem("customerToken");

    if (!customerId || !customerToken) {
      navigate(`/store/${storeId}/login`);
      return;
    }

    // Clear cart on mount
    setCartItems([]);
  }, [setCartItems, navigate, storeId]);

  const handleLogout = () => {
    localStorage.removeItem("customerToken");
    navigate(`/store/${storeId}/login`);
  };

  const handleAddFeedback = () => {
    navigate(`/store/${storeId}/add`);
  };

  return (
    <div className="success-container">
      <h1>🎉 Payment Successful!</h1>
      <p>Thank you for your purchase.</p>

      <div className="success-buttons">
  <button className="feedback-btn" onClick={handleAddFeedback}>
    📝 Add Feedback
  </button>

  <div className="button-group">
    <button className="shop-btn" onClick={() => navigate(`/store/${storeId}/template`)}>
      🛍️ Continue Shopping
    </button>

    <button className="logout-btn" onClick={handleLogout}>
      🔐 Logout
    </button>
  </div>
</div>

    </div>
  );
};

export default SuccessPage;
