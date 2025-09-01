import axios, { AxiosHeaders } from "axios";

const BASE = (import.meta.env.VITE_API_URL ?? "https://suprss.onrender.com").replace(/\/$/, "");
const PREFIX = (import.meta.env.VITE_API_PREFIX ?? "/api").replace(/\/$/, "");
export const API = axios.create({ baseURL: `${BASE}${PREFIX}` });

// Clés uniques, utilisées PARTOUT
const K = { access: "suprss.access", refresh: "suprss.refresh" };

export const getAccessToken = () => localStorage.getItem(K.access);
export const setAccessToken = (v: string | null) =>
  v ? localStorage.setItem(K.access, v) : localStorage.removeItem(K.access);

export const getRefreshToken = () => localStorage.getItem(K.refresh);
export const setRefreshToken = (v: string | null) =>
  v ? localStorage.setItem(K.refresh, v) : localStorage.removeItem(K.refresh);

// Ajout du Bearer proprement (typage Axios)
API.interceptors.request.use((cfg) => {
  const token = getAccessToken();
  if (token) {
    const headers = new AxiosHeaders(cfg.headers);
    headers.set("Authorization", `Bearer ${token}`);
    cfg.headers = headers;
  }
  return cfg;
});

export type User = {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
};

// Corps & réponse attendus par ton backend
export type LoginBody = { username_or_email: string; password: string };
export type LoginResp = {
  token_type: "bearer";
  access_token: string;
  refresh_token?: string;
  access_expires_in?: number;
  refresh_expires_at?: string;
};

export const AuthAPI = {
  me: async () => (await API.get<{ user?: User } | User>("/auth/me")).data,
  login: async (body: LoginBody) => (await API.post<LoginResp>("/auth/login", body)).data,
  register: async (p: { email: string; username: string; password: string; full_name?: string }) =>
    (await API.post<LoginResp>("/users", p)).data,
  logout: async () => {
    try { await API.post("/auth/logout", {}); } catch {}
  },
};
