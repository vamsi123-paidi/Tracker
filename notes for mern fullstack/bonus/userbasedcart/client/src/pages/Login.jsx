import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext"; // make sure this path is correct

function Login() {
    const [user, setUserInput] = useState({ email: "", password: "" });
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const handleChange = (e) =>
        setUserInput({ ...user, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Login request
            await axios.post("http://localhost:5000/api/auth/login", user, {
                withCredentials: true,
            });

            // Fetch current user after login
            const res = await axios.get("http://localhost:5000/api/auth/me", {
                withCredentials: true,
            });

            setUser(res.data); // Update user context
            navigate("/dashboard");
        } catch (err) {
            console.error("Login failed:", err.response?.data?.msg || err.message);
            alert("Invalid email or password.");
        }
    };

    return (
        <div className="container">
            <form onSubmit={handleSubmit}>
                <h2>Login</h2>
                <input
                    name="email"
                    value={user.email}
                    onChange={handleChange}
                    required
                    placeholder="Email"
                />
                <input
                    name="password"
                    type="password"
                    value={user.password}
                    onChange={handleChange}
                    required
                    placeholder="Password"
                />
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default Login;
