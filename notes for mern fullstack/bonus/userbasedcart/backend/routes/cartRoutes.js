const express = require("express");
const router = express.Router();
const { addToCart, getCart,clearCart } = require("../controllers/cartController");

router.post("/", addToCart);
router.get("/", getCart);
router.delete("/", clearCart);

module.exports = router;
