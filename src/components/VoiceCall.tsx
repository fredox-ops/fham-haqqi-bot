import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, PhoneOff, FileDown } from "lucide-react";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };
type Status = "listening" | "processing" | "speaking";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaveTranscript: (msgs: Msg[]) => void;
  history: Msg[];
}

// Browser SpeechRecognition (webkit fallback)
const getRecognition = (): any => {
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SR) return null;
  const r = new SR();
  r.lang = "ar-MA";
  r.continuous = false;
  r.interimResults = true;
  return r;
};

const VoiceCall = ({ open, onClose, onSaveTranscript, history }: Props) => {
  const [status, setStatus] = useState<Status>("listening");
  const [muted, setMuted] = useState(false);
  const [transcript, setTranscript] = useState<Msg[]>([]);
  const [liveText, setLiveText] = useState("");
  const recogRef = useRef<any>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" });
  }, [transcript, liveText]);

  // Start/stop lifecycle
  useEffect(() => {
    if (!open) {
      stopAll();
      mountedRef.current = false;
      return;
    }
    mountedRef.current = true;
    setTranscript([]);
    setStatus("listening");
    setMuted(false);
    // small delay so entry animation plays
    const t = setTimeout(() => startListening(), 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const stopAll = () => {
    try { recogRef.current?.stop(); } catch {}
    try { window.speechSynthesis?.cancel(); } catch {}
    recogRef.current = null;
  };

  const startListening = () => {
    if (muted || !mountedRef.current) return;
    const r = getRecognition();
    if (!r) {
      toast.error("La reconnaissance vocale n'est pas supportée par ce navigateur.");
      onClose();
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
      if (e.error !== "no-speech" && e.error !== "aborted") {
        console.warn("Recognition error:", e.error);
      }
    };
    r.onend = () => {
      // restart if still in listening mode
      if (mountedRef.current && !muted && status === "listening") {
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
      if (!resp.ok || !resp.body) throw new Error("chat error");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistant = "";
      let done = false;
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
    if (!mountedRef.current) return;
    const synth = window.speechSynthesis;
    if (!synth) { setStatus("listening"); startListening(); return; }
    synth.cancel();
    // Strip markdown for cleaner TTS
    const clean = text.replace(/[*_`#>\[\]()]/g, "").replace(/\n+/g, ". ");
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = "ar-MA";
    u.rate = 1;
    u.pitch = 1;
    setStatus("speaking");
    u.onend = () => {
      if (!mountedRef.current) return;
      setStatus("listening");
      startListening();
    };
    u.onerror = () => {
      if (!mountedRef.current) return;
      setStatus("listening");
      startListening();
    };
    synth.speak(u);
  };

  const toggleMute = () => {
    setMuted((m) => {
      const nv = !m;
      if (nv) {
        try { recogRef.current?.stop(); } catch {}
      } else if (status === "listening") {
        startListening();
      }
      return nv;
    });
  };

  const endCall = () => {
    stopAll();
    onClose();
  };

  const saveAndExit = () => {
    if (transcript.length) {
      onSaveTranscript(transcript);
      toast.success("Transcription enregistrée dans le chat.");
    }
    endCall();
  };

  if (!open) return null;

  const statusLabel = {
    listening: { text: "En écoute...", dot: "bg-blue", glow: "" },
    processing: { text: "DarjaLex analyse...", dot: "bg-violet", glow: "is-processing" },
    speaking: { text: "DarjaLex répond...", dot: "bg-gold", glow: "is-speaking" },
  }[status];

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-between py-10 px-6 bg-black/95 backdrop-blur-2xl animate-fade-in"
      role="dialog"
      aria-label="Appel vocal"
    >
      {/* Status */}
      <div className="flex items-center gap-3 text-sm text-foreground/90 mt-6 animate-fade-up">
        <span className={`relative flex h-2 w-2`}>
          <span className={`absolute inset-0 rounded-full ${statusLabel.dot} opacity-75 animate-ping`} />
          <span className={`relative rounded-full h-2 w-2 ${statusLabel.dot}`} />
        </span>
        <span className="font-display italic text-lg tracking-wide">{statusLabel.text}</span>
      </div>

      {/* Orb */}
      <div className="relative flex items-center justify-center" style={{ animation: "spring-in 0.7s cubic-bezier(0.34,1.56,0.64,1)" }}>
        <div className={`orb-shell ${statusLabel.glow} ${muted ? "is-muted" : ""}`}>
          {status === "listening" && !muted && (
            <>
              <span className="orb-ripple" />
              <span className="orb-ripple" style={{ animationDelay: "0.5s" }} />
              <span className="orb-ripple" style={{ animationDelay: "1s" }} />
            </>
          )}
        </div>
      </div>

      {/* Transcript */}
      <div className="w-full max-w-xl glass rounded-3xl p-5 max-h-[28vh] overflow-hidden flex flex-col">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          Transcription en direct
        </div>
        <div ref={transcriptRef} className="flex-1 overflow-y-auto space-y-2 text-sm pr-2">
          {transcript.length === 0 && !liveText && (
            <div className="text-muted-foreground/60 italic text-center py-4">
              Parlez, je vous écoute…
            </div>
          )}
          {transcript.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-gold" : "text-foreground/90"}>
              <span className="text-[10px] uppercase tracking-wider mr-2 opacity-60">
                {m.role === "user" ? "Vous" : "DarjaLex"}
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

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 pb-2">
        <button
          onClick={toggleMute}
          className={`haptic-tap h-14 w-14 rounded-full glass border flex items-center justify-center transition-all ${
            muted ? "border-destructive/60 text-destructive" : "border-border text-foreground hover:text-gold"
          }`}
          aria-label={muted ? "Réactiver le micro" : "Couper le micro"}
        >
          {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>
        <button
          onClick={endCall}
          className="haptic-tap h-20 w-20 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-[0_15px_50px_-10px_hsl(0_84%_60%/0.7)] hover:scale-105 transition-transform"
          aria-label="Terminer l'appel"
        >
          <PhoneOff className="h-7 w-7" />
        </button>
        <button
          onClick={saveAndExit}
          className="haptic-tap h-14 w-14 rounded-full glass border border-gold/40 text-gold hover:bg-gold/10 flex items-center justify-center transition-all"
          aria-label="Enregistrer la transcription"
        >
          <FileDown className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default VoiceCall;