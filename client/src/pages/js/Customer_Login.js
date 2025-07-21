import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../css/Customer_Login.css';
import cus_login_img from '../../images/cus_login.jpg';
import axios from 'axios';
import { useCart } from '../js/CartContext'; // ✅ Import useCart

function Customer_Login() {
  const [cusEmail, setCusEmail] = useState('');
  const [cusPassword, setCusPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { storeId } = useParams();
  const { addToCart } = useCart(); // ✅ Access addToCart from context

 const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!cusEmail || !cusPassword || !cusEmail.includes('@')) {
    setError('Please enter a valid email and password.');
    return;
  }

  setIsLoading(true);

  try {
    const res = await axios.post('http://localhost:5000/api/customer/auth/login', {
      email: cusEmail,
      password: cusPassword,
      store_id: storeId,
    });

    // ✅ Store token & IDs
    localStorage.setItem('customerToken', res.data.token);
    
    localStorage.setItem('customerId', res.data.user.id);
    localStorage.setItem('storeId', res.data.user.storeId);
    localStorage.setItem('customerData', JSON.stringify(res.data.user));

    // ✅ Handle redirect + cart restoration
    const redirectPath = localStorage.getItem('redirectAfterLogin');
    const pendingItem = localStorage.getItem('pendingCartItem');

    if (pendingItem) {
  try {
    const parsedItem = JSON.parse(pendingItem);
    addToCart(parsedItem);
  } catch (e) {
    console.warn('⚠️ Failed to restore pending cart item:', e);
  } finally {
    localStorage.removeItem('pendingCartItem');
  }
}



    localStorage.removeItem('redirectAfterLogin');

    navigate(redirectPath || `/store/${storeId}/template`);
  } catch (err) {
    console.error(err);
    setError(err.response?.data?.message || 'Login failed.');
  }
};


  return (
    <div className="login-wrapper">
      <div className="login-box">
        {/* LEFT - Image */}
        <div className="login-image-section">
          <img src={cus_login_img} alt="Login" />
        </div>

        {/* RIGHT - Form */}
        <div className="login-form-section">
          <div className="login-form-content">
            <h2>Sign In</h2>

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Email"
                value={cusEmail}
                onChange={(e) => setCusEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                value={cusPassword}
                onChange={(e) => setCusPassword(e.target.value)}
              />

              {error && <p className="error-msg">{error}</p>}

              <button type="submit" disabled={isLoading}>
  {isLoading ? 'Logging in...' : 'Login'}
</button>

            </form>

            <p className="signup-text">
              Don’t have an account?{' '}
              <span onClick={() => navigate(`/store/${storeId}/signup`)}>Sign up</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Customer_Login;
