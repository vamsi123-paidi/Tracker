const CartItem = require("../models/CartItem");
const jwt = require("jsonwebtoken");

exports.addToCart = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ msg: "Unauthorized" });

        const user = jwt.verify(token, "secret");
        const item = new CartItem({ userId: user.id, item: req.body });
        await item.save();

        res.json({ msg: "Item added to cart" });
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
};

exports.getCart = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ msg: "Unauthorized" });

        const user = jwt.verify(token, "secret");
        const items = await CartItem.find({ userId: user.id });

        res.json(items);
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
};

exports.clearCart = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ msg: "Unauthorized" });

    const user = jwt.verify(token, "secret");
    await CartItem.deleteMany({ userId: user.id });

    res.json({ msg: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

