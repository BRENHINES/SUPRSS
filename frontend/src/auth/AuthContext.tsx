import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthAPI, setAccessToken, setRefreshToken, type User } from "./api";

export interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation() as any;

  useEffect(() => {
    const at = localStorage.getItem("suprss.access");
    const rt = localStorage.getItem("suprss.refresh");
    if (at) setAccessToken(at);
    if (rt) setRefreshToken(rt);
    AuthAPI.me()
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading && !user && location.pathname !== "/login") {
      navigate("/login", { replace: true, state: { from: location } });
    }
  }, [user, loading]);

  const login = async (email: string, password: string) => {
    const data = await AuthAPI.login({ email, password });
    setAccessToken(data.access_token);
    localStorage.setItem("suprss.access", data.access_token);
    if (data.refresh_token) {
      setRefreshToken(data.refresh_token);
      localStorage.setItem("suprss.refresh", data.refresh_token);
    }
    setUser(data.user);
  };

  const register = async (email: string, username: string, password: string) => {
    const data = await AuthAPI.register({ email, username, password });
    setAccessToken(data.access_token);
    localStorage.setItem("suprss.access", data.access_token);
    if (data.refresh_token) {
      setRefreshToken(data.refresh_token);
      localStorage.setItem("suprss.refresh", data.refresh_token);
    }
    setUser(data.user);
  };

  const logout = async () => {
    try { await AuthAPI.logout(); } catch {}
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem("suprss.access");
    localStorage.removeItem("suprss.refresh");
    setUser(null);
    navigate("/login");
  };

  return <Ctx.Provider value={{ user, loading, login, register, logout }}>{children}</Ctx.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
