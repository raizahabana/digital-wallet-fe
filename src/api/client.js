import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { Accept: "application/json", "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && !error.config.url.includes("/auth/token")) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Normalise RFC 7807 problems and Laravel validation errors into one shape
export function parseError(error) {
  const data = error.response?.data;
  if (!data) return { title: "Network error", detail: "Cannot reach the server.", fields: {} };
  return {
    title: data.title || data.message || "Error",
    detail: data.detail || data.message || "Something went wrong.",
    fields: data.errors || {}, // Laravel 422 field errors
  };
}

export default api;