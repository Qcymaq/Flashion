import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { endpoints } from '../config/api';

interface CartItem {
  _id: string;
  product_id: string;
  quantity: number;
  color?: string;
  size?: string;
  product_name: string;
  product_price: number;
  product_image: string;
  created_at: string;
  updated_at: string;
}

interface Cart {
  _id: string;
  user_id: string;
  items: CartItem[];
  total_price: number;
  created_at: string;
  updated_at: string;
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  selectedItems: string[];
  setSelectedItems: (items: string[] | ((prev: string[]) => string[])) => void;
  addToCart: (productId: string, quantity: number, color?: string, size?: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  getSelectedItems: () => CartItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(endpoints.cart.get, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }

      const data = await response.json();
      setCart(data);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [fetchCart]);

  const addToCart = async (productId: string, quantity: number, color?: string, size?: string) => {
    try {
      setError(null);
      if (!/^[0-9a-fA-F]{24}$/.test(productId)) {
        throw new Error('Invalid product ID format');
      }

      const response = await fetch(endpoints.cart.add, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          quantity,
          color,
          size,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to add item to cart');
      }

      const data = await response.json();
      setCart(data);
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError(err instanceof Error ? err.message : 'Failed to add item to cart');
      throw err;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      setError(null);
      if (!/^[0-9a-fA-F]{24}$/.test(itemId)) {
        throw new Error('Invalid item ID format');
      }

      const response = await fetch(`${endpoints.cart.update(itemId)}?quantity=${quantity}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to update cart');
      }

      const data = await response.json();
      setCart(data);
    } catch (err) {
      console.error('Error updating cart:', err);
      setError(err instanceof Error ? err.message : 'Failed to update cart');
      throw err;
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      setError(null);
      const response = await fetch(endpoints.cart.remove(itemId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove item from cart');
      }

      const data = await response.json();
      setCart(data);
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove item from cart');
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      setError(null);
      const response = await fetch(endpoints.cart.clear, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }

      const data = await response.json();
      setCart(data);
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError(err instanceof Error ? err.message : 'Failed to clear cart');
      throw err;
    }
  };

  const getSelectedItems = useCallback(() => {
    if (!cart) return [];
    return cart.items.filter(item => selectedItems.includes(item._id));
  }, [cart, selectedItems]);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        selectedItems,
        setSelectedItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart,
        getSelectedItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 