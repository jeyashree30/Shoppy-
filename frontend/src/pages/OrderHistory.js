// src/pages/OrderHistory.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./OrderHistory.css";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios
      .get("http://shoppy-3.onrender.com/api/orders/my-orders", { withCredentials: true })
      .then((res) => setOrders(res.data.orders))
      .catch((err) => console.error("❌ Order fetch error:", err));
  }, []);

  return (
    <div className="order-history">
      <h2>📦 Your Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="order-card">
            <p><strong>Ordered On:</strong> {new Date(order.orderedAt).toLocaleString()}</p>
            <p><strong>Total:</strong> ₹{order.totalAmount}</p>
            <div className="order-items">
              {order.products.map(({ productId, quantity }) => (
                <div key={productId._id} className="order-item">
                  <img src={`http://shoppy-3.onrender.com/${productId.image.replace(/^\/?/, "")}`} alt={productId.name} />
                  <div>
                    <h4>{productId.name}</h4>
                    <p>Qty: {quantity}</p>
                    <p>Price: ₹{productId.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default OrderHistory;
