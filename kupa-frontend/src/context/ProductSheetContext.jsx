import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import ProductSheet from "../components/ProductSheet";
import api from "../lib/api";

const SheetContext = createContext(null);
export const useProductSheet = () => useContext(SheetContext);

export function ProductSheetProvider({ children }) {
  const [food, setFood] = useState(null);
  const [favMap, setFavMap] = useState({});

  const open = useCallback((f) => setFood(f), []);
  const close = useCallback(() => setFood(null), []);

  const toggleFavorite = async (f) => {
    const current = favMap[f.id] ?? f.is_favorite;
    setFavMap((m) => ({ ...m, [f.id]: !current })); // optimistic
    try {
      const { data } = await api.post(`/menu/foods/${f.id}/favorite/`);
      setFavMap((m) => ({ ...m, [f.id]: data.is_favorite }));
    } catch {
      setFavMap((m) => ({ ...m, [f.id]: current }));
    }
  };

  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <SheetContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {food && (
          <ProductSheet
            key={food.id}
            food={food}
            isFavorite={favMap[food.id] ?? food.is_favorite}
            onFavorite={() => toggleFavorite(food)}
            onClose={close}
          />
        )}
      </AnimatePresence>
    </SheetContext.Provider>
  );
}
