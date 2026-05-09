import { Scale } from "lucide-react";

/**
 * Animated DarjaLex emblem:
 *  - Pulsing gold radial halo
 *  - Rotating dashed orbital ring (slow)
 *  - Counter-rotating inner ring with arabic glyph "حق"
 *  - Three orbiting particles (blue, gold, emerald)
 *  - Centered scales icon, gently floating
 */
const AnimatedLogo = () => (
  <div className="relative w-[420px] h-[420px] flex items-center justify-center">
    {/* outer glow */}
    <div
      aria-hidden
      className="absolute inset-0 rounded-full blur-[90px] opacity-60"
      style={{
        background:
          "radial-gradient(circle, hsl(var(--gold)/0.55), transparent 65%)",
        animation: "logo-pulse 4s ease-in-out infinite",
      }}
    />

    {/* secondary blue glow */}
    <div
      aria-hidden
      className="absolute inset-8 rounded-full blur-[70px] opacity-40"
      style={{
        background:
          "radial-gradient(circle, hsl(var(--blue)/0.5), transparent 70%)",
        animation: "logo-pulse 6s ease-in-out infinite reverse",
      }}
    />

    {/* outer dashed ring */}
    <svg
      aria-hidden
      viewBox="0 0 400 400"
      className="absolute inset-0 w-full h-full"
      style={{ animation: "logo-spin 28s linear infinite" }}
    >
      <defs>
        <linearGradient id="ringGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(var(--gold))" stopOpacity="0.9" />
          <stop offset="50%" stopColor="hsl(var(--gold))" stopOpacity="0.2" />
          <stop offset="100%" stopColor="hsl(var(--gold))" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <circle
        cx="200" cy="200" r="190"
        fill="none"
        stroke="url(#ringGold)"
        strokeWidth="1.2"
        strokeDasharray="2 10"
      />
      <circle
        cx="200" cy="200" r="190"
        fill="none"
        stroke="hsl(var(--gold))"
        strokeOpacity="0.25"
        strokeWidth="0.5"
      />
    </svg>

    {/* mid ring counter-rotating */}
    <svg
      aria-hidden
      viewBox="0 0 400 400"
      className="absolute inset-10 w-[calc(100%-5rem)] h-[calc(100%-5rem)]"
      style={{ animation: "logo-spin-rev 22s linear infinite" }}
    >
      <circle
        cx="200" cy="200" r="160"
        fill="none"
        stroke="hsl(var(--blue))"
        strokeOpacity="0.35"
        strokeWidth="1"
        strokeDasharray="14 8"
      />
      {/* notches */}
      {[0, 60, 120, 180, 240, 300].map((a) => {
        const rad = (a * Math.PI) / 180;
        const x = 200 + Math.cos(rad) * 160;
        const y = 200 + Math.sin(rad) * 160;
        return <circle key={a} cx={x} cy={y} r="2.5" fill="hsl(var(--gold))" />;
      })}
    </svg>

    {/* inner ring with arabic glyph */}
    <div
      className="absolute rounded-full border border-gold/30"
      style={{
        inset: "5.5rem",
        animation: "logo-spin 40s linear infinite",
      }}
    >
      <span
        className="font-arabic absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gold/15 font-bold select-none"
        style={{ fontSize: "13rem", lineHeight: 1 }}
        lang="ar"
      >
        حق
      </span>
    </div>

    {/* orbiting particles */}
    {[
      { color: "hsl(var(--gold))", dur: "9s",  delay: "0s",   r: 195 },
      { color: "hsl(var(--blue))", dur: "13s", delay: "-3s",  r: 165 },
      { color: "hsl(var(--emerald))", dur: "11s", delay: "-7s", r: 140 },
    ].map((p, i) => (
      <div
        key={i}
        aria-hidden
        className="absolute inset-0"
        style={{ animation: `logo-spin ${p.dur} linear infinite`, animationDelay: p.delay }}
      >
        <div
          className="absolute top-1/2 left-1/2 h-3 w-3 rounded-full"
          style={{
            background: p.color,
            boxShadow: `0 0 16px ${p.color}, 0 0 32px ${p.color}`,
            transform: `translate(-50%, -50%) translateX(${p.r}px)`,
          }}
        />
      </div>
    ))}

    {/* central emblem */}
    <div
      className="relative h-32 w-32 rounded-full glass-strong border border-gold/40 shadow-gold flex items-center justify-center"
      style={{ animation: "float-y 5s ease-in-out infinite" }}
    >
      <div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, hsl(var(--gold)/0.35), transparent 70%)",
        }}
      />
      <Scale
        className="relative h-14 w-14 text-gold drop-shadow-[0_0_18px_hsl(var(--gold)/0.6)]"
        strokeWidth={1.4}
      />
    </div>

    {/* status chip */}
    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 text-[11px] uppercase tracking-widest px-3.5 py-1.5 rounded-full glass">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inset-0 rounded-full bg-emerald animate-ping opacity-75" />
        <span className="relative rounded-full h-1.5 w-1.5 bg-emerald" />
      </span>
      <span className="text-muted-foreground">DarjaLex Agent</span>
    </div>
  </div>
);

export default AnimatedLogo;