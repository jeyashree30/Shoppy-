// src/components/ProductCard.js

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContent";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    if (!user) {
      navigate(`/login?redirect=${location.pathname}`);
      return;
    }

    try {
      await addToCart(product._id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch (err) {
      console.error("❌ Failed to add to cart:", err.response?.data || err.message);
      alert("Failed to add to cart. Please try again.");
    }
  };

  // 🧠 On image click, open zoom in new tab
  const handleImageClick = () => {
    const fullImageUrl = `http://localhost:5000/${product.image.replace(/^\/?/, "")}`;
    window.open(fullImageUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="product-card">
      <img
        src={`http://localhost:5000/${product.image.replace(/^\/?/, "")}`}
        alt={product.name}
        onClick={handleImageClick}
        style={{ cursor: "zoom-in" }}
      />
      <h3>{product.name}</h3>
      <p className="price">₹{product.price}</p>
      {product.discount && <p className="discount">Save ₹{product.discount}</p>}
      <button className={added ? "added" : ""} onClick={handleAddToCart}>
        {added ? "✔️ Added!" : "Add to Cart"}
      </button>
    </div>
  );
};

export default ProductCard;
