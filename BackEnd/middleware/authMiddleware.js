const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Middleware to protect routes by verifying JWT token from cookies
 */
const auth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized. No token provided." });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Look up the user by ID
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized. User not found." });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (err) {
    console.error("🔒 Auth Middleware Error:", err.message);
    return res.status(401).json({ message: "Unauthorized. Invalid token." });
  }
};

module.exports = auth;
