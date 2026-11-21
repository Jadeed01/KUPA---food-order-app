import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api, { getError } from "../lib/api";
import { useAuth } from "./AuthContext";

const MenuContext = createContext(null);
export const useMenu = () => useContext(MenuContext);

export function MenuProvider({ children }) {
  const { user } = useAuth();
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [f, c] = await Promise.all([api.get("/menu/foods/"), api.get("/menu/categories/")]);
      setFoods(f.data);
      setCategories(c.data);
    } catch (err) {
      setError(getError(err, "Couldn't load the menu."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      load();
    } else {
      setFoods([]);
      setCategories([]);
    }
  }, [user, load]);

  const value = useMemo(
    () => ({ foods, categories, loading, error, reload: load }),
    [foods, categories, loading, error, load]
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}