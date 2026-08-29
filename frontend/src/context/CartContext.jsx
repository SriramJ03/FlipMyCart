import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { getCartApi, addToCartApi, updateCartItemApi, removeCartItemApi } from '../api/cart';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user || user.role !== 'buyer') {
      setItems([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    try {
      const { data } = await getCartApi();
      setItems(data.items);
      setTotal(data.total);
    } catch {
      // not fatal - cart just stays empty
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(async (productId, quantity = 1) => {
    await addToCartApi({ productId, quantity });
    await refresh();
  }, [refresh]);

  const updateItem = useCallback(async (itemId, quantity) => {
    await updateCartItemApi(itemId, { quantity });
    await refresh();
  }, [refresh]);

  const removeItem = useCallback(async (itemId) => {
    await removeCartItemApi(itemId);
    await refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ items, total, count: items.reduce((s, i) => s + i.quantity, 0), loading, refresh, addItem, updateItem, removeItem }),
    [items, total, loading, refresh, addItem, updateItem, removeItem]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
