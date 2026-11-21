import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

const EMPTY = { items: [], item_count: 0, subtotal: "0.00", delivery_fee: "0.00", total: "0.00" };

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(EMPTY);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get("/cart/");
      setCart(data);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (user) refresh();
    else setCart(EMPTY);
  }, [user, refresh]);

  const addItem = useCallback(async (food, quantity, optionIds) => {
    const { data } = await api.post("/cart/items/", { food, quantity, option_ids: optionIds });
    setCart(data);
  }, []);

  const updateQuantity = useCallback(async (itemId, quantity) => {
    const { data } = await api.patch(`/cart/items/${itemId}/`, { quantity });
    setCart(data);
  }, []);

  const removeItem = useCallback(async (itemId) => {
    const { data } = await api.delete(`/cart/items/${itemId}/`);
    setCart(data);
  }, []);

  const clearCart = useCallback(async () => {
    const { data } = await api.delete("/cart/");
    setCart(data);
  }, []);

  const value = useMemo(
    () => ({ cart, refresh, addItem, updateQuantity, removeItem, clearCart }),
    [cart, refresh, addItem, updateQuantity, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}