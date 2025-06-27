const express = require("express");
const router = express.Router();
const Cart = require("../models/cart");
const Order = require("../models/Order");
const auth = require("../middleware/authMiddleware");
const sendEmail = require("../utils/mailer");

// ✅ Get cart items
router.get("/", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id }).populate("items.productId");
    res.status(200).json({ items: cart?.items || [] });
  } catch (err) {
    console.error("❌ Fetch cart error:", err);
    res.status(500).json({ message: "Server error while fetching cart" });
  }
});

// ✅ Add or increment item
router.post("/add", auth, async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const userId = req.user._id;

  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItem = cart.items.find(item => item.productId.equals(productId));

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    await cart.populate("items.productId");

    res.status(200).json({ message: "Item added to cart", items: cart.items });
  } catch (err) {
    console.error("❌ Add to cart error:", err);
    res.status(500).json({ message: "Server error while adding to cart" });
  }
});

// ✅ Update item quantity (used in frontend CartPage.js)
router.put("/update", auth, async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(i => i.productId.equals(productId));
    if (!item) return res.status(404).json({ message: "Item not found in cart" });

    item.quantity = quantity;
    await cart.save();
    await cart.populate("items.productId");

    res.status(200).json({ items: cart.items });
  } catch (err) {
    console.error("❌ Update quantity error:", err);
    res.status(500).json({ message: "Server error while updating quantity" });
  }
});

// ✅ Decrease item quantity (if used)
router.post("/decrease", auth, async (req, res) => {
  const { productId } = req.body;
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    const item = cart.items.find(i => i.productId.equals(productId));

    if (item) {
      item.quantity -= 1;
      if (item.quantity <= 0) {
        cart.items = cart.items.filter(i => !i.productId.equals(productId));
      }
      await cart.save();
    }

    await cart.populate("items.productId");
    res.status(200).json({ items: cart.items });
  } catch (err) {
    console.error("❌ Decrease error:", err);
    res.status(500).json({ message: "Server error while decreasing item" });
  }
});

// ✅ Remove specific item
router.delete("/remove/:productId", auth, async (req, res) => {
  const { productId } = req.params;
  try {
    const cart = await Cart.findOne({ userId: req.user._id });

    cart.items = cart.items.filter(item => !item.productId.equals(productId));
    await cart.save();

    await cart.populate("items.productId");
    res.status(200).json({ message: "Item removed", items: cart.items });
  } catch (err) {
    console.error("❌ Remove item error:", err);
    res.status(500).json({ message: "Server error while removing item" });
  }
});

// ✅ Clear full cart
router.post("/clear", auth, async (req, res) => {
  try {
    await Cart.deleteOne({ userId: req.user._id });
    res.status(200).json({ message: "Cart cleared" });
  } catch (err) {
    console.error("❌ Clear cart error:", err);
    res.status(500).json({ message: "Server error while clearing cart" });
  }
});

router.post("/place-order", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const total = cart.items.reduce(
      (sum, item) => sum + item.productId.price * item.quantity,
      0
    );

    const itemsHtml = cart.items.map(item =>
      `<li>${item.productId.name} (Qty: ${item.quantity}) - ₹${item.productId.price}</li>`
    ).join("");

    const htmlContent = `
  <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; max-width: 600px; margin: auto;">
    <h2 style="color: #4CAF50;">🛍️ Shoppy Store – Order Confirmation</h2>

    <p>Hi <strong>${req.user.name}</strong>,</p>
    <p>Thank you for shopping with us! Here are your order details:</p>

    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
      <thead>
        <tr style="background-color: #f2f2f2;">
          <th style="text-align: left; padding: 8px;">Product</th>
          <th style="text-align: center; padding: 8px;">Qty</th>
          <th style="text-align: right; padding: 8px;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${cart.items.map(item => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.productId.name}</td>
            <td style="padding: 8px; text-align: center; border-bottom: 1px solid #ddd;">${item.quantity}</td>
            <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">₹${item.productId.price}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <p style="margin-top: 20px; font-size: 16px;">
      <strong>Total Amount:</strong> ₹${total}
    </p>

    <p style="margin-top: 30px;">We will notify you once your order is shipped.</p>
    <p>Thanks for choosing <strong>Shoppy!</strong> 💚</p>

    <hr style="margin-top: 40px;" />
    <small style="color: #888;">This is an automated email. Please do not reply.</small>
  </div>
`;


    // ✅ ✉️ Send emails
    await sendEmail(req.user.email, "Your Shoppy Order Confirmation", htmlContent);
    await sendEmail(process.env.GOOGLE_MAIL, `New Order from ${req.user.name}`, htmlContent);

    // ✅ Save order
    const newOrder = new Order({
      user: req.user._id,
      products: cart.items.map(item => ({
        productId: item.productId._id,
        quantity: item.quantity,
      })),
      totalAmount: total,
    });

    await newOrder.save();
    await Cart.deleteOne({ userId: req.user._id });

    res.status(200).json({ message: "Order placed and emails sent!" });

  } catch (err) {
    console.error("❌ Order error:", err);
    res.status(500).json({ message: "Server error while placing order" });
  }
});


module.exports = router;
