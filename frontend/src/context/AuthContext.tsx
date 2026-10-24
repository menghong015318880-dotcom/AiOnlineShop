"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authService from "@/services/auth";
import type { LoginInput, RegisterInput, User } from "@/types";

interface AuthContextValue {
  user: User | null;
  ready: boolean; // false until the saved login is cheacked in the browser
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Keeps the logged-in user for the whole site.
export function AuthProvider({children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  // Check once, in the browser, if somebody is already logged in
  useEffect(() => {
    setUser(authService.getCurrentUser());
    setReady(true);
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    setUser(await authService.login(input));
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    setUser(await authService.register(input));
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, ready, login, register, logout }),
    [user, ready, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Use in any client component: const { user, logout } = usseAuth();
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}