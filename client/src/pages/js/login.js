import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/login.css';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
        rememberMe
      });

      const { token, user } = response.data;

      // ✅ Store everything needed
      localStorage.setItem('authToken', token);
      localStorage.setItem('storeId', user.storeId);      // ✅ required for store filtering
      localStorage.setItem('userType', user.userType);    // optional
      localStorage.setItem('userEmail', user.email);      // optional

      
      if (user.userType === 'shop_owner') {
        alert('Login successful!');
        navigate('/AdminOverview');
      } else if (user.userType === 'admin') {
        alert('Login successful as Admin!');
        navigate('/admin/owner-admin');
      } else {
        alert('You are not authorized to access this dashboard.');
        // Optionally navigate to a generic page or logout
      }
    } catch (err) {
      console.error('Login error:', err.response?.data);
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-image">
          <img
            src="https://i.pinimg.com/736x/7a/f9/f8/7af9f8b2e5bd6efd5fda10ef99ebb127.jpg"
            alt="Login visual"
          />
        </div>

        <div className="login-content">
          <div className="login-header">
            <h1>DUKAANIFY</h1>
            <p className="tagline">Track your store performance and get actionable insights</p>
            <h2>Welcome back!</h2>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="form-options">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="rememberMe">Remember me</label>
              </div>
              <a href="/forgot-password" className="forgot-password">Forgot password?</a>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="signup-link">
            Don't have an account? <a href="/signup">Sign up</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
