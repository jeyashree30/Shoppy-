const mongoose = require("mongoose");
const Product = require("../models/Product");
require("dotenv").config();

const products = [
  {
    title: "T-shirt",
    image: "https://via.placeholder.com/150",
    price: 299,
    category: "Clothing",
  },
  {
    title: "Phone",
    image: "https://via.placeholder.com/150",
    price: 9999,
    category: "Electronics",
  },
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    await Product.deleteMany();
    await Product.insertMany(products);
    console.log("✨ Products inserted");
    process.exit();
  })
  .catch((err) => console.error(err));
