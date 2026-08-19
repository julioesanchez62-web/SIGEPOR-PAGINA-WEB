import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_URL;
const apiBaseUrl =
  configuredApiUrl && configuredApiUrl !== "null"
    ? configuredApiUrl
    : "http://localhost:3000/api";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Agrega automáticamente el JWT a las peticiones protegidas.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("siceToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
