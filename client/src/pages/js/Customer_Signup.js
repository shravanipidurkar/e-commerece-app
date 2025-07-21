import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../css/Customer_Signup.css';
import cus_signup_img from '../../images/cus_signup.jpg';
import axios from 'axios';

function Customer_Signup() {
  const [cusName, setCusName] = useState('');
  const [cusEmail, setCusEmail] = useState('');
  const [cusPhone, setCusPhone] = useState('');
  const [cusAddress, setCusAddress] = useState('');
  const [cusPassword, setCusPassword] = useState('');
  const [cusConfirmPassword, setCusConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { storeId } = useParams(); // ✅ Get storeId from URL

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!cusName || !cusEmail || !cusPhone || !cusAddress || !cusPassword || !cusConfirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (!cusEmail.includes('@')) {
      setError('Enter a valid email.');
      return;
    }

    if (!/^\d{10}$/.test(cusPhone)) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }

    if (cusPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (cusPassword !== cusConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');

    try {
      const res = await axios.post(`${process.env.REACT_APP_SERVER_URL}/api/customer/auth/signup`, {
        customer_name: cusName,
        email: cusEmail,
        password: cusPassword,
        phone_number: cusPhone,
        address: cusAddress,
        store_id: storeId // ✅ storeId from route
      });

      alert('Signup successful! Please login.');
      navigate(`/store/${storeId}/login`); // ✅ back to login for that store
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Signup failed.');
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-box">
        <div className="signup-image-section">
          <img src={cus_signup_img} alt="Signup" />
        </div>

        <div className="signup-form-section">
          <div className="signup-form-content">
            <h2>Sign Up</h2>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Full Name"
                value={cusName}
                onChange={(e) => setCusName(e.target.value)}
              />
              <input
                type="email"
                placeholder="Email"
                value={cusEmail}
                onChange={(e) => setCusEmail(e.target.value)}
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={cusPhone}
                onChange={(e) => setCusPhone(e.target.value)}
              />
              <input
                type="text"
                placeholder="Address"
                value={cusAddress}
                onChange={(e) => setCusAddress(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                value={cusPassword}
                onChange={(e) => setCusPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={cusConfirmPassword}
                onChange={(e) => setCusConfirmPassword(e.target.value)}
              />

              {error && <p className="error-msg">{error}</p>}

              <button type="submit">Sign Up</button>
            </form>

            <p className="signup-text">
              Already have an account?{' '}
              <span onClick={() => navigate(`/store/${storeId}/login`)}>Login</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Customer_Signup;
