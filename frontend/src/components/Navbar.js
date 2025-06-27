// src/components/Navbar.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContent";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      navigate(`/?search=${query}`);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">🛍️ Shoppy!</Link>
      </div>

      <div className="navbar-center">
        <input
          type="text"
          className="navbar-search"
          placeholder="Search for products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>

      <div className="navbar-right">
        {user ? (
          <>
            <div className="user-info">
              👤 <span className="user-name">{user.name}</span>
              <button onClick={handleLogout} className="nav-btn">Logout</button>
            </div>
            <Link to="/orders" className="nav-link">📦 My Orders</Link>
          </>
        ) : (
          <div className="auth-links">
            <Link to="/login" className="nav-link">Login</Link>
            <span className="divider">|</span>
            <Link to="/signup" className="nav-link">Sign Up</Link>
          </div>
        )}

        <Link to="/cart" className="nav-cart">
          🛒 Cart
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
