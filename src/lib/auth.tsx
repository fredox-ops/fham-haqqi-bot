import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export type User = { id: string; firstName: string; email: string };

type AuthCtx = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, email: string, password: string) => Promise<{ needsConfirmation: boolean }>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

const toUser = (session: Session | null): User | null => {
  if (!session?.user) return null;
  const meta: any = session.user.user_metadata || {};
  return {
    id: session.user.id,
    email: session.user.email ?? "",
    firstName: meta.first_name || (session.user.email?.split("@")[0] ?? "Vous"),
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toUser(session));
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(toUser(session));
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message === "Invalid login credentials" ? "Email ou mot de passe incorrect." : error.message);
  };

  const register = async (firstName: string, email: string, password: string) => {
    const redirectTo = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: redirectTo, data: { first_name: firstName } },
    });
    if (error) {
      if (error.message.toLowerCase().includes("already")) throw new Error("Un compte existe déjà avec cet email.");
      throw new Error(error.message);
    }
    return { needsConfirmation: !data.session };
  };

  const logout = async () => { await supabase.auth.signOut(); };

  return <Ctx.Provider value={{ user, loading, login, register, logout }}>{children}</Ctx.Provider>;
};

export const useAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
};

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return <>{children}</>;
};

// === Conversations & messages (Supabase-backed) ===
export type StoredConversation = {
  id: string;
  date: string;
  domain: string;
  summary: string;
  status: "Résolu" | "En cours" | "Urgent";
  title?: string | null;
  tags?: string[];
  urgency?: "low" | "medium" | "high";
  language?: "fr" | "ar" | "darija";
  messages: { role: "user" | "assistant"; content: string }[];
};

export const fetchConversations = async (): Promise<StoredConversation[]> => {
  const { data: convs, error } = await supabase
    .from("conversations")
    .select("id, domain, summary, status, created_at, title, tags, urgency, language")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error || !convs) return [];
  const ids = convs.map((c) => c.id);
  const { data: msgs } = ids.length
    ? await supabase.from("messages").select("conversation_id, role, content, created_at").in("conversation_id", ids).order("created_at", { ascending: true })
    : { data: [] as any[] };
  const byConv = new Map<string, { role: "user"|"assistant"; content: string }[]>();
  (msgs || []).forEach((m: any) => {
    const arr = byConv.get(m.conversation_id) || [];
    arr.push({ role: m.role, content: m.content });
    byConv.set(m.conversation_id, arr);
  });
  return convs.map((c: any) => ({
    id: c.id,
    date: c.created_at,
    domain: c.domain,
    summary: c.summary,
    status: c.status as StoredConversation["status"],
    title: c.title,
    tags: c.tags ?? [],
    urgency: c.urgency,
    language: c.language,
    messages: byConv.get(c.id) || [],
  }));
};

export const upsertConversation = async (userId: string, conv: StoredConversation) => {
  await supabase.from("conversations").upsert({
    id: conv.id,
    user_id: userId,
    domain: conv.domain,
    summary: conv.summary,
    status: conv.status,
  });
  // Replace messages: delete then insert (simple & idempotent for short convs)
  await supabase.from("messages").delete().eq("conversation_id", conv.id);
  if (conv.messages.length) {
    await supabase.from("messages").insert(
      conv.messages.map((m) => ({
        conversation_id: conv.id,
        user_id: userId,
        role: m.role,
        content: m.content,
      }))
    );
  }
};

export const deleteConversation = async (id: string) => {
  await supabase.from("conversations").delete().eq("id", id);
};