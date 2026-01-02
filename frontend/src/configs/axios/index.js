import axios from "axios";

const baseURL = import.meta.env.PROD
  ? import.meta.env.VITE_API_AZURE
  : import.meta.env.VITE_LOCAL_HOST;

const index = axios.create({
  baseURL,
  headers: {
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  },
});

let onUnauthorized = null;
let onNotAcceptable = null;
let onGone = null;

export const setUnauthorizedHandler = (callback) => {
  onUnauthorized = callback;
};

export const setNotAcceptableHandler = (callback) => {
  onNotAcceptable = callback;
};

export const setGoneHandler = (callback) => {
  onGone = callback;
};

index.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Agrega un parámetro "t" a la URL para evitar cache del navegador
    if (!config.params) {
      config.params = {};
    }
    config.params.t = Date.now();

    return config;
  },
  (error) => Promise.reject(error)
);

index.interceptors.response.use(
  (response) => response,
  (error) => {
    const token = localStorage.getItem("token");
    if (token) {
      if (error.response?.status === 401) {
        localStorage.setItem("expiredAt", Date.now().toString());
        if (typeof onUnauthorized === "function") {
          onUnauthorized();
        }
      }

      if (error.response?.status === 406) {
        if (typeof onNotAcceptable === "function") {
          onNotAcceptable();
        }
      }

      if (error.response?.status === 410) {
        if (typeof onGone === "function") {
          onGone();
        }
      }
    }

    return Promise.reject(error);
  }
);

export default index;