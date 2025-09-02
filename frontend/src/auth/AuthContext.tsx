import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AuthAPI,
  getAccessToken,
  setAccessToken,
  setRefreshToken,
  type User,
} from "./api";
import { isOnboarded } from "@/services/storage"; // adapte le chemin si besoin

export interface AuthState {
  user: User | null;
  loading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, full_name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

// Normalise la réponse potentielle de /auth/me
const extractUser = (maybe: any): User | null => {
  if (!maybe) return null;
  if (typeof maybe === "object" && "id" in maybe) return maybe as User;
  if (typeof maybe === "object" && "user" in maybe) return (maybe as any).user as User;
  return null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Au démarrage : si un token existe, on tente /auth/me
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    AuthAPI.me()
      .then((u) => setUser(extractUser(u)))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (emailOrUsername: string, password: string) => {
    // Login selon le schéma backend
    const data = await AuthAPI.login({ username_or_email: emailOrUsername, password });
    setAccessToken(data.access_token);
    if (data.refresh_token) setRefreshToken(data.refresh_token);

    // Récupération de l'utilisateur
    const me = await AuthAPI.me().catch(() => null);
    const meUser = extractUser(me);
    setUser(meUser);

    const uid = meUser?.id;
    const first = uid ? !isOnboarded(uid) : false;
    navigate(first ? "/onboarding" : "/", { replace: true });
  };

  const register = async (email: string, username: string, password: string, full_name?: string) => {
    const data = await AuthAPI.register({ email, username, password, full_name });
    setAccessToken(data.access_token);
    if (data.refresh_token) setRefreshToken(data.refresh_token);

    const me = await AuthAPI.me().catch(() => null);
    const meUser = extractUser(me);
    setUser(meUser);

    const uid = meUser?.id;
    const first = uid ? !isOnboarded(uid) : false;
    navigate(first ? "/onboarding" : "/", { replace: true });
  };

  const logout = async () => {
    try { await AuthAPI.logout(); } catch {}
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    navigate("/login", { replace: true });
  };

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
