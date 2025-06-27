// src/pages/Cart.js
import React from "react";
import { useCart } from "../context/CartContent";
import "./Cart.css";

const Cart = () => {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>

      {cartItems.length === 0 ? (
        <p>No items in the cart yet.</p>
      ) : (
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item._id} className="cart-item">
              <img src={`http://shoppy-3.onrender.com/${productId.image.replace(/^\/?/, "")}`} alt={productId.name} />

              <div className="cart-details">
                <h4>{item.name}</h4>
                <p>Price: ₹{item.price}</p>

                <div className="quantity-controls">
                  <button onClick={() => decreaseQuantity(item._id)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => increaseQuantity(item._id)}>+</button>
                </div>

                <p>Total: ₹{item.price * item.quantity}</p>
                <button onClick={() => removeFromCart(item._id)} className="remove-btn">
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="cart-summary">
            <h3>Grand Total: ₹{calculateTotal()}</h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
