const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
  userId: String,
  item: {
    title: String,
    price: Number,
    description: String,
    thumbnail: String
  }
});

module.exports = mongoose.model("cartelements", CartItemSchema);
