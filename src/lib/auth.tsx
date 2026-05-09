import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

export type User = { firstName: string; email: string };

type AuthCtx = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);
const USERS_KEY = "darjalex.users";
const SESSION_KEY = "darjalex.session";

type StoredUser = { firstName: string; email: string; password: string };
const readUsers = (): StoredUser[] => {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); } catch { return []; }
};
const writeUsers = (u: StoredUser[]) => localStorage.setItem(USERS_KEY, JSON.stringify(u));

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const s = localStorage.getItem(SESSION_KEY);
      return s ? (JSON.parse(s) as User) : null;
    } catch {
      return null;
    }
  });

  const login = async (email: string, password: string) => {
    const users = readUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) throw new Error("Email ou mot de passe incorrect.");
    const sess = { firstName: found.firstName, email: found.email };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sess));
    setUser(sess);
  };

  const register = async (firstName: string, email: string, password: string) => {
    const users = readUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("Un compte existe déjà avec cet email.");
    }
    const u: StoredUser = { firstName, email, password };
    writeUsers([...users, u]);
    const sess = { firstName, email };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sess));
    setUser(sess);
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return <Ctx.Provider value={{ user, login, register, logout }}>{children}</Ctx.Provider>;
};

export const useAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
};

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const loc = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return <>{children}</>;
};

// === Per-user conversation storage ===
export type StoredConversation = {
  id: string;
  date: string;        // ISO
  domain: string;
  summary: string;
  status: "Résolu" | "En cours" | "Urgent";
  messages: { role: "user" | "assistant"; content: string }[];
};

const convKey = (email: string) => `darjalex.conversations.${email.toLowerCase()}`;

export const loadConversations = (email: string): StoredConversation[] => {
  try { return JSON.parse(localStorage.getItem(convKey(email)) || "[]"); } catch { return []; }
};
export const saveConversations = (email: string, list: StoredConversation[]) => {
  localStorage.setItem(convKey(email), JSON.stringify(list));
};
export const upsertConversation = (email: string, conv: StoredConversation) => {
  const list = loadConversations(email);
  const idx = list.findIndex((c) => c.id === conv.id);
  if (idx >= 0) list[idx] = conv;
  else list.unshift(conv);
  saveConversations(email, list.slice(0, 50));
};