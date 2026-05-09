/**
 * Mizani Justice Seal — animated SVG emblem.
 * Layers:
 *  1. Outer rotating dashed ring with calligraphic Arabic glyphs
 *  2. Inner counter-rotating zellige star
 *  3. Center: animated balance scales (oscillating beam)
 *  4. Glow halo + status orbits
 */
const JusticeSeal = ({ size = 460 }: { size?: number }) => {
  const ARABIC = ["ع", "د", "ا", "ل", "ة", "ح", "ق", "ق"]; // adala / haqq
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      aria-label="Sceau de justice Mizani"
    >
      {/* halo */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full blur-[100px] opacity-50"
        style={{
          background: "radial-gradient(circle, hsl(var(--gold) / 0.55), transparent 65%)",
          animation: "logo-pulse 5s ease-in-out infinite",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-12 rounded-full blur-[80px] opacity-40"
        style={{
          background: "radial-gradient(circle, hsl(var(--blue) / 0.5), transparent 70%)",
          animation: "logo-pulse 7s ease-in-out infinite reverse",
        }}
      />

      {/* outer ring + arabic glyphs */}
      <svg
        viewBox="0 0 400 400"
        className="absolute inset-0 w-full h-full"
        style={{ animation: "logo-spin 60s linear infinite" }}
      >
        <defs>
          <path id="seal-arc" d="M 200,200 m -178,0 a 178,178 0 1,1 356,0 a 178,178 0 1,1 -356,0" />
          <linearGradient id="seal-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--gold))" stopOpacity="0.9" />
            <stop offset="50%" stopColor="hsl(var(--gold))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--gold))" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <circle cx="200" cy="200" r="190" fill="none" stroke="url(#seal-gold)" strokeWidth="1.2" strokeDasharray="2 9" />
        <circle cx="200" cy="200" r="178" fill="none" stroke="hsl(var(--gold))" strokeOpacity="0.25" strokeWidth="0.6" />
        <circle cx="200" cy="200" r="166" fill="none" stroke="hsl(var(--gold))" strokeOpacity="0.18" strokeWidth="0.6" />
        <text fill="hsl(var(--gold))" fillOpacity="0.55" fontSize="20" letterSpacing="14" style={{ fontFamily: "Reem Kufi, Amiri, serif" }}>
          <textPath href="#seal-arc" startOffset="0%">
            {Array(8).fill(ARABIC.join(" ")).join("  •  ")}
          </textPath>
        </text>
      </svg>

      {/* inner zellige star, counter-rotating */}
      <svg
        viewBox="0 0 400 400"
        className="absolute inset-16 w-[calc(100%-8rem)] h-[calc(100%-8rem)]"
        style={{ animation: "logo-spin-rev 45s linear infinite" }}
      >
        <g fill="none" stroke="hsl(var(--gold))" strokeOpacity="0.45" strokeWidth="1.1">
          {/* 8-point star */}
          <polygon points="200,40 240,140 340,160 260,230 290,330 200,275 110,330 140,230 60,160 160,140" />
          <polygon
            points="200,40 240,140 340,160 260,230 290,330 200,275 110,330 140,230 60,160 160,140"
            transform="rotate(36 200 200)"
            strokeOpacity="0.25"
          />
          <circle cx="200" cy="200" r="120" />
          <circle cx="200" cy="200" r="78" strokeOpacity="0.3" />
        </g>
        {/* notches */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
          const rad = (a * Math.PI) / 180;
          const x = 200 + Math.cos(rad) * 120;
          const y = 200 + Math.sin(rad) * 120;
          return <circle key={a} cx={x} cy={y} r="2.5" fill="hsl(var(--gold))" />;
        })}
      </svg>

      {/* orbiting particles */}
      {[
        { color: "hsl(var(--gold))", dur: "11s", delay: "0s", r: 195 },
        { color: "hsl(var(--blue))", dur: "15s", delay: "-4s", r: 165 },
        { color: "hsl(var(--emerald))", dur: "13s", delay: "-8s", r: 138 },
      ].map((p, i) => (
        <div
          key={i}
          aria-hidden
          className="absolute inset-0"
          style={{ animation: `logo-spin ${p.dur} linear infinite`, animationDelay: p.delay }}
        >
          <div
            className="absolute top-1/2 left-1/2 h-2.5 w-2.5 rounded-full"
            style={{
              background: p.color,
              boxShadow: `0 0 14px ${p.color}, 0 0 28px ${p.color}`,
              transform: `translate(-50%, -50%) translateX(${p.r}px)`,
            }}
          />
        </div>
      ))}

      {/* central balance */}
      <div
        className="relative h-36 w-36 rounded-full glass-strong border border-gold/40 shadow-gold flex items-center justify-center overflow-hidden"
        style={{ animation: "float-y 6s ease-in-out infinite" }}
      >
        <div
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle at 30% 30%, hsl(var(--gold)/0.4), transparent 70%)" }}
        />
        <svg viewBox="0 0 100 100" className="relative h-20 w-20 drop-shadow-[0_0_18px_hsl(var(--gold)/0.6)]">
          <g fill="none" stroke="hsl(var(--gold))" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            {/* central column */}
            <line x1="50" y1="18" x2="50" y2="78" />
            <circle cx="50" cy="14" r="3" fill="hsl(var(--gold))" stroke="none" />
            {/* base */}
            <line x1="34" y1="80" x2="66" y2="80" />
            <line x1="40" y1="84" x2="60" y2="84" />
            {/* beam — oscillates */}
            <g style={{ transformOrigin: "50px 28px", animation: "balance-tilt 4s ease-in-out infinite" }}>
              <line x1="20" y1="28" x2="80" y2="28" />
              {/* left pan */}
              <line x1="22" y1="28" x2="22" y2="40" />
              <path d="M 12 40 Q 22 50 32 40 Z" fill="hsl(var(--gold) / 0.15)" />
              {/* right pan */}
              <line x1="78" y1="28" x2="78" y2="40" />
              <path d="M 68 40 Q 78 50 88 40 Z" fill="hsl(var(--gold) / 0.15)" />
            </g>
          </g>
        </svg>
      </div>

      {/* status chip */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] px-4 py-1.5 rounded-full glass">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inset-0 rounded-full bg-emerald animate-ping opacity-75" />
          <span className="relative rounded-full h-1.5 w-1.5 bg-emerald" />
        </span>
        <span className="text-muted-foreground">Mizani · العدالة</span>
      </div>
    </div>
  );
};

export default JusticeSeal;