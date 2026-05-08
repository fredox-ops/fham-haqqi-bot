import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Mic, Send, Loader2, Plus, Briefcase, Home, FileSignature,
  Users, FileText, UserSearch, AlertTriangle, Menu, X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import GradientMesh from "@/components/GradientMesh";
import MorphingAvatar from "@/components/MorphingAvatar";
import ConfidenceBar from "@/components/ConfidenceBar";
import LegalRadar from "@/components/LegalRadar";
import LegalTimeline, { TimelineStep } from "@/components/LegalTimeline";
import LetterGenerator from "@/components/LetterGenerator";
import MobileNav from "@/components/MobileNav";
import ThemeToggle from "@/components/ThemeToggle";

type Msg = { role: "user" | "assistant"; content: string };
type Conversation = { id: string; title: string; category: Category };
type Category = "Travail" | "Logement" | "Famille" | "Contrats";
type Urgency = "normal" | "warning" | "urgent";

/* --------- Detection helpers (preserved logic) --------- */
const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  Travail: ["travail","employeur","salaire","licenci","préavis","cnss","smig","contrat de travail","patron","indemnit","heures suppl","khdma","mol khdma","ajr"],
  Logement: ["loyer","logement","propriétaire","bail","caution","expuls","appartement","maison","kira","mol dar","sakan"],
  Famille: ["divorce","mariage","pension","garde","enfant","héritage","famille","moudawana","talaq","zwaj","wraat","nafaqa"],
  Contrats: ["contrat","résiliation","clause","engagement","signature","obligation","résilier","3a9d","ittifa9"],
};
const URGENT_KW = ["urgent","urgence","immédiat","tout de suite","expulsion","arrestation","garde à vue","menacé","violence","agression","frappe","frappé","battu","violé","dab7","darb","9bdou","tanqodu","khouf","msta3jel","msta3jal"];
const WARN_KW = ["délai","prochainement","bientôt","tribunal","mise en demeure","convocation","amende"];

function detectCategory(text: string): Category | null {
  const t = text.toLowerCase();
  let best: { cat: Category; score: number } | null = null;
  (Object.keys(CATEGORY_KEYWORDS) as Category[]).forEach((cat) => {
    const score = CATEGORY_KEYWORDS[cat].reduce((s, kw) => (t.includes(kw) ? s + 1 : s), 0);
    if (score > 0 && (!best || score > best.score)) best = { cat, score };
  });
  return best?.cat ?? null;
}
function detectUrgency(text: string): Urgency {
  const t = text.toLowerCase();
  if (URGENT_KW.some((k) => t.includes(k))) return "urgent";
  if (WARN_KW.some((k) => t.includes(k))) return "warning";
  return "normal";
}
function categoryRiskScores(messages: Msg[]): Record<Category, number> {
  const text = messages.map((m) => m.content).join(" ").toLowerCase();
  const out: Record<Category, number> = { Travail: 0, Logement: 0, Famille: 0, Contrats: 0 };
  (Object.keys(CATEGORY_KEYWORDS) as Category[]).forEach((cat) => {
    out[cat] = CATEGORY_KEYWORDS[cat].reduce((s, kw) => (text.includes(kw) ? s + 1 : s), 0);
  });
  return out;
}
function confidenceScore(text: string): number {
  if (!text) return 60;
  let s = 65;
  if (/Art\.?\s*\d/i.test(text)) s += 15;
  if (/code du travail|moudawana|loi\s+\d/i.test(text)) s += 8;
  s += Math.min(12, Math.floor(text.length / 250));
  return Math.min(95, s);
}
function buildTimeline(cat: Category | null, msgCount: number): TimelineStep[] {
  const base: Record<Category | "default", string[]> = {
    Travail: ["Décrire la situation", "Vérifier le contrat", "Mise en demeure", "Saisir l'inspection du travail", "Tribunal social"],
    Logement: ["Décrire la situation", "Lettre au bailleur", "Mise en demeure", "Conciliation", "Tribunal de 1ʳᵉ instance"],
    Famille: ["Décrire la situation", "Conseil familial", "Tentative de conciliation", "Saisie du tribunal", "Jugement"],
    Contrats: ["Décrire la situation", "Analyse des clauses", "Mise en demeure", "Négociation", "Action en justice"],
    default: ["Décrire la situation", "Identifier le droit", "Préparer un courrier", "Démarche amiable", "Recours juridictionnel"],
  };
  const steps = base[cat ?? "default"];
  return steps.map((label, i) => ({
    label,
    state: i === 0 ? (msgCount === 0 ? "active" : "done")
         : i === 1 && msgCount > 0 ? "active"
         : "todo",
  }));
}

const CATEGORIES: { name: Category; icon: typeof Briefcase; arabic: string }[] = [
  { name: "Travail",  icon: Briefcase,     arabic: "الشغل" },
  { name: "Logement", icon: Home,          arabic: "السكن" },
  { name: "Famille",  icon: Users,         arabic: "الأسرة" },
  { name: "Contrats", icon: FileSignature, arabic: "العقود" },
];

const SAMPLE_HISTORY: Conversation[] = [
  { id: "1", title: "Licenciement sans préavis", category: "Travail" },
  { id: "2", title: "Calcul indemnités de départ", category: "Travail" },
  { id: "3", title: "Augmentation de loyer abusive", category: "Logement" },
  { id: "4", title: "Restitution de la caution", category: "Logement" },
  { id: "5", title: "Procédure de divorce", category: "Famille" },
  { id: "6", title: "Pension alimentaire", category: "Famille" },
  { id: "7", title: "Résiliation contrat freelance", category: "Contrats" },
];

const SUGGESTIONS = [
  "Mon employeur ne paie pas mes heures supplémentaires, que faire ?",
  "Wach 9ader yzid liya l-loyer bla 7it préavis ?",
  "Comment rédiger une mise en demeure ?",
];

const TypingDots = () => (
  <div className="flex items-center gap-1.5 py-1">
    {[0, 1, 2].map((i) => (
      <span key={i} className="h-2 w-2 rounded-full"
        style={{
          background: "hsl(var(--electric-blue))",
          animation: "bounce 1.2s ease-in-out infinite",
          animationDelay: `${i * 0.15}s`,
        }} />
    ))}
    <style>{`@keyframes bounce { 0%,80%,100% { transform: scale(0.6); opacity: 0.4 } 40% { transform: scale(1); opacity: 1 } }`}</style>
  </div>
);

const Chat = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [detectedCategory, setDetectedCategory] = useState<Category | null>(null);
  const [urgency, setUrgency] = useState<Urgency>("normal");
  const [letterOpen, setLetterOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(true);
  const touchStartX = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Swipe right from left edge → open sidebar (mobile)
  useEffect(() => {
    const onStart = (e: TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
    const onEnd = (e: TouchEvent) => {
      const start = touchStartX.current;
      if (start == null) return;
      const end = e.changedTouches[0].clientX;
      const dx = end - start;
      if (dx > 60 && start < 40 && !sidebarOpen) setSidebarOpen(true);
      else if (dx < -60 && sidebarOpen) setSidebarOpen(false);
      touchStartX.current = null;
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
  }, [sidebarOpen]);

  /* ---------- Send: keep streaming + detection logic ---------- */
  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const trimmed = text.trim();
    const userMsg: Msg = { role: "user", content: trimmed };
    const next = [...messages, userMsg];
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
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
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
    inputRef.current?.focus();
  };

  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    items: SAMPLE_HISTORY.filter((c) => c.category === cat.name),
  }));

  const risks = useMemo(() => {
    const s = categoryRiskScores(messages);
    return (Object.keys(s) as Category[]).map((k) => ({ label: k, value: s[k] }));
  }, [messages]);

  const timeline = useMemo(() => buildTimeline(detectedCategory, messages.length), [detectedCategory, messages.length]);

  return (
    <div className="h-screen w-full flex text-foreground overflow-hidden relative">
      <GradientMesh />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`flex flex-col w-[84%] max-w-[340px] md:w-[300px] border-r border-border/50 bg-card/80 md:bg-card/40 backdrop-blur-2xl
          fixed md:relative inset-y-0 left-0 z-50 md:z-auto transition-transform duration-500 ease-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="p-5 border-b border-border/50 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-bold text-base">
              Darja<span className="text-gradient-blue">Lex</span>
            </span>
          </Link>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4">
          <button
            onClick={newChat}
            className="haptic-tap w-full bg-gradient-blue text-white rounded-full h-11 font-semibold shadow-blue hover:scale-[1.02] inline-flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="h-4 w-4" />
            Nouvelle conversation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-5">
          {grouped.map((g) => {
            const Icon = g.icon;
            return (
              <div key={g.name} className="animate-fade-in">
                <div className="flex items-center gap-2 px-2 py-2">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{g.name}</span>
                  <span className="text-[10px] text-muted-foreground/60 ml-auto" lang="ar" dir="rtl">{g.arabic}</span>
                </div>
                <div className="space-y-0.5">
                  {g.items.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setActiveConv(c.id)}
                      className={`w-full text-left text-sm px-3 py-2.5 rounded-2xl transition-all truncate ${
                        activeConv === c.id
                          ? "bg-primary/15 text-foreground border border-primary/40"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent"
                      }`}
                    >
                      {c.title}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-border/50 flex items-center justify-between">
          <ThemeToggle />
          <span className="text-[10px] text-muted-foreground">Code juridique 2025</span>
        </div>
      </aside>

      {/* Main chat */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border/50 px-5 flex items-center gap-3 bg-card/30 backdrop-blur-md">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden haptic-tap flex items-center justify-center h-9 w-9 rounded-full glass border border-border"
            aria-label="Ouvrir la navigation"
          >
            <Menu className="h-4 w-4" />
          </button>
          <MorphingAvatar active={loading} />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm leading-tight">DarjaLex</div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              {loading ? "Réfléchit…" : "En ligne"}
            </div>
          </div>
          {detectedCategory && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full glass border border-primary/40 text-primary animate-fade-in">
              <span className="font-medium">{detectedCategory}</span>
              <span className="text-muted-foreground">détecté</span>
            </div>
          )}
          <button
            onClick={() => setInsightsOpen((s) => !s)}
            className="hidden lg:inline-flex haptic-tap text-xs px-3 py-1.5 rounded-full glass border border-border hover:border-primary/40"
          >
            {insightsOpen ? "Masquer" : "Afficher"} l'analyse
          </button>
        </header>

        {/* Urgency banner */}
        {urgency !== "normal" && (
          <div className="px-4 md:px-10 pt-3 animate-fade-in">
            <div
              role="alert"
              className={`max-w-3xl mx-auto flex items-start gap-3 rounded-3xl px-4 py-3 border ${
                urgency === "urgent"
                  ? "border-destructive/60 bg-destructive/15 glow-urgent"
                  : "border-[hsl(var(--warning))]/50 bg-[hsl(var(--warning))]/10 glow-warning"
              }`}
            >
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                style={{ background: urgency === "urgent" ? "hsl(var(--destructive)/0.3)" : "hsl(var(--warning)/0.3)" }}>
                <span className={`absolute inset-0 rounded-xl ${urgency === "urgent" ? "bg-destructive/40 animate-ping" : ""}`} />
                <AlertTriangle className="relative h-4 w-4 text-white" />
              </div>
              <div className="flex-1 text-sm">
                <div className="font-semibold">
                  {urgency === "urgent"
                    ? "Situation urgente détectée — consultez un avocat immédiatement"
                    : "Attention : démarche à délai limité"}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Pour une assistance rapide, contactez le Barreau du Maroc ou un avocat agréé.
                </div>
              </div>
              <button onClick={() => setUrgency("normal")} className="text-xs text-muted-foreground hover:text-foreground px-2">✕</button>
            </div>
          </div>
        )}

        {/* Body grid: messages + insights */}
        <div className="flex-1 grid lg:grid-cols-[minmax(0,1fr)_320px] overflow-hidden">
          <div ref={scrollRef} className="overflow-y-auto px-4 md:px-10 py-8">
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.length === 0 && (
                <div className="text-center py-12 animate-fade-in">
                  <div className="inline-flex mb-5"><MorphingAvatar size={64} /></div>
                  <p className="text-3xl mb-1" lang="ar" dir="rtl">سلام عليكم</p>
                  <h2 className="text-2xl font-bold mb-2">
                    Comment puis-je vous <span className="text-gradient-blue">aider</span> ?
                  </h2>
                  <p className="text-sm text-muted-foreground mb-8">
                    Décrivez votre situation, je vous réponds en darija ou en français.
                  </p>
                  <div className="grid sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="haptic-tap text-left text-sm p-4 rounded-3xl glass hover:border-primary/40 hover:-translate-y-0.5 transition-all"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <MessageBubble
                  key={i}
                  msg={m}
                  isLast={i === messages.length - 1}
                  loading={loading}
                  urgency={m.role === "user" ? detectUrgency(m.content) : "normal"}
                  onGenerateLetter={() => setLetterOpen(true)}
                />
              ))}

              {loading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex items-start gap-3 animate-fade-in">
                  <MorphingAvatar active />
                  <div className="glass rounded-3xl rounded-tl-md px-4 py-3 glow-blue">
                    <TypingDots />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Insights column */}
          {insightsOpen && (
            <aside className="hidden lg:flex flex-col gap-4 border-l border-border/40 p-4 overflow-y-auto bg-card/20 backdrop-blur">
              <LegalRadar risks={risks} />
              <LegalTimeline steps={timeline} />
            </aside>
          )}
        </div>

        {/* Input */}
        <div className="px-4 md:px-10 pb-6 pt-2">
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="pill-input-focus glass rounded-full p-2 pl-6 flex items-end gap-2 transition-all"
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
                }}
                rows={1}
                placeholder="Décrivez votre situation en français ou en darija..."
                disabled={loading}
                className="flex-1 bg-transparent resize-none text-sm md:text-base placeholder:text-muted-foreground/70 focus:outline-none py-2.5 max-h-32"
              />
              <button
                type="button"
                onClick={() => toast.info("Entrée vocale bientôt disponible.")}
                className="haptic-tap h-11 w-11 shrink-0 rounded-full border border-border bg-muted/40 hover:bg-muted/70 hover:border-primary/50 flex items-center justify-center text-muted-foreground hover:text-primary transition-all"
                aria-label="Entrée vocale"
              >
                <Mic className="h-4 w-4" />
              </button>
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="haptic-tap h-11 px-5 rounded-full bg-gradient-blue text-white shadow-blue hover:scale-[1.03] disabled:opacity-50 disabled:scale-100 transition-all group inline-flex items-center gap-1"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                )}
              </button>
            </form>
            <p className="text-[11px] text-muted-foreground/70 text-center mt-3">
              DarjaLex peut faire des erreurs. Pour les cas sérieux, consultez un avocat agréé.
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
      <MobileNav />
    </div>
  );
};

/* ---------- Bubble ---------- */
const MessageBubble = ({
  msg, isLast, loading, urgency, onGenerateLetter,
}: {
  msg: Msg; isLast: boolean; loading: boolean; urgency: Urgency; onGenerateLetter: () => void;
}) => {
  if (msg.role === "user") {
    const glow =
      urgency === "urgent" ? "glow-urgent" :
      urgency === "warning" ? "glow-warning" : "glow-blue";
    return (
      <div className="flex justify-end animate-fade-in">
        <div className={`max-w-[80%] rounded-3xl rounded-br-md px-5 py-3 text-sm md:text-base leading-relaxed ${glow}`}
          style={{ background: "var(--gradient-gold)", color: "hsl(var(--secondary-foreground))" }}>
          {msg.content}
        </div>
      </div>
    );
  }

  const showActions = msg.content.length > 0 && (!isLast || !loading);
  const score = confidenceScore(msg.content);

  return (
    <div className="flex items-start gap-3 animate-fade-in">
      <MorphingAvatar active={isLast && loading} />
      <div className="flex-1 min-w-0 space-y-3">
        <div className="glass rounded-3xl rounded-tl-md px-5 py-3.5 max-w-[92%] glow-blue">
          <div className="prose prose-sm prose-invert max-w-none prose-p:my-2 prose-headings:my-2 prose-headings:text-foreground prose-strong:text-primary prose-li:my-0.5 prose-a:text-secondary">
            <ReactMarkdown>{msg.content || "…"}</ReactMarkdown>
          </div>
          {msg.content && <ConfidenceBar score={score} />}
        </div>

        {showActions && (
          <div className="flex flex-wrap gap-2 pl-1">
            <ActionButton icon={FileText} label="Générer une lettre officielle" emoji="📄" onClick={onGenerateLetter} />
            <ActionButton icon={UserSearch} label="Trouver un avocat" emoji="👨‍⚖️" />
          </div>
        )}
      </div>
    </div>
  );
};

const ActionButton = ({
  icon: Icon, label, emoji, onClick,
}: { icon: typeof FileText; label: string; emoji: string; onClick?: () => void }) => (
  <button
    onClick={onClick ?? (() => toast.info(`"${label}" — bientôt disponible.`))}
    className="haptic-tap text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/40 hover:bg-muted/70 border border-border hover:border-primary/40 hover:text-primary text-muted-foreground transition-all"
  >
    <span className="text-sm leading-none" aria-hidden>{emoji}</span>
    <span>{label}</span>
    <Icon className="h-3 w-3 opacity-60" />
  </button>
);

export default Chat;