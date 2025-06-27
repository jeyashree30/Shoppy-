const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const path = require("path");


// ✅ Load environment variables
dotenv.config();

// ✅ Connect to MongoDB
connectDB();

// ✅ Initialize Express app
const app = express();

// ✅ Middleware
app.use(cors({
  origin: "http://localhost:3000", // React frontend URL
  credentials: true,               // ✅ Allow cookies from frontend
}));
app.use(express.json());           // ✅ Parse JSON body
app.use(cookieParser());           // ✅ Parse cookies

// ✅ Serve uploaded images publicly (e.g., http://localhost:5000/uploads/filename.jpg)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Routes
app.use("/api/products", require("./routes/products"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/cart", require("./routes/cart.routes"));
app.use("/api/orders", require("./routes/order"));

// Serve static React build files
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
  });
}

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
