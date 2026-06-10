const express = require("express");
const { register, login, getUser,logout,updateUser } = require("../controllers/authController");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", getUser);
router.put("/update", updateUser);
router.post("/logout", logout);

module.exports = router;