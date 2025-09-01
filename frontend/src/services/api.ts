// src/services/api.ts
import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";

const BASE = (import.meta.env.VITE_API_URL ?? "https://suprss.onrender.com").replace(/\/$/, "");
const PREFIX = (import.meta.env.VITE_API_PREFIX ?? "/api").replace(/\/$/, "");

export const api = axios.create({
  baseURL: `${BASE}${PREFIX}`,
});

api.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("suprss.access");
  if (token) {
    if (cfg.headers && typeof (cfg.headers as any).set === "function") {
      (cfg.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
    } else {
      cfg.headers = {
        ...(cfg.headers || {}),
        Authorization: `Bearer ${token}`,
      } as any;
    }
  }
  return cfg;
});
