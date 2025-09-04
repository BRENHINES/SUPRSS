// src/auth/api.ts
import axios from "axios";

/** Base URL API (VITE_API_BASE prioritaire, sinon VITE_API_URL, sinon même origine) */
const API_BASE =
  (import.meta as any).env?.VITE_API_BASE ||
  (import.meta as any).env?.VITE_API_URL ||
  window.location.origin;

const API = String(API_BASE).replace(/\/$/, "");

// ---- Types existants / exemple
export type User = {
  id: string;
  email: string;
  username: string;
  full_name?: string | null;
  avatar_url?: string | null;
};

export type LoginBody = { username_or_email: string; password: string };
export type LoginResp = {
  token_type: "bearer";
  access_token: string;
  access_expires_in: number;
  refresh_token?: string;
  refresh_expires_at?: string;
  user?: User; // si ton backend renvoie le user directement
};

// ---- NOUVEAUX TYPES
type ForgotBody = { email: string };
type ResetBody = { token: string; password: string };
type VerifyBody = { token: string };

// ---- Helpers de token (garde tes implémentations si tu les as déjà)
const AT_KEY = "suprss_at";
const RT_KEY = "suprss_rt";

export const getAccessToken = () => localStorage.getItem(AT_KEY);
export const setAccessToken = (v: string | null) =>
  v ? localStorage.setItem(AT_KEY, v) : localStorage.removeItem(AT_KEY);

export const getRefreshToken = () => localStorage.getItem(RT_KEY);
export const setRefreshToken = (v: string | null) =>
  v ? localStorage.setItem(RT_KEY, v) : localStorage.removeItem(RT_KEY);

// ---- Instance axios avec auth si besoin
const client = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  const tok = getAccessToken();
  if (tok) config.headers.Authorization = `Bearer ${tok}`;
  return config;
});

// ---- ENDPOINTS (adapte si ton backend utilise d’autres chemins)
const PATHS = {
  me: "/api/auth/me",
  login: "/api/auth/login",
  register: "/api/users",
  logout: "/api/auth/logout",
  forgot: "/api/auth/forgot-password",
  reset: "/api/auth/reset-password",
  verify: "/api/auth/verify-email",
};

// ---- API
export const AuthAPI = {
  async me(): Promise<User | { user?: User }> {
    const { data } = await client.get(PATHS.me);
    return data;
  },

  async login(body: LoginBody): Promise<LoginResp> {
    const { data } = await client.post(PATHS.login, body);
    return data;
  },

  async register(p: { email: string; username: string; password: string; full_name?: string }) {
    const { data } = await client.post(PATHS.register, p);
    return data as LoginResp;
  },

  async logout() {
    try {
      await client.post(PATHS.logout, {});
    } catch {
      // silencieux
    }
    return { ok: true };
  },

  // ---- NOUVEAU : forgot
  async forgot({ email }: ForgotBody) {
    await client.post(PATHS.forgot, { email });
    return { ok: true };
  },

  // ---- NOUVEAU : reset
  async reset({ token, password }: ResetBody) {
    await client.post(PATHS.reset, { token, password });
    return { ok: true };
  },

  // ---- NOUVEAU : verify
  async verify({ token }: VerifyBody) {
    try {
      await client.post(PATHS.verify, { token });
      return { ok: true };
    } catch (e: any) {
      // Fallback si ton backend expose GET /verify-email?token=...
      if (e?.response?.status === 404) {
        await client.get(`${PATHS.verify}?token=${encodeURIComponent(token)}`);
        return { ok: true };
      }
      throw e;
    }
  },
};
