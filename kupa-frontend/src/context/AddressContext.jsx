import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { useAuth } from "./AuthContext";

const AddressContext = createContext(null);
export const useAddresses = () => useContext(AddressContext);

export function AddressProvider({ children }) {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState(undefined); // undefined = still loading

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get("/addresses/");
      setAddresses(data);
    } catch {
      setAddresses([]);
    }
  }, []);

  useEffect(() => {
    if (user) refresh();
    else setAddresses(undefined);
  }, [user, refresh]);

  const addAddress = useCallback(
    async (payload) => {
      const { data } = await api.post("/addresses/", payload);
      await refresh();
      return data;
    },
    [refresh]
  );

  const makeDefault = useCallback(
    async (id) => {
      await api.patch(`/addresses/${id}/`, { is_default: true });
      await refresh();
    },
    [refresh]
  );

  const removeAddress = useCallback(
    async (id) => {
      await api.delete(`/addresses/${id}/`);
      await refresh();
    },
    [refresh]
  );

  const defaultAddress =
    addresses === undefined ? undefined : addresses.find((a) => a.is_default) || addresses[0] || null;

  const value = useMemo(
    () => ({ addresses, defaultAddress, refresh, addAddress, makeDefault, removeAddress }),
    [addresses, defaultAddress, refresh, addAddress, makeDefault, removeAddress]
  );

  return <AddressContext.Provider value={value}>{children}</AddressContext.Provider>;
}