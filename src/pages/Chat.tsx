import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Mic, MicOff, Phone, Send, Loader2, Plus, Briefcase, Home as HomeIcon, FileSignature,
  Users, FileText, AlertTriangle, Menu, X, Trash2, ThumbsUp, ThumbsDown, Copy, Sparkles,
  Building2, ShoppingBag, LogOut, Radar, Volume2, Square,
} from "lucide-react";

// Detect if a string is predominantly Arabic script
const isArabic = (s: string) => {
  const arabic = (s.match(/[\u0600-\u06FF]/g) || []).length;
  const letters = (s.match(/[A-Za-z\u0600-\u06FF]/g) || []).length || 1;
  return arabic / letters > 0.3;
};
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import BackgroundFX from "@/components/BackgroundFX";
import LetterGenerator from "@/components/LetterGenerator";
import MobileNav from "@/components/MobileNav";
import VoiceCall from "@/components/VoiceCall";
import LegalRadar from "@/components/LegalRadar";
import { useAuth, fetchConversations, upsertConversation, type StoredConversation } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import LangToggle from "@/components/LangToggle";
import { useT } from "@/lib/i18n";

type Msg = { role: "user" | "assistant"; content: string };
type Category = "Travail" | "Logement" | "Famille" | "Contrats" | "Administratif" | "Consommateur";
type Urgency = "normal" | "warning" | "urgent";

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  Travail: ["travail","employeur","salaire","licenci","préavis","cnss","smig","contrat de travail","patron","indemnit","heures suppl","khdma","mol khdma","ajr"],
  Logement: ["loyer","logement","propriétaire","bail","caution","expuls","appartement","maison","kira","mol dar","sakan"],
  Famille: ["divorce","mariage","pension","garde","enfant","héritage","famille","moudawana","talaq","zwaj","nafaqa"],
  Contrats: ["contrat","résiliation","clause","engagement","signature","obligation","résilier","ittifa9"],
  Administratif: ["commune","municipalit","administration","préfecture","passeport","carte d'identité","cnie","wilaya"],
  Consommateur: ["produit","achat","garantie","remboursement","fournisseur","commerçant","facture","défectueux"],
};
const URGENT_KW = ["urgent","urgence","immédiat","tout de suite","expulsion","arrestation","garde à vue","menacé","violence","agression","battu","msta3jel"];
const WARN_KW = ["délai","prochainement","bientôt","tribunal","mise en demeure","convocation","amende"];

const detectCategory = (text: string): Category | null => {
  const t = text.toLowerCase();
  let best: { c: Category; s: number } | null = null;
  (Object.keys(CATEGORY_KEYWORDS) as Category[]).forEach((c) => {
    const s = CATEGORY_KEYWORDS[c].reduce((a, k) => (t.includes(k) ? a + 1 : a), 0);
    if (s > 0 && (!best || s > best.s)) best = { c, s };
  });
  return best?.c ?? null;
};
const detectUrgency = (text: string): Urgency => {
  const t = text.toLowerCase();
  if (URGENT_KW.some((k) => t.includes(k))) return "urgent";
  if (WARN_KW.some((k) => t.includes(k))) return "warning";
  return "normal";
};

const CATEGORY_ICONS: Record<Category, typeof Briefcase> = {
  Travail: Briefcase, Logement: HomeIcon, Famille: Users,
  Contrats: FileSignature, Administratif: Building2, Consommateur: ShoppingBag,
};

const FALLBACK_SUGGESTIONS = [
  "Mon loyer n'est pas remboursé",
  "Licenciement abusif, que faire ?",
  "Contrat non respecté par mon client",
];

const TypingDots = () => (
  <div className="flex items-center gap-1.5 py-1">
    {[0,1,2].map((i) => (
      <span key={i} className="h-2 w-2 rounded-full bg-gold"
        style={{ animation: "bounce-dot 1.2s ease-in-out infinite", animationDelay: `${i*0.15}s` }} />
    ))}
  </div>
);

const Avatar = () => (
  <div className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center bg-gradient-mixed text-[10px] font-bold text-white">
    MZ
  </div>
);

const Chat = () => {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const t = useT();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [detectedCategory, setDetectedCategory] = useState<Category | null>(null);
  const [urgency, setUrgency] = useState<Urgency>("normal");
  const [letterOpen, setLetterOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lang, setLang] = useState<"fr" | "ar">("fr");
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [dictating, setDictating] = useState(false);
  const [radarOpen, setRadarOpen] = useState(true);
  const [history, setHistory] = useState<StoredConversation[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const micBtnRef = useRef<HTMLButtonElement>(null);
  const callBtnRef = useRef<HTMLButtonElement>(null);
  const recogRef = useRef<any>(null);
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recStreamRef = useRef<MediaStream | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(FALLBACK_SUGGESTIONS);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const convIdRef = useRef<string>(crypto.randomUUID());

  const loadSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const { data, error } = await supabase.functions.invoke("suggest-prompts", {
        body: { lang },
      });
      if (error) throw error;
      const s = (data as any)?.suggestions;
      if (Array.isArray(s) && s.length) setSuggestions(s.slice(0, 3));
    } catch (e) {
      // keep current/fallback suggestions silently
    } finally {
      setLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    if (messages.length === 0) loadSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (user) fetchConversations().then(setHistory);
  }, [user]);

  // Persist current conversation after each AI response
  useEffect(() => {
    if (!user) return;
    if (messages.length < 2) return;
    const last = messages[messages.length - 1];
    if (last.role !== "assistant" || loading) return;
    const firstUser = messages.find((m) => m.role === "user");
    if (!firstUser) return;
    const conv: StoredConversation = {
      id: convIdRef.current,
      date: new Date().toISOString(),
      domain: detectedCategory ?? "Autre",
      summary: firstUser.content.slice(0, 120),
      status: urgency === "urgent" ? "Urgent" : "En cours",
      messages,
    };
    upsertConversation(user.id, conv).then(async () => {
      // Auto-classify (domain, title, summary, tags, urgency, language) via edge function
      try {
        await supabase.functions.invoke("classify-conversation", {
          body: { conversation_id: conv.id },
        });
      } catch (e) {
        console.warn("classify failed", e);
      }
      fetchConversations().then(setHistory);
    });
  }, [messages, loading, user, detectedCategory, urgency]);

  // === Topic radar counts (per-category keyword hits across user messages) ===
  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const userText = messages.filter((m) => m.role === "user").map((m) => m.content.toLowerCase()).join(" ");
    (Object.keys(CATEGORY_KEYWORDS) as Category[]).forEach((c) => {
      counts[c] = CATEGORY_KEYWORDS[c].reduce((acc, k) => (userText.includes(k) ? acc + 1 : acc), 0);
    });
    return counts;
  }, [messages]);

  const detectedTopics = useMemo(
    () => Object.entries(topicCounts).filter(([, v]) => v > 0).length,
    [topicCounts]
  );

  // === Audio recording → server-side transcription (Gemini multimodal) ===
  const stopRecorderTracks = () => {
    recStreamRef.current?.getTracks().forEach((t) => t.stop());
    recStreamRef.current = null;
  };

  const stopSpeechRecognition = () => {
    try { recogRef.current?.abort?.(); recogRef.current?.stop?.(); } catch {}
    recogRef.current = null;
  };

  const appendTranscribedText = (text: string) => {
    const cleaned = text.trim();
    if (!cleaned) return;
    setInput((prev) => (prev ? `${prev} ${cleaned}` : cleaned));
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const startBrowserDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error(lang === "ar" ? "التسجيل الصوتي غير مدعوم في هذا المتصفح." : "L'audio n'est pas supporté par ce navigateur.");
      return;
    }
    stopSpeechRecognition();
    const recognition = new SpeechRecognition();
    recognition.lang = lang === "ar" ? "ar-MA" : "fr-FR";
    recognition.continuous = false;
    recognition.interimResults = false;
    recogRef.current = recognition;
    recognition.onresult = (event: any) => {
      const text = Array.from(event.results)
        .map((result: any) => result?.[0]?.transcript ?? "")
        .join(" ");
      appendTranscribedText(text);
    };
    recognition.onerror = () => {
      toast.error(lang === "ar" ? "فشل التسجيل الصوتي." : "Échec de l'enregistrement vocal.");
    };
    recognition.onend = () => {
      setDictating(false);
      recogRef.current = null;
    };
    setDictating(true);
    recognition.start();
  };

  const toggleDictation = async () => {
    if (dictating) {
      try { mediaRecRef.current?.stop(); } catch {}
      stopSpeechRecognition();
      stopRecorderTracks();
      setDictating(false);
      return;
    }
    if (transcribing) {
      toast.message(lang === "ar" ? "جاري تحويل الصوت…" : "Transcription en cours…");
      return;
    }
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        startBrowserDictation();
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recStreamRef.current = stream;
      const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"]
        .find((type) => MediaRecorder.isTypeSupported(type));
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      audioChunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        setDictating(false);
        stopRecorderTracks();
        const finalMime = rec.mimeType || mime || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: finalMime });
        if (blob.size < 800) {
          toast.error(lang === "ar" ? "تسجيل قصير جداً." : "Enregistrement trop court.");
          return;
        }
        setTranscribing(true);
        try {
          const buf = await blob.arrayBuffer();
          // base64 encode without blowing the stack
          let binary = "";
          const bytes = new Uint8Array(buf);
          const CHUNK = 0x8000;
          for (let i = 0; i < bytes.length; i += CHUNK) {
            binary += String.fromCharCode.apply(
              null,
              Array.from(bytes.subarray(i, i + CHUNK)),
            );
          }
          const base64 = btoa(binary);
          const invokePromise = supabase.functions.invoke("transcribe-audio", {
            body: { audio: base64, mimeType: finalMime, language: lang },
          });
          const timeoutPromise = new Promise<never>((_, reject) => {
            window.setTimeout(() => reject(new Error("transcription-timeout")), 45000);
          });
          const { data, error } = await Promise.race([invokePromise, timeoutPromise]);
          if (error) throw error;
          const text = (data as any)?.text?.trim?.() ?? "";
          if (!text) {
            toast.error(lang === "ar" ? "تعذر التعرف على الصوت." : "Audio non reconnu.");
          } else {
            appendTranscribedText(text);
          }
        } catch (err) {
          console.error(err);
          toast.error(lang === "ar" ? "فشل التحويل الصوتي." : "Échec de la transcription.");
        } finally {
          setTranscribing(false);
        }
      };
      rec.onerror = () => {
        setDictating(false);
        stopRecorderTracks();
      };
      mediaRecRef.current = rec;
      rec.start();
      setDictating(true);
    } catch (err: any) {
      stopRecorderTracks();
      if (err?.name === "NotAllowedError") {
        toast.error("Microphone refusé. Autorisez-le dans les paramètres du navigateur.");
      } else if (err?.name === "NotFoundError") {
        toast.error("Aucun microphone détecté.");
      } else {
        toast.error("Impossible d'accéder au microphone.");
      }
    }
  };

  useEffect(() => () => {
    try { mediaRecRef.current?.stop(); } catch {}
    stopRecorderTracks();
    stopSpeechRecognition();
  }, []);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const trimmed = text.trim();
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);

    const fullText = next.map((m) => m.content).join(" ");
    const cat = detectCategory(fullText);
    if (cat) setDetectedCategory(cat);
    const u = detectUrgency(trimmed);
    if (u !== "normal") setUrgency(u);

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: next.slice(-10) }),
      });
      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast.error("Trop de requêtes, réessayez bientôt.");
        else if (resp.status === 402) toast.error("Crédits IA épuisés.");
        else toast.error("Erreur du service IA.");
        setLoading(false);
        return;
      }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistant = "";
      let done = false;
      const upsert = (chunk: string) => {
        assistant += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistant } : m));
          }
          return [...prev, { role: "assistant", content: assistant }];
        });
      };
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) upsert(c);
          } catch { buffer = line + "\n" + buffer; break; }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Connexion impossible.");
    } finally {
      setLoading(false);
    }
  };

  const newChat = () => {
    setMessages([]);
    setActiveConv(null);
    setDetectedCategory(null);
    setUrgency("normal");
    convIdRef.current = crypto.randomUUID();
    inputRef.current?.focus();
  };

  const grouped = useMemo(() => {
    const groups = { today: [] as StoredConversation[], week: [] as StoredConversation[], older: [] as StoredConversation[] };
    const now = Date.now();
    history.forEach((c) => {
      const d = new Date(c.date).getTime();
      const diff = (now - d) / (1000 * 60 * 60 * 24);
      if (diff < 1) groups.today.push(c);
      else if (diff < 7) groups.week.push(c);
      else groups.older.push(c);
    });
    return groups;
  }, [history]);

  const openConversation = (c: StoredConversation) => {
    setActiveConv(c.id);
    setMessages(c.messages);
    setDetectedCategory((c.domain as Category) ?? null);
    convIdRef.current = c.id;
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    toast.success(t("Déconnecté."));
    nav("/login", { replace: true });
  };

  return (
    <div className="h-screen w-full flex text-foreground overflow-hidden relative">
      <BackgroundFX />

      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`flex flex-col w-[84%] max-w-[320px] md:w-[280px] border-r border-border/40 bg-sidebar/90 md:bg-sidebar/60 backdrop-blur-2xl
          fixed md:relative inset-y-0 left-0 z-50 md:z-auto transition-transform duration-500
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="p-5 border-b border-border/50 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-display text-xl">
              <span className="text-gradient-gold italic">Mizani</span>
            </span>
          </Link>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 pb-3 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 rounded-full bg-emerald animate-ping opacity-75" />
            <span className="relative rounded-full h-1.5 w-1.5 bg-emerald" />
          </span>
          {t("En ligne")}
        </div>

        <div className="px-4 pb-3">
          <button
            onClick={newChat}
            className="haptic-tap w-full bg-gradient-gold text-primary-foreground rounded-full h-11 font-semibold shadow-gold hover:scale-[1.02] inline-flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="h-4 w-4" />
            {t("Nouvelle consultation")}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-5">
          {history.length === 0 && (
            <div className="px-3 py-6 text-center text-xs text-muted-foreground">
              {t("Aucune consultation pour le moment.")}
            </div>
          )}
          {(["today","week","older"] as const).map((bucket) => {
            const items = grouped[bucket];
            if (!items.length) return null;
            const labels = { today: t("Aujourd'hui"), week: t("Cette semaine"), older: t("Plus ancien") };
            return (
              <div key={bucket}>
                <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-muted-foreground">{labels[bucket]}</div>
                <div className="space-y-1">
                  {items.map((c) => {
                    const Icon = CATEGORY_ICONS[(c.domain as Category)] ?? FileText;
                    return (
                      <button
                        key={c.id}
                        onClick={() => openConversation(c)}
                        className={`w-full text-left text-sm px-3 py-2.5 rounded-2xl transition-all flex items-start gap-2.5 ${
                          activeConv === c.id
                            ? "bg-gold/10 text-foreground border border-gold/30"
                            : "text-muted-foreground hover:bg-muted/40 hover:text-foreground border border-transparent"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 mt-0.5 shrink-0 text-gold" />
                        <span className="truncate">{c.summary}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-border/50 space-y-3">
          {user && (
            <div className="flex items-center gap-3 px-1">
              <div className="h-9 w-9 rounded-full bg-gradient-gold text-primary-foreground text-sm font-bold flex items-center justify-center shrink-0">
                {user.firstName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">{t("Bonjour, ")}<span className="text-gold font-medium">{user.firstName}</span></div>
                <div className="text-[10px] text-muted-foreground truncate">{user.email}</div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="haptic-tap w-full inline-flex items-center justify-center gap-2 h-10 rounded-full border border-border hover:border-destructive/50 hover:text-destructive text-xs text-muted-foreground transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" /> {t("Déconnexion")}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border/40 px-3 md:px-5 flex items-center gap-2 md:gap-3 bg-card/30 backdrop-blur-md">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden haptic-tap flex items-center justify-center h-9 w-9 rounded-full glass"
            aria-label="Ouvrir la navigation"
          >
            <Menu className="h-4 w-4" />
          </button>
          {detectedCategory && (
            <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full glass border border-gold/30 text-gold animate-fade-in">
              {(() => { const I = CATEGORY_ICONS[detectedCategory]; return <I className="h-3.5 w-3.5" />; })()}
              <span className="font-medium">{t(detectedCategory)}</span>
            </div>
          )}
          <div className="flex-1" />
          {messages.length > 0 && (
            <button
              onClick={() => setRadarOpen((v) => !v)}
              className={`haptic-tap text-xs inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border transition-colors ${
                radarOpen ? "border-gold/40 text-gold" : "border-border text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Afficher le radar des sujets"
            >
              <Radar className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Radar</span>
              {detectedTopics > 0 && (
                <span className="text-[10px] bg-gold/20 text-gold rounded-full px-1.5">{detectedTopics}</span>
              )}
            </button>
          )}
          {messages.length > 0 && (
            <button
              onClick={newChat}
              className="haptic-tap text-xs text-muted-foreground hover:text-destructive transition-colors inline-flex items-center gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" /> {t("Effacer")}
            </button>
          )}
          <LangToggle />
          <ThemeToggle />
        </header>

        {/* Topic radar panel — floating right side */}
        {radarOpen && messages.length > 0 && (
          <>
            {/* Mobile backdrop */}
            <div
              className="lg:hidden fixed inset-0 z-30 bg-background/60 backdrop-blur-sm animate-fade-in"
              onClick={() => setRadarOpen(false)}
            />
            <aside
              className="fixed z-40 top-20 right-3 md:right-6 w-[92vw] max-w-sm lg:w-80 animate-slide-right"
              style={{ animation: "slide-right 0.5s cubic-bezier(0.22,1,0.36,1) both" }}
            >
              <div className="relative glass rounded-3xl p-5 border border-gold/30 overflow-hidden shadow-gold">
                {/* Animated mesh background */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-40"
                  style={{
                    background:
                      "radial-gradient(circle at 30% 20%, hsl(var(--gold) / 0.25), transparent 60%), radial-gradient(circle at 80% 80%, hsl(var(--blue) / 0.2), transparent 55%)",
                    animation: "mesh-drift 18s ease-in-out infinite",
                  }}
                />
                {/* Pulsing ring accent */}
                <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full border border-gold/20 animate-pulse-dot" />

                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="relative inline-flex h-2 w-2">
                        <span className="absolute inset-0 rounded-full bg-gold animate-ping opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-gold font-semibold">
                        {t("Radar juridique")}
                      </span>
                    </div>
                    <button
                      onClick={() => setRadarOpen(false)}
                      className="haptic-tap text-muted-foreground hover:text-foreground text-sm leading-none"
                      aria-label="Fermer"
                    >
                      ✕
                    </button>
                  </div>

                  <h3 className="font-display text-lg leading-tight mb-1">
                    {t("Domaines détectés")}
                  </h3>
                  <p className="text-[11px] text-muted-foreground mb-4">
                    {t("Analyse en temps réel de votre conversation.")}
                  </p>

                  <div className="flex justify-center mb-4 animate-spring-in">
                    <LegalRadar counts={topicCounts} size={220} compact />
                  </div>

                  {detectedTopics > 0 ? (
                    <div className="space-y-1.5">
                      {Object.entries(topicCounts)
                        .filter(([, v]) => v > 0)
                        .sort((a, b) => b[1] - a[1])
                        .map(([name, v], i) => {
                          const max = Math.max(...Object.values(topicCounts), 1);
                          const pct = Math.round((v / max) * 100);
                          return (
                            <div
                              key={name}
                              className="group relative overflow-hidden rounded-xl bg-muted/30 border border-border/50 px-3 py-2 hover:border-gold/40 transition-all"
                              style={{ animation: `fade-up 0.5s cubic-bezier(0.22,1,0.36,1) ${0.1 + i * 0.07}s both` }}
                            >
                              <div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold/20 to-transparent transition-all"
                                style={{ width: `${pct}%` }}
                              />
                              <div className="relative flex items-center justify-between gap-2">
                                <span className="text-xs font-medium truncate">{t(name)}</span>
                                <span className="text-[10px] text-gold font-mono tabular-nums shrink-0">
                                  {v} {v > 1 ? t("mentions") : t("mention")}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-[11px] text-muted-foreground italic">
                      {t("Continuez la conversation, l'IA détectera les domaines.")}
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </>
        )}

        {/* Urgency banner */}
        {urgency !== "normal" && (
          <div className="px-4 md:px-10 pt-3 animate-fade-in">
            <div
              role="alert"
              className={`max-w-3xl mx-auto flex items-start gap-3 rounded-2xl px-4 py-3 border ${
                urgency === "urgent"
                  ? "border-destructive/60 bg-destructive/15"
                  : "border-orange/50 bg-orange/10"
              }`}
              style={urgency === "urgent" ? { animation: "urgent-pulse 1.6s ease-in-out infinite" } : undefined}
            >
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-destructive" />
              <div className="flex-1 text-sm">
                <div className="font-semibold">
                  {urgency === "urgent"
                    ? t("Situation urgente — consultez un avocat")
                    : t("Attention : démarche à délai limité")}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {t("Pour une assistance rapide, contactez le Barreau du Maroc.")}
                </div>
              </div>
              <button onClick={() => setUrgency("normal")} className="text-xs text-muted-foreground hover:text-foreground px-2">✕</button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 md:px-10 py-6 md:py-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-16 animate-fade-up">
                <div className="inline-flex h-16 w-16 rounded-full bg-gradient-mixed items-center justify-center text-white font-bold text-lg mb-6 animate-pulse-dot">
                  MZ
                </div>
                <h2 className="font-display text-3xl md:text-4xl mb-2">
                  {t("Bonjour.")} <span className="italic text-gradient-gold">{t("Décrivez votre situation.")}</span>
                </h2>
                <p className="text-sm text-muted-foreground mb-8">
                  {t("En français ou en darija. La conversation reste privée.")}
                </p>
                <div className="grid sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
                  {(loadingSuggestions ? Array.from({ length: 3 }) : suggestions).map((s, i) => (
                    <button
                      key={(s as string) ?? `skel-${i}`}
                      onClick={() => s && send(s as string)}
                      disabled={loadingSuggestions || !s}
                      className="haptic-tap text-left text-sm p-4 rounded-2xl glass hover:border-gold/40 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-wait min-h-[76px]"
                      style={{ animation: `fade-up 0.4s ease ${i * 0.08}s both` }}
                    >
                      <Sparkles className="h-3.5 w-3.5 text-gold mb-2" />
                      {loadingSuggestions || !s ? (
                        <span className="block h-3 w-3/4 rounded bg-muted/50 animate-pulse" />
                      ) : (
                        <span dir={isArabic(s as string) ? "rtl" : "ltr"}>{s as string}</span>
                      )}
                    </button>
                  ))}
                  <button
                    onClick={loadSuggestions}
                    disabled={loadingSuggestions}
                    className="sm:col-span-3 mx-auto mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition-colors disabled:opacity-50"
                  >
                    <Sparkles className="h-3 w-3" />
                    {loadingSuggestions ? t("Génération…") : t("Autres suggestions")}
                  </button>
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <MessageBubble
                key={i}
                msg={m}
                isLast={i === messages.length - 1}
                loading={loading}
                onGenerateLetter={() => setLetterOpen(true)}
              />
            ))}

            {loading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex items-start gap-3 animate-fade-in">
                <Avatar />
                <div className="glass rounded-2xl rounded-tl-md px-4 py-3 border-l-4 border-blue">
                  <TypingDots />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="relative z-10 px-3 md:px-10 pb-24 md:pb-6 pt-2">
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="pill-input-focus glass rounded-3xl md:rounded-full p-1.5 md:p-2 flex items-end gap-1 md:gap-2 transition-all"
            >
              <button
                type="button"
                onClick={() => setLang(lang === "fr" ? "ar" : "fr")}
                className="haptic-tap shrink-0 h-10 md:h-11 px-2 md:px-3 rounded-full text-[11px] md:text-xs font-bold text-gold hover:bg-gold/10 transition-colors"
                aria-label="Changer la langue"
              >
                {lang.toUpperCase()}
              </button>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
                }}
                rows={1}
                placeholder={lang === "fr"
                  ? "Décrivez votre situation en français ou en darija…"
                  : "وصف وضعيتك بالدارجة أو الفرنسية…"}
                dir={lang === "ar" ? "rtl" : "ltr"}
                className="relative z-10 flex-1 min-w-0 bg-transparent resize-none text-sm md:text-base placeholder:text-muted-foreground/70 focus:outline-none py-2.5 max-h-32 pointer-events-auto"
              />
              <button
                type="button"
                ref={micBtnRef}
                onClick={toggleDictation}
                aria-label={dictating ? "Arrêter l'enregistrement" : transcribing ? "Transcription en cours" : "Enregistrer un message vocal"}
                title={dictating ? "Arrêter l'enregistrement" : transcribing ? "Transcription en cours" : "Enregistrer un message vocal"}
                className={`haptic-tap h-10 w-10 md:h-11 md:w-11 shrink-0 rounded-full flex items-center justify-center transition-all ${
                  dictating
                    ? "bg-destructive/15 text-destructive border border-destructive/40 animate-pulse"
                    : transcribing
                    ? "bg-gold/15 text-gold border border-gold/40"
                    : "hover:bg-muted/40 text-muted-foreground hover:text-gold"
                }`}
              >
                {transcribing ? <Loader2 className="h-4 w-4 animate-spin" /> : dictating ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
              <button
                type="button"
                ref={callBtnRef}
                onClick={async () => {
                  try {
                    // Must run inside the click gesture for Chrome to grant permission
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    stream.getTracks().forEach((t) => t.stop());
                    setVoiceOpen(true);
                  } catch (err: any) {
                    if (err?.name === "NotAllowedError") toast.error("Microphone refusé. Autorisez-le dans les paramètres du navigateur.");
                    else if (err?.name === "NotFoundError") toast.error("Aucun microphone détecté.");
                    else toast.error("Impossible d'accéder au microphone.");
                  }
                }}
                aria-label="Lancer un appel vocal"
                title="Appel vocal avec Mizani"
                className="haptic-tap h-10 w-10 md:h-11 md:w-11 shrink-0 rounded-full bg-emerald/15 hover:bg-emerald/25 border border-emerald/40 text-emerald flex items-center justify-center transition-all hover:scale-105"
              >
                <Phone className="h-4 w-4" />
              </button>
              <button
                type="submit"
                disabled={!input.trim()}
                className="haptic-tap h-10 w-10 md:h-11 md:w-11 shrink-0 rounded-full bg-gradient-gold text-primary-foreground shadow-gold hover:scale-[1.06] disabled:opacity-50 disabled:scale-100 transition-all group inline-flex items-center justify-center"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                )}
              </button>
            </form>
            <p className="text-[10px] md:text-[11px] text-muted-foreground/70 text-center mt-2 md:mt-3 px-2">
              {t("Mizani peut faire des erreurs. Pour les cas sérieux, consultez un avocat agréé.")}
            </p>
          </div>
        </div>
      </main>

      <LetterGenerator
        open={letterOpen}
        onOpenChange={setLetterOpen}
        conversation={messages}
        category={detectedCategory}
      />

      <VoiceCall
        open={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        history={messages}
        sourceRef={callBtnRef}
        onSaveTranscript={(t) => setMessages((prev) => [...prev, ...t])}
      />

      <MobileNav />
    </div>
  );
};

const MessageBubble = ({
  msg, isLast, loading, onGenerateLetter,
}: { msg: Msg; isLast: boolean; loading: boolean; onGenerateLetter: () => void }) => {
  const rtl = isArabic(msg.content);
  const [speaking, setSpeaking] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => () => {
    try { window.speechSynthesis?.cancel(); } catch {}
  }, []);

  const toggleSpeak = () => {
    const synth = window.speechSynthesis;
    if (!synth) { toast.error("Synthèse vocale non supportée."); return; }
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    synth.cancel();
    // Strip markdown for cleaner speech
    const clean = msg.content.replace(/[*_`#>~\[\]()]/g, "").replace(/\s+/g, " ").trim();
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = rtl ? "ar-MA" : "fr-FR";
    const voices = synth.getVoices();
    const match = voices.find((v) => v.lang.toLowerCase().startsWith(rtl ? "ar" : "fr"));
    if (match) u.voice = match;
    u.rate = 1; u.pitch = 1;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    utterRef.current = u;
    setSpeaking(true);
    synth.speak(u);
  };

  if (msg.role === "user") {
    return (
      <div className="flex justify-end animate-slide-right">
        <div
          dir={rtl ? "rtl" : "ltr"}
          className="max-w-[80%] px-5 py-3 text-sm md:text-base leading-relaxed font-medium text-primary-foreground"
          style={{
            background: "linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-soft)))",
            borderRadius: rtl ? "18px 18px 18px 4px" : "18px 18px 4px 18px",
            textAlign: rtl ? "right" : "left",
          }}
        >
          {msg.content}
        </div>
      </div>
    );
  }

  const showActions = msg.content.length > 0 && (!isLast || !loading);

  return (
    <div className="flex items-start gap-3 animate-fade-up">
      <Avatar />
      <div className="flex-1 min-w-0 space-y-3">
        <div
          dir={rtl ? "rtl" : "ltr"}
          className="glass rounded-2xl rounded-tl-md px-5 py-3.5 max-w-[92%] border-l-4 border-blue"
          style={{ textAlign: rtl ? "right" : "left" }}
        >
          <div className="prose prose-sm prose-invert max-w-none prose-p:my-2 prose-headings:my-2 prose-headings:text-foreground prose-strong:text-gold prose-li:my-0.5 prose-a:text-gold">
            <ReactMarkdown>{msg.content || "…"}</ReactMarkdown>
          </div>
        </div>

        {showActions && (
          <div className="flex flex-wrap gap-2 pl-1">
            <button
              onClick={toggleSpeak}
              className={`haptic-tap text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
                speaking
                  ? "bg-emerald/20 border-emerald/50 text-emerald animate-pulse"
                  : "bg-blue/10 hover:bg-blue/20 border-blue/30 text-blue"
              }`}
              aria-label={speaking ? "Arrêter la lecture" : "Écouter"}
            >
              {speaking ? <Square className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
              {speaking ? "Arrêter" : "Écouter"}
            </button>
            <button
              onClick={onGenerateLetter}
              className="haptic-tap text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold/10 hover:bg-gold/20 border border-gold/30 text-gold transition-all"
            >
              📄 Générer une lettre
            </button>
            <button
              onClick={() => { navigator.clipboard.writeText(msg.content); toast.success("Copié."); }}
              className="haptic-tap text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/40 hover:bg-muted/70 border border-border text-muted-foreground hover:text-foreground transition-all"
            >
              <Copy className="h-3 w-3" /> Copier
            </button>
            <button
              onClick={() => toast.success("Merci !")}
              className="haptic-tap text-xs px-2.5 py-1.5 rounded-full bg-muted/40 hover:bg-muted/70 border border-border text-muted-foreground hover:text-emerald transition-all"
              aria-label="Utile"
            >
              <ThumbsUp className="h-3 w-3" />
            </button>
            <button
              onClick={() => toast("Merci pour le retour.")}
              className="haptic-tap text-xs px-2.5 py-1.5 rounded-full bg-muted/40 hover:bg-muted/70 border border-border text-muted-foreground hover:text-destructive transition-all"
              aria-label="Pas utile"
            >
              <ThumbsDown className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
