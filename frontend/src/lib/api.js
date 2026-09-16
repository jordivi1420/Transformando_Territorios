import axios from "axios";

const BACKEND_URL = (typeof import.meta !== "undefined" && import.meta.env?.VITE_BACKEND_URL) || "";
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("impacto_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const CATEGORIES = ["Agua", "Educación", "Agricultura", "Energía", "Salud", "Otro"];
