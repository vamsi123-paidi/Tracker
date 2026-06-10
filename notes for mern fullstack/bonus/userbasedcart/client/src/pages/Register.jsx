import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
    const [user, setUser] = useState({ username: "", email: "", password: "" });
    const navigate = useNavigate();

    const handleChange = e => setUser({ ...user, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        await axios.post("http://localhost:5000/api/auth/register", user, { withCredentials: true });
        navigate("/login");
    };

    return (
        <div className="container">
            <form onSubmit={handleSubmit}>
                <h2>Register</h2>
                <input name="username" onChange={handleChange} required placeholder="Username" />
                <input name="email" onChange={handleChange} required placeholder="Email" />
                <input name="password" type="password" onChange={handleChange} required placeholder="Password" />
                <button type="submit">Register</button>
            </form>
        </div>
    );
}

export default Register;
