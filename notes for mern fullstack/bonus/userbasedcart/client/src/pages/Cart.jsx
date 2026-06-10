import { useEffect, useState } from "react";
import axios from "axios";

function Cart() {
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = () => {
        axios
            .get("http://localhost:5000/api/cart", { withCredentials: true })
            .then((res) => setCartItems(res.data))
            .catch((err) => console.error("Cart error:", err));
    };

    const getTotal = () =>
        cartItems.reduce((sum, itemObj) => sum + (itemObj.item?.price || 0), 0);

    const clearCart = async () => {
        try {
            await axios.delete("http://localhost:5000/api/cart", {
                withCredentials: true,
            });
            setCartItems([]);
        } catch (err) {
            console.error("Error clearing cart:", err);
        }
    };

    return (
        <div className="cart-container">
            <h2>Your Cart</h2>
            {cartItems.length === 0 ? (
                <div className="cart-empty">
                    <p>No items in cart.</p>
                </div>
            ) : (
                <>
                    <div className="cart-items">
                        {cartItems.map((itemObj, idx) => {
                            const item = itemObj.item || {};
                            return (
                                <div key={idx} className="cart-item">
                                    {item.thumbnail && (
                                        <img
                                            src={item.thumbnail}
                                            className="cart-item-thumbnail"
                                            alt={item.title}
                                        />
                                    )}
                                    <div className="cart-item-details">
                                        <h3 className="cart-item-title">{item.title || "Unnamed Item"}</h3>
                                        <p className="cart-item-price">Price: ${item.price ?? "N/A"}</p>
                                        <p className="cart-item-description">{item.description || "No description"}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="cart-summary">
                        <div className="cart-total">
                            Total: <span>${getTotal()}</span>
                        </div>
                        <button className="clear-cart-btn" onClick={clearCart}>
                            Clear Cart
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default Cart;
