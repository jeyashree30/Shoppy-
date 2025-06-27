// src/context/CartContent.js
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { user, loading } = useAuth(); // 👈 get loading + user

  const fetchCart = async () => {
    if (!user) return; // ⛔ no user, don't fetch
    try {
      const res = await axios.get("http://localhost:5000/api/cart", {
        withCredentials: true,
      });
      setCartItems([...(res.data.items || [])]);
    } catch (err) {
      console.error("❌ Fetch cart failed:", err);
    }
  };

 const addToCart = async (productId, quantity = 1) => {
  try {
    const res = await axios.post(
      "http://localhost:5000/api/cart/add",
      { productId, quantity },
      { withCredentials: true }
    );

    // ✅ Immediately update cartItems in context
    setCartItems(res.data.items);
    console.log("Added to cart:", res.data);
  } catch (err) {
    console.error("Add to cart error:", err);
  }
};

  const increaseQuantity = async (productId) => {
    try {
      await axios.post(
        "http://localhost:5000/api/cart/add",
        { productId, quantity: 1 },
        { withCredentials: true }
      );
      await fetchCart();
    } catch (err) {
      console.error("❌ Increase failed:", err);
    }
  };

  const decreaseQuantity = async (productId) => {
    try {
      await axios.post(
        "http://localhost:5000/api/cart/decrease",
        { productId },
        { withCredentials: true }
      );
      await fetchCart();
    } catch (err) {
      console.error("❌ Decrease failed:", err);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await axios.post(
        "http://localhost:5000/api/cart/remove",
        { productId },
        { withCredentials: true }
      );
      await fetchCart();
    } catch (err) {
      console.error("❌ Remove failed:", err);
    }
  };

  const clearCart = async () => {
    try {
      await axios.post("http://localhost:5000/api/cart/clear", {}, {
        withCredentials: true,
      });
      setCartItems([]);
    } catch (err) {
      console.error("❌ Clear failed:", err);
    }
  };

  // ✅ Fetch cart only AFTER auth is loaded and user is present
  useEffect(() => {
    if (!loading && user) {
      fetchCart();
    }
  }, [user]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        setCartItems,
        fetchCart,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
