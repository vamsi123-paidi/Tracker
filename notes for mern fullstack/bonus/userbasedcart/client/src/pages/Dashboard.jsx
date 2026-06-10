import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { UserContext } from "../context/UserContext";

function Dashboard() {
    const [products, setProducts] = useState([]);
    const { user, setUser } = useContext(UserContext);
    const [formData, setFormData] = useState({
        username: user?.username || "",
        email: user?.email || "",
        password: ""
    });

    useEffect(() => {
        if (user) {
            axios.get("https://dummyjson.com/products")
                .then(res => setProducts(res.data.products))
                .catch(err => console.error(err));
        }
    }, [user]);

    const handleAddToCart = (item) => {
        axios.post("http://localhost:5000/api/cart", item, { withCredentials: true })
            .then(() => alert("Item added to cart"))
            .catch((err) => console.error("Add to cart error:", err));
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleProfileUpdate = (e) => {
        e.preventDefault();
        axios.put("http://localhost:5000/api/auth/update", formData, {
            withCredentials: true,
        })
            .then(res => {
                alert("Profile updated successfully");
                setUser(res.data);
            })
            .catch(err => console.error("Profile update failed:", err));
    };

    return (
        <div className="dashboard-container container">
            <h2>Welcome, {user?.username}</h2>

            {/* Edit Profile Section */}
            <div className="edit-profile">
                <h3>Edit Profile</h3>
                <form onSubmit={handleProfileUpdate}>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Username"
                        required
                    /><br />
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email"
                        required
                    /><br />
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="New Password (optional)"
                    /><br />
                    <button type="submit">Update Profile</button>
                </form>
            </div>

            {/* Product Section */}
            <h3>Products</h3>
            <div className="products-grid">
                {products.map(product => (
                    <div key={product.id} className="product-card">
                        <img
                            src={product.thumbnail}
                            className="product-thumbnail"
                            alt={product.title}
                        />
                        <div className="product-info">
                            <h4>{product.title}</h4>
                            <p>${product.price}</p>
                            <button
                                className="add-to-cart-btn"
                                onClick={() => handleAddToCart(product)}
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Dashboard;
