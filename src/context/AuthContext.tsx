import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UserSession = {
  id_cliente: number;
  nome_cliente: string;
  hasUploaded?: boolean;
};

type AuthContextType = {
  user: UserSession | null;
  loading: boolean;
  login: (nome: string, senha: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  setHasUploaded: (value: boolean) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "app.session.v1";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed: UserSession = JSON.parse(raw);
        setUser(parsed);
      } catch {}
    }
    setLoading(false);
  }, []);

  const persist = (u: UserSession | null) => {
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const login = async (nome: string, senha: string) => {
    try {
      if (!nome || !senha) return { ok: false, error: "Informe usuário e senha" };

      const { data, error } = await supabase.functions.invoke("login", {
        body: { nome_cliente: nome, senha_cliente: senha },
      });

      if (error) return { ok: false, error: error.message || "Falha ao autenticar." };
      if (!data) return { ok: false, error: "Credenciais inválidas" };

      const session: UserSession = {
        id_cliente: data.id_cliente,
        nome_cliente: data.nome_cliente,
        hasUploaded: !!data.has_uploaded,
      };
      setUser(session);
      persist(session);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message || "Falha ao autenticar." };
    }
  };

  const logout = () => {
    setUser(null);
    persist(null);
  };

  const setHasUploaded = (value: boolean) => {
    if (!user) return;
    const updated = { ...user, hasUploaded: value };
    setUser(updated);
    persist(updated);
  };

  const value = useMemo(
    () => ({ user, loading, login, logout, setHasUploaded }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
