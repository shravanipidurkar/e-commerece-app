// src/pages/CartPage.js
import { Link, useNavigate, useParams } from 'react-router-dom';
import '../css/cart.css';
import { useCart } from '../js/CartContext';
import Header from "../components/header";
import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import {loadStripe} from "@stripe/stripe-js"
const CartPage = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, setCartItems } = useCart();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const token = localStorage.getItem('customerToken');
    if (!token) {
      navigate(`/store/${storeId}/login`);
    }
  }, [storeId, navigate]);

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
/*
 const handleCheckout = async () => {
  const customerId = localStorage.getItem("customerId");
  const customerToken = localStorage.getItem("customerToken");

  try {
    const response = await axios.post(
      'http://localhost:5000/api/orders/checkout',
      {
        customerId,
        items: cartItems // ✅ Removed storeId
      },
      {
        headers: {
          Authorization: `Bearer ${customerToken}`
        }
      }
    );

    alert("✅ Thanks for your purchase! ");
    setCartItems([]);
    localStorage.removeItem('customerToken');
    navigate(`/store/${storeId}/login`);

  } catch (error) {
    console.error("Checkout failed:", error.response?.data || error.message);
    alert("❌ Failed to place order. Please try again.");
  }
};
*/
const makepayment = async () => {
  try {
    const stripe = await loadStripe("pk_test_51RkOOmPTEhkDHii1mSyoJDM9IfM5UOuba6BeHK6QHpH3mrugxGJ4VfHtdUrGpq7UT5koGtbXkToBvyDlJC1PUZMf00LFWWPxub");

    const customerId = localStorage.getItem("customerId");
    const storeId = localStorage.getItem("storeId");
    const body = {
      products: cartItems,
      customerId,
      storeId
    };
    console.log("🛒 Cart Items being sent to backend:", cartItems);


    const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/stripe/create-checkout-session`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body)
});


    if (!response.ok) {
      const error = await response.json();
      console.error("❌ API error:", error);
      alert("Failed to create Stripe session");
      return;
    }

    const session = await response.json();
    const result = await stripe.redirectToCheckout({ sessionId: session.id });

    if (result.error) {
      console.error("❌ Stripe redirect error:", result.error.message);
      alert("❌ Stripe redirect failed.");
    }
  } catch (err) {
    console.error("❌ makepayment error:", err.message);
    alert("Something went wrong during checkout.");
  }
};



  /*const session=await response.json();
const result=stripe.redirectToCheckout({
  sessionId:session.id
});
if(result.error){
  console.log(result.error);
}*/



  return (
    <div className="cart-container">
      <Header 
        cartCount={cartItems.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <h1 className="cart-title">Cart</h1>
      <div className="cart-content">
        <div className="cart-items">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <h2>Your cart is empty 🛒</h2>
              <Link to={`/store/${storeId}/template`}>
                <button className="shop-btn">Go Shopping</button>
              </Link>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.product_id} className="cart-item">
                <img src={item.image} alt={item.name} />
                <div className="cart-info">
                  <h3>{item.name}</h3>
                  {item.category && <p>Category: {item.category}</p>}
                  {item.description && <p>{item.description}</p>}
                  <p>Price: ₹{item.price.toLocaleString()}</p>
                  <p>Total: ₹{(item.price * item.quantity).toLocaleString()}</p>
                  <div className="quantity-buttons">
                    <button onClick={() => updateQuantity(item.product_id, -1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product_id, 1)}>+</button>
                  </div>
                </div>
                <button className="remove-btn" onClick={() => removeFromCart(item.product_id)}>🗑️</button>
              </div>
            ))
          )}
        </div>
        {cartItems.length > 0 && (
          <div className="cart-summary">
            <h2>Summary</h2>
            <p>{cartItems.length} Item(s)</p>
            <p>Total: ₹{total.toLocaleString()}</p>
            <button onClick={makepayment} className="checkout-btn">Checkout</button>


          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
