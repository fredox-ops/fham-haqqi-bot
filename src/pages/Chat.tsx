import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Mic, Send, Scale, Loader2, Plus, Briefcase, Home, FileSignature,
  Users, FileText, UserSearch, Sparkles, AlertTriangle,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import LetterGenerator from "@/components/LetterGenerator";
import MobileNav from "@/components/MobileNav";

type Msg = { role: "user" | "assistant"; content: string };
type Conversation = { id: string; title: string; category: Category };
type Category = "Travail" | "Logement" | "Famille" | "Contrats";

/* ----------- Auto-detection helpers ----------- */
const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  Travail: [
    "travail", "employeur", "salaire", "licenci", "préavis", "cnss", "smig",
    "contrat de travail", "patron", "indemnit", "heures suppl", "khdma", "patron",
    "mol khdma", "ajr", "raj3a",
  ],
  Logement: [
    "loyer", "logement", "propriétaire", "bail", "caution", "expuls",
    "appartement", "maison", "kira", "mol dar", "sakan",
  ],
  Famille: [
    "divorce", "mariage", "pension", "garde", "enfant", "héritage", "famille",
    "moudawana", "talaq", "zwaj", "wraat", "nafaqa",
  ],
  Contrats: [
    "contrat", "résiliation", "clause", "engagement", "signature", "obligation",
    "résilier", "3a9d", "ittifa9",
  ],
};

const URGENCY_KEYWORDS = [
  "urgent", "urgence", "immédiat", "tout de suite", "demain au tribunal",
  "expulsion", "arrestation", "garde à vue", "menacé", "violence",
  "agression", "frappe", "frappé", "battu", "violé",
  "dab7", "darb", "9bdou", "tanqodu", "khouf", "msta3jel", "msta3jal",
];

function detectCategory(text: string): Category | null {
  const t = text.toLowerCase();
  let best: { cat: Category; score: number } | null = null;
  (Object.keys(CATEGORY_KEYWORDS) as Category[]).forEach((cat) => {
    const score = CATEGORY_KEYWORDS[cat].reduce(
      (s, kw) => (t.includes(kw) ? s + 1 : s), 0,
    );
    if (score > 0 && (!best || score > best.score)) best = { cat, score };
  });
  return best?.cat ?? null;
}

function detectUrgency(text: string): boolean {
  const t = text.toLowerCase();
  return URGENCY_KEYWORDS.some((kw) => t.includes(kw));
}

const CATEGORY_META: Record<Category, { icon: typeof Briefcase; arabic: string; color: string }> = {
  Travail: { icon: Briefcase, arabic: "الشغل", color: "text-primary" },
  Logement: { icon: Home, arabic: "السكن", color: "text-secondary" },
  Famille: { icon: Users, arabic: "الأسرة", color: "text-secondary" },
  Contrats: { icon: FileSignature, arabic: "العقود", color: "text-primary" },
};

const CATEGORIES: { name: Category; icon: typeof Briefcase; arabic: string }[] = [
  { name: "Travail", icon: Briefcase, arabic: "الشغل" },
  { name: "Logement", icon: Home, arabic: "السكن" },
  { name: "Famille", icon: Users, arabic: "الأسرة" },
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
      <span
        key={i}
        className="h-2 w-2 rounded-full bg-primary"
        style={{
          animation: "bounce 1.2s ease-in-out infinite",
          animationDelay: `${i * 0.15}s`,
        }}
      />
    ))}
    <style>{`@keyframes bounce { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.4 } 40% { transform: scale(1); opacity: 1 } }`}</style>
  </div>
);

const AgentAvatar = () => (
  <div className="h-9 w-9 shrink-0 rounded-2xl bg-gradient-emerald flex items-center justify-center shadow-emerald">
    <Scale className="h-4.5 w-4.5 text-secondary-foreground" strokeWidth={2.2} />
  </div>
);

const Chat = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [detectedCategory, setDetectedCategory] = useState<Category | null>(null);
  const [urgent, setUrgent] = useState(false);
  const [letterOpen, setLetterOpen] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Swipe gestures (mobile): swipe right from left edge → open; swipe left → close
  useEffect(() => {
    const onStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
    };
    const onEnd = (e: TouchEvent) => {
      const start = touchStartX.current;
      if (start == null) return;
      const end = e.changedTouches[0].clientX;
      const dx = end - start;
      if (dx > 60 && start < 40 && !mobileSidebar) setMobileSidebar(true);
      else if (dx < -60 && mobileSidebar) setMobileSidebar(false);
      touchStartX.current = null;
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
  }, [mobileSidebar]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const trimmed = text.trim();
    const userMsg: Msg = { role: "user", content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    // Auto-detect category & urgency from full conversation context
    const fullText = next.map((m) => m.content).join(" ");
    const cat = detectCategory(fullText);
    if (cat) setDetectedCategory(cat);
    if (detectUrgency(trimmed)) setUrgent(true);

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: next }),
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
    setUrgent(false);
    inputRef.current?.focus();
  };

  const filteredHistory =
    activeCategory === "all"
      ? SAMPLE_HISTORY
      : SAMPLE_HISTORY.filter((c) => c.category === activeCategory);

  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    items: filteredHistory.filter((c) => c.category === cat.name),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="h-screen w-full flex bg-background text-foreground overflow-hidden">
      {/* Mobile sidebar overlay */}
      {mobileSidebar && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setMobileSidebar(false)}
        />
      )}
      {/* Sidebar (30%) */}
      <aside
        className={`flex flex-col w-[82%] max-w-[340px] md:w-[30%] md:max-w-[360px] border-r border-border/50 bg-card/95 md:bg-card/30 backdrop-blur-xl
          fixed md:relative inset-y-0 left-0 z-50 md:z-auto transition-transform duration-300
          ${mobileSidebar ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Brand */}
        <div className="p-5 border-b border-border/50">
          <Link to="/" className="flex items-center gap-2.5 group">
            <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:-translate-x-0.5 transition-transform" />
            <div className="h-8 w-8 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
              <Scale className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-base">
              Darja<span className="text-gradient-gold">Lex</span>
            </span>
          </Link>
        </div>

        {/* New chat */}
        <div className="p-4">
          <Button
            onClick={newChat}
            className="w-full bg-gradient-gold text-primary-foreground hover:scale-[1.02] hover:opacity-95 shadow-gold rounded-2xl h-11 font-semibold transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle conversation
          </Button>
        </div>

        {/* Category filters */}
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveCategory("all")}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              activeCategory === "all"
                ? "bg-primary/15 border-primary/40 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Tous
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.name}
              onClick={() => setActiveCategory(c.name)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                activeCategory === c.name
                  ? "bg-primary/15 border-primary/40 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* History */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-5">
          {grouped.map((g) => {
            const Icon = g.icon;
            return (
              <div key={g.name} className="animate-fade-in">
                <div className="flex items-center gap-2 px-2 py-2">
                  <Icon className="h-3.5 w-3.5 text-secondary" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {g.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60 ml-auto" lang="ar" dir="rtl">
                    {g.arabic}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {g.items.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setActiveConv(c.id)}
                      className={`w-full text-left text-sm px-3 py-2.5 rounded-xl transition-all truncate ${
                        activeConv === c.id
                          ? "bg-primary/10 text-foreground border border-primary/30"
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

        <div className="p-4 border-t border-border/50">
          <div className="glass rounded-2xl p-3 text-xs text-muted-foreground flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>Code Juridique Marocain 2025</span>
          </div>
        </div>
      </aside>

      {/* Main chat (70%) */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile shows brand) */}
        <header className="h-14 border-b border-border/50 px-5 flex items-center gap-3 bg-card/20 backdrop-blur-md">
          <Link to="/" className="md:hidden flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <AgentAvatar />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm leading-tight">DarjaLex</div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
              En ligne — répond en quelques secondes
            </div>
          </div>
          {detectedCategory && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full glass border border-secondary/40 text-secondary animate-fade-in">
              {(() => {
                const Icon = CATEGORY_META[detectedCategory].icon;
                return <Icon className="h-3.5 w-3.5" />;
              })()}
              <span className="font-medium">{detectedCategory}</span>
              <span className="text-muted-foreground">détecté</span>
            </div>
          )}
        </header>

        {/* Urgency banner */}
        {urgent && (
          <div className="px-4 md:px-10 pt-3 animate-fade-in">
            <div
              role="alert"
              className="max-w-3xl mx-auto flex items-start gap-3 rounded-2xl border border-destructive/50 bg-destructive/15 backdrop-blur-md px-4 py-3 shadow-[0_0_30px_-10px_hsl(var(--destructive)/0.6)]"
            >
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-destructive/30">
                <span className="absolute inset-0 rounded-xl bg-destructive/40 animate-ping" />
                <AlertTriangle className="relative h-4 w-4 text-destructive-foreground" />
              </div>
              <div className="flex-1 text-sm">
                <div className="font-semibold text-destructive-foreground">
                  Situation urgente détectée — consultez un avocat immédiatement
                </div>
                <div className="text-xs text-destructive-foreground/80 mt-0.5">
                  Pour une assistance légale rapide, contactez le Barreau du Maroc ou un avocat agréé.
                </div>
              </div>
              <button
                onClick={() => setUrgent(false)}
                className="text-xs text-destructive-foreground/70 hover:text-destructive-foreground px-2"
                aria-label="Ignorer l'alerte"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-10 py-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-12 animate-fade-in">
                <div className="inline-flex h-16 w-16 rounded-3xl bg-gradient-emerald items-center justify-center shadow-emerald mb-5">
                  <Scale className="h-8 w-8 text-secondary-foreground" />
                </div>
                <p className="text-3xl mb-1" lang="ar" dir="rtl">سلام عليكم</p>
                <h2 className="text-2xl font-bold mb-2">
                  Comment puis-je vous <span className="text-gradient-gold">aider</span> ?
                </h2>
                <p className="text-sm text-muted-foreground mb-8">
                  Décrivez votre situation, je vous réponds en darija ou en français.
                </p>
                <div className="grid sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-left text-sm p-4 rounded-2xl glass hover:border-primary/40 hover:-translate-y-0.5 transition-all"
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
                onGenerateLetter={() => setLetterOpen(true)}
              />
            ))}

            {loading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex items-start gap-3 animate-fade-in">
                <AgentAvatar />
                <div className="glass rounded-2xl rounded-tl-md px-4 py-3">
                  <TypingDots />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="px-4 md:px-10 pb-6 pt-2">
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="glass rounded-3xl p-2 pl-5 flex items-end gap-2 focus-within:border-primary/40 focus-within:shadow-gold transition-all"
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                rows={1}
                placeholder="Décrivez votre situation en français ou en darija..."
                disabled={loading}
                className="flex-1 bg-transparent resize-none text-sm md:text-base placeholder:text-muted-foreground/70 focus:outline-none py-3 max-h-32"
              />
              <button
                type="button"
                onClick={() => toast.info("Entrée vocale bientôt disponible.")}
                className="h-11 w-11 shrink-0 rounded-2xl border border-border bg-muted/40 hover:bg-muted/70 hover:border-secondary/50 flex items-center justify-center text-muted-foreground hover:text-secondary transition-all"
                aria-label="Entrée vocale"
              >
                <Mic className="h-4.5 w-4.5" />
              </button>
              <Button
                type="submit"
                disabled={loading || !input.trim()}
                className="h-11 px-5 rounded-2xl bg-gradient-gold text-primary-foreground shadow-gold hover:scale-[1.03] disabled:opacity-50 disabled:scale-100 transition-all group"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                )}
              </Button>
            </form>
            <p className="text-[11px] text-muted-foreground/70 text-center mt-3">
              DarjaLex peut faire des erreurs. Pour les cas sérieux, consultez un avocat agréé au Maroc.
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
    </div>
  );
};

const MessageBubble = ({
  msg, isLast, loading, onGenerateLetter,
}: {
  msg: Msg; isLast: boolean; loading: boolean; onGenerateLetter: () => void;
}) => {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className="max-w-[80%] bg-gradient-gold text-primary-foreground rounded-3xl rounded-br-md px-5 py-3 shadow-gold text-sm md:text-base leading-relaxed">
          {msg.content}
        </div>
      </div>
    );
  }

  const showActions = msg.content.length > 0 && (!isLast || !loading);

  return (
    <div className="flex items-start gap-3 animate-fade-in">
      <AgentAvatar />
      <div className="flex-1 min-w-0 space-y-3">
        <div className="glass rounded-3xl rounded-tl-md px-5 py-3.5 max-w-[90%]">
          <div className="prose prose-sm prose-invert max-w-none prose-p:my-2 prose-headings:my-2 prose-headings:text-foreground prose-strong:text-primary prose-li:my-0.5 prose-a:text-secondary">
            <ReactMarkdown>{msg.content || "…"}</ReactMarkdown>
          </div>
        </div>

        {showActions && (
          <div className="flex flex-wrap gap-2 pl-1">
            <ActionButton
              icon={FileText}
              label="Générer une lettre officielle"
              emoji="📄"
              onClick={onGenerateLetter}
            />
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
    className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/40 hover:bg-muted/70 border border-border hover:border-secondary/40 hover:text-secondary text-muted-foreground transition-all"
  >
    <span className="text-sm leading-none" aria-hidden>{emoji}</span>
    <span>{label}</span>
    <Icon className="h-3 w-3 opacity-60" />
  </button>
);

export default Chat;