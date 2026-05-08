import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const AmbientSound = () => {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ osc: OscillatorNode; gain: GainNode } | null>(null);

  useEffect(() => () => {
    nodesRef.current?.osc.stop();
    ctxRef.current?.close();
  }, []);

  const toggle = async () => {
    if (on) {
      nodesRef.current?.gain.gain.linearRampToValueAtTime(0.0001, (ctxRef.current?.currentTime ?? 0) + 0.4);
      setTimeout(() => { nodesRef.current?.osc.stop(); nodesRef.current = null; }, 500);
      setOn(false);
      return;
    }
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx: AudioContext = ctxRef.current ?? new Ctx();
    ctxRef.current = ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    osc.type = "sine"; osc.frequency.value = 110;
    lfo.type = "sine"; lfo.frequency.value = 0.12;
    lfoGain.gain.value = 8;
    lfo.connect(lfoGain).connect(osc.frequency);
    gain.gain.value = 0.0001;
    osc.connect(gain).connect(ctx.destination);
    osc.start(); lfo.start();
    gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 1.2);
    nodesRef.current = { osc, gain };
    setOn(true);
  };

  return (
    <button
      onClick={toggle}
      aria-label="Ambiance sonore"
      className="haptic-tap h-9 w-9 rounded-full glass border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground"
    >
      {on ? <Volume2 className="h-4 w-4 text-secondary" /> : <VolumeX className="h-4 w-4" />}
    </button>
  );
};

export default AmbientSound;