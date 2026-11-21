import { createContext, useContext, useEffect, useState } from "react";
import api, { tokenStore } from "../lib/api";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener("kupa:logout", onLogout);

    if (tokenStore.get()?.access) {
      api
        .get("/auth/me/")
        .then((res) => setUser(res.data))
        .catch(() => tokenStore.clear())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    return () => window.removeEventListener("kupa:logout", onLogout);
  }, []);

  const saveSession = (data) => {
    tokenStore.set({ access: data.access, refresh: data.refresh });
    setUser(data.user);
    return data.user;
  };

  const login = async (email, password) =>
    saveSession((await api.post("/auth/login/", { email, password })).data);

  const verifyEmail = async (email, code) =>
    saveSession((await api.post("/auth/verify-email/", { email, code })).data);

  const googleLogin = async (credential) =>
    saveSession((await api.post("/auth/google/", { credential })).data);

  const logout = () => {
    tokenStore.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, verifyEmail, googleLogin, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}