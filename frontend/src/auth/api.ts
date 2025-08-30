import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_PREFIX = (import.meta.env.VITE_API_PREFIX || "/api").replace(/\/$/, "");

export const API = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // cookie httpOnly ready
});

export type User = { id: number; email: string; username: string };
export type AuthPayload = { access_token: string; refresh_token?: string; user: User };

let accessToken: string | null = null;
let refreshToken: string | null = null;
export const setAccessToken = (t: string | null) => (accessToken = t);
export const setRefreshToken = (t: string | null) => (refreshToken = t);

API.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export const AuthAPI = {
  me: () => API.get<{ user: User }>(`${API_PREFIX}/auth/me`).then((r) => r.data.user),
  login: (p: { email: string; password: string }) =>
    API.post<AuthPayload>(`${API_PREFIX}/auth/login`, p).then((r) => r.data),
  register: (p: { email: string; username: string; password: string }) =>
    API.post<AuthPayload>(`${API_PREFIX}/auth/register`, p).then((r) => r.data),
  logout: () => API.post(`${API_PREFIX}/auth/logout`, {}),
  forgot: (p: { email: string }) => API.post(`${API_PREFIX}/auth/forgot-password`, p),
  reset: (p: { token: string; password: string }) => API.post(`${API_PREFIX}/auth/reset-password`, p),
  verify: (p: { token: string }) => API.post(`${API_PREFIX}/auth/verify-email`, p),
  oauthCallback: (provider: string, p: { code: string; state?: string }) =>
    API.post<AuthPayload>(`${API_PREFIX}/auth/oauth/${provider}/callback`, p).then((r) => r.data),
};
