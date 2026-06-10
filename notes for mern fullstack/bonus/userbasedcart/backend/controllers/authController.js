const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register
exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const hashed = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashed });
        await user.save();
        res.json({ msg: "User registered" });
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ msg: "Server error" });
    }
};

// Login
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, "secret", { expiresIn: "1d" });

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "Lax",
            secure: false, // set to true in production with HTTPS
        }).json({ msg: "Logged in" });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ msg: "Server error" });
    }
};

// Get Logged-in User Info
exports.getUser = async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ msg: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, "secret");
        const user = await User.findById(decoded.id).select("username email");
        if (!user) return res.status(404).json({ msg: "User not found" });

        res.json(user);
    } catch (err) {
        console.error("Get user error:", err);
        return res.status(401).json({ msg: "Invalid token" });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ msg: "Unauthorized" });

        const userData = jwt.verify(token, "secret");
        const updateData = { ...req.body };

        if (updateData.password && updateData.password.trim() !== "") {
            const hashedPassword = await bcrypt.hash(updateData.password, 10);
            updateData.password = hashedPassword;
        } else {
            delete updateData.password; // avoid overwriting with empty string
        }

        const updatedUser = await User.findByIdAndUpdate(
            userData.id,
            { $set: updateData },
            { new: true }
        );

        res.json(updatedUser);
    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ msg: "Server error" });
    }
};

// Logout
exports.logout = (req, res) => {
    res.clearCookie("token").json({ msg: "Lnpm " });
};
