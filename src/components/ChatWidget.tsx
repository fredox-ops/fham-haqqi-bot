import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Scale, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Quels sont mes droits si je suis licencié sans préavis ?",
  "Mon propriétaire peut-il augmenter mon loyer ?",
  "Comment résilier un contrat de travail au Maroc ?",
];

interface ChatWidgetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const ChatWidget = ({ open, onOpenChange }: ChatWidgetProps) => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

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
        if (resp.status === 429) {
          toast.error("Trop de requêtes, réessayez dans un instant.");
        } else if (resp.status === 402) {
          toast.error("Crédits IA épuisés. Ajoutez des fonds.");
        } else {
          toast.error("Erreur du service IA.");
        }
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
      toast.error("Connexion impossible. Vérifiez votre réseau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating bubble */}
      <button
        onClick={() => onOpenChange(!open)}
        aria-label="Ouvrir l'assistant juridique"
        className={`fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full bg-gradient-gold text-primary-foreground shadow-gold flex items-center justify-center transition-all duration-500 hover:scale-110 animate-glow-pulse ${
          open ? "rotate-90 scale-90" : "animate-float"
        }`}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7" strokeWidth={2.2} />}
        {!open && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75 animate-ping" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-secondary" />
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-28 right-6 z-50 w-[calc(100vw-3rem)] max-w-[420px] h-[600px] max-h-[calc(100vh-9rem)] rounded-3xl glass flex flex-col overflow-hidden animate-scale-in shadow-2xl">
          {/* Header */}
          <div className="px-5 py-4 border-b border-border/50 flex items-center gap-3 bg-gradient-to-br from-card to-muted/40">
            <div className="h-10 w-10 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-gold">
              <Scale className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold leading-tight">DarjaLex</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
                Assistant juridique en ligne
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-full h-9 w-9">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
            {messages.length === 0 && (
              <div className="space-y-4 animate-fade-in">
                <div className="text-center py-4">
                  <p className="text-2xl mb-1" lang="ar" dir="rtl">سلام عليكم</p>
                  <p className="text-sm text-muted-foreground">
                    Posez votre question juridique en darija, français ou arabe.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground px-1">Suggestions</p>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="w-full text-left text-sm px-4 py-3 rounded-2xl bg-muted/40 hover:bg-muted/70 border border-border/40 hover:border-primary/40 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-gradient-gold text-primary-foreground rounded-br-md"
                      : "bg-muted/60 border border-border/40 rounded-bl-md"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none prose-p:my-1.5 prose-headings:my-2 prose-strong:text-primary prose-li:my-0.5">
                      <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                    </div>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}

            {loading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-muted/60 border border-border/40 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">Réflexion…</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="p-3 border-t border-border/50 bg-card/50"
          >
            <div className="flex items-end gap-2 glass rounded-2xl p-1.5 pl-4">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Posez votre question…"
                disabled={loading}
                className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/70 focus:outline-none py-2"
              />
              <Button
                type="submit"
                size="icon"
                disabled={loading || !input.trim()}
                className="h-10 w-10 rounded-xl bg-gradient-gold text-primary-foreground hover:scale-105 shadow-gold disabled:opacity-50 disabled:scale-100"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground/70 text-center mt-2">
              IA — vérifiez avec un avocat pour les cas sérieux.
            </p>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;