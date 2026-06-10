import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Navbar() {
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        axios.post("http://localhost:5000/api/auth/logout", {}, { withCredentials: true })
            .then(() => {
                setUser(null);
                navigate("/login");
            });
    };

    return (
        <nav>
            <div className="container">
                {user ? (
                    <div className="nav-links">
                        <span className="welcome-text">Welcome, {user.username}</span>
                        <Link to="/dashboard">Dashboard</Link>
                        <Link to="/cart">Cart</Link>
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                ) : (
                    <div className="nav-links">
                        <Link to="/login">Login</Link>
                        <Link to="/">Register</Link>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
