const express = require("express");
const multer = require("multer");
const path = require("path");
const Product = require("../models/Product");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `image-${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, price, discount, category } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : ""; // ✅ fixed

    const newProduct = new Product({
      name,
      price,
      discount,
      category,
      image: imagePath,
    });

    const saved = await newProduct.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Product creation error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/products/search?q=shoe
router.get("/search", async (req, res) => {
  const query = req.query.q;
  try {
    const regex = new RegExp(query, "i"); // case-insensitive match
    const products = await Product.find({ name: regex });
    res.json(products);
  } catch (err) {
    console.error("❌ Search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});


module.exports = router;
