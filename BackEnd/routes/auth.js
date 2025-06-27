const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware"); // ✅ for /me route
const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });

    await newUser.save();

    res.status(201).json({
      message: "Signup successful",
      user: { name: newUser.name, email: newUser.email },
    });
  } catch (err) {
    res.status(500).json({ error: "Signup failed" });
  }
});

// Login — store token in cookie and return user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid email" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    user.token = token;
    await user.save();

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // ❌ Keep false in local dev, set to true in production (HTTPS)
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: { name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// ✅ Protected route to get user info from token
router.get("/me", auth, async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Logout — clear token cookie
// routes/auth.js
router.get("/logout", auth, async (req, res) => {
  try {
    // Clear token in database
    const user = await User.findById(req.user._id);
    if (user) {
      user.token = null;
      await user.save();
    }

    // Clear cookie
    res.clearCookie("token", {
      path: "/",              // 🔐 VERY important
      httpOnly: true,
      secure: false,          // true in production
      sameSite: "Lax",
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Logout failed" });
  }
});



module.exports = router;
