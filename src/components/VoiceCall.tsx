import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, PhoneOff, Download } from "lucide-react";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };
type Status = "listening" | "processing" | "speaking";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaveTranscript: (msgs: Msg[]) => void;
  history: Msg[];
  /** Source element (mic button) — orb shrinks back toward it on exit */
  sourceRef?: React.RefObject<HTMLElement>;
}

const getRecognition = (): any => {
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SR) return null;
  const r = new SR();
  r.lang = "ar-MA";
  r.continuous = false;
  r.interimResults = true;
  return r;
};

const VoiceCall = ({ open, onClose, onSaveTranscript, history, sourceRef }: Props) => {
  const [status, setStatus] = useState<Status>("listening");
  const [muted, setMuted] = useState(false);
  const [transcript, setTranscript] = useState<Msg[]>([]);
  const [liveText, setLiveText] = useState("");
  const [closing, setClosing] = useState(false);
  const [exitTransform, setExitTransform] = useState<string>("");
  const recogRef = useRef<any>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);
  const statusRef = useRef<Status>("listening");

  useEffect(() => { statusRef.current = status; }, [status]);

  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" });
  }, [transcript, liveText]);

  useEffect(() => {
    if (!open) {
      stopAll();
      mountedRef.current = false;
      return;
    }
    mountedRef.current = true;
    setTranscript([]);
    setLiveText("");
    setStatus("listening");
    setMuted(false);
    setClosing(false);
    setExitTransform("");
    const t = setTimeout(() => startListening(), 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const stopAll = () => {
    try { recogRef.current?.abort?.(); recogRef.current?.stop?.(); } catch {}
    try { window.speechSynthesis?.cancel(); } catch {}
    recogRef.current = null;
  };

  const startListening = () => {
    if (muted || !mountedRef.current || closing) return;
    const r = getRecognition();
    if (!r) {
      toast.error("La reconnaissance vocale n'est pas supportée par ce navigateur.");
      handleClose();
      return;
    }
    recogRef.current = r;
    setStatus("listening");
    setLiveText("");

    r.onresult = (e: any) => {
      let finalText = "";
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
        else interim += t;
      }
      setLiveText(interim);
      if (finalText.trim()) handleUserSpeech(finalText.trim());
    };
    r.onerror = (e: any) => {
      if (e.error !== "no-speech" && e.error !== "aborted") console.warn("Recog:", e.error);
    };
    r.onend = () => {
      if (mountedRef.current && !muted && !closing && statusRef.current === "listening") {
        try { r.start(); } catch {}
      }
    };
    try { r.start(); } catch {}
  };

  const handleUserSpeech = async (text: string) => {
    setLiveText("");
    const userMsg: Msg = { role: "user", content: text };
    const next = [...transcript, userMsg];
    setTranscript(next);
    try { recogRef.current?.stop(); } catch {}
    setStatus("processing");

    try {
      const messages = [...history, ...next].slice(-12);
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages }),
      });
      if (!resp.ok || !resp.body) throw new Error("chat");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "", assistant = "", done = false;
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
            const c = JSON.parse(json).choices?.[0]?.delta?.content;
            if (c) assistant += c;
          } catch {}
        }
      }
      if (!assistant.trim()) throw new Error("empty");
      const aiMsg: Msg = { role: "assistant", content: assistant };
      setTranscript((p) => [...p, aiMsg]);
      speak(assistant);
    } catch (e) {
      console.error(e);
      toast.error("Erreur de réponse vocale.");
      setStatus("listening");
      startListening();
    }
  };

  const speak = (text: string) => {
    if (!mountedRef.current || closing) return;
    const synth = window.speechSynthesis;
    if (!synth) { setStatus("listening"); startListening(); return; }
    synth.cancel();
    const clean = text.replace(/[*_`#>\[\]()]/g, "").replace(/\n+/g, ". ");
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = "ar-MA";
    setStatus("speaking");
    const back = () => {
      if (!mountedRef.current || closing) return;
      setStatus("listening");
      startListening();
    };
    u.onend = back;
    u.onerror = back;
    synth.speak(u);
  };

  const toggleMute = () => {
    setMuted((m) => {
      const nv = !m;
      if (nv) try { recogRef.current?.stop(); } catch {}
      else if (statusRef.current === "listening") setTimeout(startListening, 50);
      return nv;
    });
  };

  const handleClose = () => {
    if (closing) return;
    // Compute translate to mic button position for shrink-back
    if (orbRef.current && sourceRef?.current) {
      const orbBox = orbRef.current.getBoundingClientRect();
      const srcBox = sourceRef.current.getBoundingClientRect();
      const dx = srcBox.left + srcBox.width / 2 - (orbBox.left + orbBox.width / 2);
      const dy = srcBox.top + srcBox.height / 2 - (orbBox.top + orbBox.height / 2);
      setExitTransform(`translate(${dx}px, ${dy}px) scale(0.05)`);
    } else {
      setExitTransform("scale(0)");
    }
    setClosing(true);
    stopAll();
    setTimeout(() => onClose(), 500);
  };

  const saveAndExit = () => {
    if (transcript.length) {
      onSaveTranscript(transcript);
      toast.success("Transcription enregistrée.");
    }
    handleClose();
  };

  if (!open) return null;

  const statusMeta = {
    listening:  { label: "En écoute...",        dot: "bg-blue",   modifier: "orb--listening"  },
    processing: { label: "Analyse en cours...", dot: "bg-violet", modifier: "orb--processing" },
    speaking:   { label: "Mizani répond...",  dot: "bg-gold",   modifier: "orb--speaking"   },
  }[status];

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-between py-8 px-6 backdrop-blur-2xl transition-opacity duration-300 ${
        closing ? "opacity-0" : "opacity-100 animate-fade-in"
      }`}
      style={{ background: "rgba(0,0,0,0.85)" }}
      role="dialog"
      aria-label="Appel vocal"
    >
      {/* Status text */}
      <div
        key={status}
        className="flex items-center gap-3 mt-6"
        style={{ animation: "fade-up 0.4s ease both" }}
      >
        <span className="relative flex h-2 w-2">
          <span className={`absolute inset-0 rounded-full ${statusMeta.dot} opacity-75 animate-ping`} />
          <span className={`relative rounded-full h-2 w-2 ${statusMeta.dot}`} />
        </span>
        <span className="font-display italic text-lg tracking-wide text-white">{statusMeta.label}</span>
      </div>

      {/* Orb wrapper handles entry/exit transforms */}
      <div
        ref={orbRef}
        className={closing ? "" : "orb-wrap-enter"}
        style={{
          transform: closing ? exitTransform : undefined,
          opacity: closing ? 0 : 1,
          transition: closing ? "transform 500ms cubic-bezier(0.4, 0, 0.2, 1), opacity 500ms ease" : undefined,
          willChange: "transform",
        }}
      >
        <div className={`orb ${statusMeta.modifier} ${muted ? "orb--muted" : ""}`} />
      </div>

      {/* Live transcript */}
      <div className="w-full max-w-[500px] glass rounded-3xl p-5 max-h-[26vh] overflow-hidden flex flex-col">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
          Transcription en direct
        </div>
        <div ref={transcriptRef} className="flex-1 overflow-y-auto space-y-2 text-sm pr-1">
          {transcript.length === 0 && !liveText && (
            <div className="text-muted-foreground/60 italic text-center py-3">
              Commencez à parler...
            </div>
          )}
          {transcript.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-gold" : "text-foreground/90"}>
              <span className="text-[10px] uppercase tracking-wider mr-2 opacity-60">
                {m.role === "user" ? "Vous" : "Mizani"}
              </span>
              {m.content}
            </div>
          ))}
          {liveText && (
            <div className="text-gold/70 italic">
              <span className="text-[10px] uppercase tracking-wider mr-2 opacity-60">Vous</span>
              {liveText}
            </div>
          )}
        </div>
      </div>

      {/* Bottom controls — 80px apart */}
      <div className="flex items-center justify-center pb-2" style={{ gap: "80px" }}>
        <button
          onClick={toggleMute}
          aria-label={muted ? "Réactiver le micro" : "Couper le micro"}
          className={`haptic-tap relative h-14 w-14 rounded-full glass border flex items-center justify-center transition-all ${
            muted ? "border-destructive/60 text-destructive bg-destructive/15" : "border-white/15 text-white hover:text-gold"
          }`}
        >
          {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          {muted && (
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="block h-[2px] w-8 rotate-45 bg-destructive" />
            </span>
          )}
        </button>

        <button
          onClick={handleClose}
          aria-label="Terminer l'appel"
          className="haptic-tap h-16 w-16 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-[0_15px_50px_-10px_hsl(0_84%_60%/0.7)] hover:scale-105 transition-transform"
        >
          <PhoneOff className="h-6 w-6" />
        </button>

        <button
          onClick={saveAndExit}
          aria-label="Enregistrer la transcription"
          className="haptic-tap h-14 w-14 rounded-full bg-gradient-gold text-primary-foreground flex items-center justify-center shadow-gold hover:scale-105 transition-transform"
        >
          <Download className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default VoiceCall;