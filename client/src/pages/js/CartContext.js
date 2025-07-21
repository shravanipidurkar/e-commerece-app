import React, { createContext, useContext, useState } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
  setCartItems((prev) => {
    const existing = prev.find((item) => item.product_id === product.product_id);
    if (existing) {
      return prev.map((item) =>
        item.product_id === product.product_id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    }
    return [...prev, { ...product, quantity: 1 }];
  });
};

const updateQuantity = (product_id, delta) => {
  setCartItems((prev) =>
    prev
      .map((item) =>
        item.product_id === product_id
          ? { ...item, quantity: item.quantity + delta }
          : item
      )
      .filter((item) => item.quantity > 0)
  );
};

const removeFromCart = (product_id) => {
  setCartItems((prev) => prev.filter((item) => item.product_id !== product_id));
};

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, updateQuantity, removeFromCart,setCartItems, }}
    >
      {children}
    </CartContext.Provider>
  );
};

// ✅ Add this custom hook
export const useCart = () => useContext(CartContext);
