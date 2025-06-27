import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCart } from "../context/CartContent";
import { useAuth } from "../context/AuthContext";
import "./CartPage.css";

const CartPage = () => {
  const { user } = useAuth();
  const { cartItems, setCartItems, fetchCart } = useCart();
  const [loading, setLoading] = useState(false); // ✅ New

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = (productId, newQty) => {
    if (newQty < 1) return;
    axios
      .put(
        "https://shoppy-3.onrender.com/api/cart/update",
        { productId, quantity: newQty },
        { withCredentials: true }
      )
      .then(() => fetchCart())
      .catch((err) => console.error("Update error:", err));
  };

  const removeItem = (productId) => {
    axios
      .delete(`https://shoppy-3.onrender.com/api/cart/remove/${productId}`, {
        withCredentials: true,
      })
      .then(() => fetchCart());
  };

  const placeOrder = () => {
    setLoading(true); // ✅ Start loading

    axios
      .post("https://shoppy-3.onrender.com/api/cart/place-order", {}, { withCredentials: true })
      .then(() => {
        setCartItems([]);
        alert("✅ Order placed successfully!");
      })
      .catch(() => {
        alert("❌ Something went wrong. Try again.");
      })
      .finally(() => {
        setLoading(false); // ✅ Stop loading
      });
  };

  const getTotal = () =>
    cartItems.reduce((sum, item) => sum + item.productId.price * item.quantity, 0);

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>

      {loading && (
        <div className="loading-msg">⏳ Placing your order, please wait...</div>
      )}

      {!loading && (
        <>
          {cartItems.length === 0 ? (
            <p>Cart is empty 😕</p>
          ) : (
            <>
              {cartItems.map(({ productId, quantity }) => (
                <div key={productId._id} className="cart-item">
                  <img
                    src={`https://shoppy-3.onrender.com/${productId.image.replace(/^\/?/, "")}`}
                    alt={productId.name}
                  />
                  <div>
                    <h4>{productId.name}</h4>
                    <p>₹{productId.price} × {quantity}</p>
                    <div className="qty-controls">
                      <button onClick={() => updateQuantity(productId._id, quantity - 1)}>-</button>
                      <span>{quantity}</span>
                      <button onClick={() => updateQuantity(productId._id, quantity + 1)}>+</button>
                    </div>
                    <button onClick={() => removeItem(productId._id)}>Remove</button>
                  </div>
                </div>
              ))}
              <h3>Total: ₹{getTotal()}</h3>
              <button onClick={placeOrder} className="place-order-btn">
                📦 Place Order
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default CartPage;
