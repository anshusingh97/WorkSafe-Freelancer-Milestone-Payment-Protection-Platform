import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "../services/api";
import { identifyUser, track } from "../services/analytics";
import type { User, UserRole } from "../types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("worksafe_token");
    const cached = localStorage.getItem("worksafe_user");
    if (token && cached) {
      setUser(JSON.parse(cached));
    }
    setLoading(false);
  }, []);

  function persist(token: string, user: User) {
    localStorage.setItem("worksafe_token", token);
    localStorage.setItem("worksafe_user", JSON.stringify(user));
    setUser(user);
    identifyUser(user.id, { role: user.role, email: user.email });
  }

  async function login(email: string, password: string) {
    const { data } = await api.post("/auth/login", { email, password });
    persist(data.token, data.user);
  }

  async function register(name: string, email: string, password: string, role: UserRole) {
    const { data } = await api.post("/auth/register", { name, email, password, role });
    persist(data.token, data.user);
    track("user_registered", { role });
  }

  function logout() {
    localStorage.removeItem("worksafe_token");
    localStorage.removeItem("worksafe_user");
    setUser(null);
  }

  async function refreshUser() {
    const { data } = await api.get("/auth/me");
    localStorage.setItem("worksafe_user", JSON.stringify(data.user));
    setUser(data.user);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
