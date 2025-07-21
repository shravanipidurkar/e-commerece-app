import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Home.css';
import cubeImage from '../../images/home-page-icon.jpg'; 
const Home = () => {
  return (
    <div className="home-wrapper">
      {/* Navbar */}
      <nav className="home-navbar">
        <div className="home-logo">DUKAANIFY</div>
        <div className="home-nav-buttons">
          <Link to="/login"><button className="home-btn">Login</button></Link>
          <Link to="/signup"><button className="home-btn primary">Get Started</button></Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="home-hero">
        <div className="hero-text">
          <h1>
            Manage your business more efficiently.<br /> <span>Build. Launch. Grow.</span>
          </h1>
          <p>
            Think big — and grow bigger — with our flexible, professional-grade ecommerce platform.
          </p>
          <div className="hero-buttons">
            <Link to="/explore"><button className="home-btn primary">Explore Platform</button></Link>
            <Link to="/login"><button className="home-btn outline">Get Started</button></Link>
          </div>
        </div>

        <div className="hero-image">
          <img src={cubeImage} alt="Cube illustration" />
        </div>
      </div>
    </div>
  );
};

export default Home;
