import axios from "axios";

const TOKEN_KEY = "kupa_tokens";

export const tokenStore = {
  get() {
    try {
      return JSON.parse(localStorage.getItem(TOKEN_KEY));
    } catch {
      return null;
    }
  },
  set(tokens) {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
  },
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
});

api.interceptors.request.use((config) => {
  const tokens = tokenStore.get();
  if (tokens?.access) config.headers.Authorization = `Bearer ${tokens.access}`;
  return config;
});

let refreshing = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const tokens = tokenStore.get();

    if (error.response?.status === 401 && tokens?.refresh && original && !original._retry) {
      original._retry = true;
      try {
        if (!refreshing) {
          refreshing = axios
            .post(`${api.defaults.baseURL}/auth/token/refresh/`, { refresh: tokens.refresh })
            .finally(() => {
              refreshing = null;
            });
        }
        const { data } = await refreshing;
        tokenStore.set({ ...tokens, access: data.access, ...(data.refresh ? { refresh: data.refresh } : {}) });
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch {
        tokenStore.clear();
        window.dispatchEvent(new Event("kupa:logout"));
      }
    }
    return Promise.reject(error);
  }
);

export function getError(err, fallback = "Something went wrong. Try again.") {
  if (err?.message === "Network Error") return "Can't reach the server. Is the backend running?";
  const d = err?.response?.data;
  if (!d || typeof d === "string") return fallback;
  if (d.detail) return d.detail;
  const first = Object.values(d)[0];
  return Array.isArray(first) ? first[0] : String(first);
}

export default api;