import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./header.css";

const Header = ({ cartCount = 0, searchQuery, setSearchQuery, store }) => {
  const { storeId } = useParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="header">
      {/* 🔹 Left Section */}
      <div className="header-left">
        <div className="logo-container">
          {store?.logo ? (
            <img
              src={`http://localhost:5000${store.logo}`}
              alt="store logo"
              className="store-logo"
            />
          ) : (
            <span className="fallback-logo">🛍️</span>
          )}
          <h2>{store?.store_name || "Store Name"}</h2>
        </div>

        <Link to={`/store/${storeId}/CustomerProfile`} className="profile-icon" title="Profile">
          🧑
        </Link>

        {/* Hamburger for small screens */}
        <button
          className="hamburger"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>
      </div>

      {/* 🔹 Nav & Right Section - Hidden/Shown on mobile */}
      <div className={`header-menu ${isMenuOpen ? "open" : ""}`}>
        <nav className="nav-links">
          <Link to={`/store/${storeId}/template`}>Home</Link>
<Link to={`/store/${storeId}/template`}>About</Link>
<Link to={`/store/${storeId}/cart`}>Cart ({cartCount})</Link>

         
        </nav>

        <div className="header-right">
          {store?.facebook && (
            <a href={store.facebook} target="_blank" rel="noopener noreferrer" title="Facebook">
              📘
            </a>
          )}
          {store?.instagram && (
            <a href={store.instagram} target="_blank" rel="noopener noreferrer" title="Instagram">
              📸
            </a>
          )}
          <div className="search-box">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && console.log("Search:", searchQuery)
              }
            />
            <span>🔍</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
