import React from 'react';
import '../css/features.css';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa'; //npm install react-icons

function FeaturesPage() {
  return (
    <div className="features-page">
      
      <div className="features-back">
         <Link to="/" className="back-link">
           <FaArrowLeft className="back-icon" />Back to Home</Link>
      </div>

      <header className="features-header">
        <h1>Why Choose Dukaanify?</h1>
        <p>All-in-one tools to help you launch and grow your online store.</p>
      </header>
      

      <section className="features-section">
        <div className="feature-box">
          <h2>🛍️ Easy Store Creation</h2>
          <p>Build a professional store without any coding knowledge. Customize the templates and get started in minutes.</p>
        </div>

        <div className="feature-box">
          <h2>📦 Inventory Management</h2>
          <p>Track your products, add new products , and manage your inventory in one place.</p>
        </div>

        <div className="feature-box">
          <h2>💳 Secure Payments</h2>
          <p>Accept payments through UPI, cards, wallets, and more with our built-in secure checkout system.</p>
        </div>

        <div className="feature-box">
          <h2>📈 Real-time Analytics</h2>
          <p>Get insights into your sales, visitors, and revenue. Make data-driven decisions to grow faster.</p>
        </div>

        <div className="feature-box">
          <h2>📲 Mobile-Ready</h2>
          <p>Your store will look and work great on all screen sizes — desktop, tablet, or mobile.</p>
        </div>

        <div className="feature-box">
          <h2>👨‍💼 Customer Management</h2>
          <p>Keep track of your customers, orders, and feedback to build long-term relationships.</p>
        </div>
      </section>

      <div className="get-started-box">
        <h2>Ready to build your store?</h2>
        <Link to="/login"><button className="explore-btn">Get Started Now</button></Link>
      </div>
    </div>
  );
}

export default FeaturesPage;
