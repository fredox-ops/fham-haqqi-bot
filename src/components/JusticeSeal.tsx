import { useEffect, useRef, useState } from "react";

/**
 * Mizani Justice Seal — animated SVG emblem.
 * Layers:
 *  1. Outer rotating dashed ring with calligraphic Arabic glyphs
 *  2. Inner counter-rotating zellige star
 *  3. Center: animated balance scales (oscillating beam)
 *  4. Glow halo + status orbits
 * Cursor-interactive: parallax tilt + ring nudge follow the mouse.
 */
const JusticeSeal = ({ size = 460 }: { size?: number }) => {
  // Full word, properly connected glyphs (Amiri renders the ligatures cleanly)
  const WORD = "العدالة";
  const ringRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, mag: 0 });

  useEffect(() => {
    const el = ringRef.current;
    if (!el) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      // Normalize -1..1 within ~1.6× the seal radius
      const dx = (e.clientX - cx) / (r.width * 0.8);
      const dy = (e.clientY - cy) / (r.height * 0.8);
      const clamp = (n: number) => Math.max(-1, Math.min(1, n));
      const nx = clamp(dx);
      const ny = clamp(dy);
      const mag = Math.min(1, Math.hypot(nx, ny));
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setTilt({ x: nx, y: ny, mag }));
    };
    const onLeave = () => setTilt({ x: 0, y: 0, mag: 0 });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Tilt amounts (degrees / pixels)
  const rotX = -tilt.y * 12;
  const rotY = tilt.x * 12;
  const shiftX = tilt.x * 14;
  const shiftY = tilt.y * 14;

  return (
    <div
      ref={ringRef}
      className="relative flex items-center justify-center cursor-pointer"
      style={{
        width: size,
        height: size,
        perspective: "1200px",
        transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
        transformStyle: "preserve-3d",
        transition: "transform 250ms cubic-bezier(0.2, 0.8, 0.2, 1)",
      }}
      aria-label="Sceau de justice Mizani"
    >
      {/* halo */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full blur-[100px]"
        style={{
          background: "radial-gradient(circle, hsl(var(--gold) / 0.55), transparent 65%)",
          animation: "logo-pulse 5s ease-in-out infinite",
          opacity: 0.5 + tilt.mag * 0.35,
          transform: `translate(${shiftX * 0.6}px, ${shiftY * 0.6}px)`,
          transition: "opacity 300ms ease, transform 300ms ease",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-12 rounded-full blur-[80px] opacity-40"
        style={{
          background: "radial-gradient(circle, hsl(var(--blue) / 0.5), transparent 70%)",
          animation: "logo-pulse 7s ease-in-out infinite reverse",
          transform: `translate(${shiftX * -0.4}px, ${shiftY * -0.4}px)`,
          transition: "transform 300ms ease",
        }}
      />

      {/* outer ring + arabic glyphs */}
      <svg
        viewBox="0 0 400 400"
        className="absolute inset-0 w-full h-full"
        style={{
          animation: "logo-spin 60s linear infinite",
          transform: `translate(${shiftX * 0.35}px, ${shiftY * 0.35}px)`,
          transition: "transform 250ms cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
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
        <text
          fill="hsl(var(--gold))"
          fillOpacity="0.85"
          fontSize="26"
          fontWeight={700}
          letterSpacing="6"
          style={{ fontFamily: "'Amiri', 'Scheherazade New', 'Noto Naskh Arabic', serif" }}
        >
          <textPath href="#seal-arc" startOffset="0%">
            {Array(8).fill(WORD).join("   ✦   ")}
          </textPath>
        </text>
      </svg>

      {/* inner law-themed ring — articles of law floating in arc */}
      <svg
        viewBox="0 0 400 400"
        className="absolute inset-16 w-[calc(100%-8rem)] h-[calc(100%-8rem)]"
        style={{
          animation: "logo-spin-rev 55s linear infinite",
          transform: `translate(${shiftX * -0.5}px, ${shiftY * -0.5}px)`,
          transition: "transform 250ms cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
      >
        <defs>
          <path id="law-arc" d="M 200,200 m -132,0 a 132,132 0 1,1 264,0 a 132,132 0 1,1 -264,0" />
        </defs>
        {/* concentric guide circles */}
        <circle cx="200" cy="200" r="138" fill="none" stroke="hsl(var(--gold))" strokeOpacity="0.22" strokeWidth="0.8" />
        <circle cx="200" cy="200" r="126" fill="none" stroke="hsl(var(--gold))" strokeOpacity="0.12" strokeWidth="0.5" strokeDasharray="1 5" />
        {/* legal terms running along the inner arc */}
        <text
          fill="hsl(var(--gold-soft))"
          fillOpacity="0.7"
          fontSize="11"
          letterSpacing="3"
          style={{ fontFamily: "'DM Sans', system-ui, sans-serif", textTransform: "uppercase" }}
        >
          <textPath href="#law-arc" startOffset="0%">
            {"  LEX  ·  العدل  ·  JUSTITIA  ·  الحق  ·  EQUITAS  ·  القانون  ·  VERITAS  ·  الإنصاف  "}
          </textPath>
        </text>

        {/* 6 columns of justice arranged radially */}
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i * 60 - 90) * (Math.PI / 180);
          const cx = 200 + Math.cos(a) * 102;
          const cy = 200 + Math.sin(a) * 102;
          const rot = (i * 60) + 90;
          return (
            <g key={i} transform={`translate(${cx} ${cy}) rotate(${rot})`} opacity="0.55">
              {/* mini column */}
              <rect x="-1.2" y="-12" width="2.4" height="24" fill="hsl(var(--gold))" opacity="0.55" />
              <rect x="-4" y="-15" width="8" height="3" fill="hsl(var(--gold))" opacity="0.7" />
              <rect x="-4" y="12" width="8" height="3" fill="hsl(var(--gold))" opacity="0.7" />
              <circle r="1.8" fill="hsl(var(--gold))">
                <animate attributeName="opacity" values="0.4;1;0.4" dur={`${3 + i * 0.4}s`} repeatCount="indefinite" />
              </circle>
            </g>
          );
        })}

        {/* gavel marks at cardinal points */}
        {[0, 90, 180, 270].map((deg, i) => {
          const a = (deg - 90) * (Math.PI / 180);
          const x = 200 + Math.cos(a) * 138;
          const y = 200 + Math.sin(a) * 138;
          return (
            <g key={deg} transform={`translate(${x} ${y})`}>
              <circle r="3.5" fill="hsl(var(--gold))" opacity="0.85">
                <animate attributeName="r" values="3;5;3" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;1;0.5" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
              </circle>
              <circle r="6" fill="none" stroke="hsl(var(--gold))" strokeOpacity="0.4" strokeWidth="0.6" />
            </g>
          );
        })}
      </svg>

      {/* laurel wreath of justice — two arching branches */}
      <svg
        viewBox="0 0 400 400"
        className="absolute inset-20 w-[calc(100%-10rem)] h-[calc(100%-10rem)] pointer-events-none"
        style={{ animation: "float-y 8s ease-in-out infinite" }}
      >
        <g fill="none" stroke="hsl(var(--gold))" strokeOpacity="0.45" strokeWidth="1.4" strokeLinecap="round">
          {/* left branch */}
          <path d="M 90 280 Q 70 200 130 110" />
          {/* right branch */}
          <path d="M 310 280 Q 330 200 270 110" />
          {/* leaves left */}
          {Array.from({ length: 7 }).map((_, i) => {
            const t = i / 6;
            const x = 90 + (130 - 90) * t * t + (-20) * (1 - t);
            const y = 280 - 170 * t;
            return (
              <ellipse key={`l${i}`} cx={x} cy={y} rx="8" ry="3.5" transform={`rotate(${-50 + i * 10} ${x} ${y})`} fill="hsl(var(--gold) / 0.25)" stroke="hsl(var(--gold))" strokeOpacity="0.55">
                <animate attributeName="fill-opacity" values="0.15;0.5;0.15" dur={`${3 + i * 0.2}s`} repeatCount="indefinite" />
              </ellipse>
            );
          })}
          {/* leaves right */}
          {Array.from({ length: 7 }).map((_, i) => {
            const t = i / 6;
            const x = 310 - (310 - 270) * t * t - (-20) * (1 - t);
            const y = 280 - 170 * t;
            return (
              <ellipse key={`r${i}`} cx={x} cy={y} rx="8" ry="3.5" transform={`rotate(${50 - i * 10} ${x} ${y})`} fill="hsl(var(--gold) / 0.25)" stroke="hsl(var(--gold))" strokeOpacity="0.55">
                <animate attributeName="fill-opacity" values="0.15;0.5;0.15" dur={`${3.2 + i * 0.2}s`} repeatCount="indefinite" />
              </ellipse>
            );
          })}
          {/* tie at bottom */}
          <path d="M 180 295 Q 200 305 220 295" stroke="hsl(var(--gold))" strokeOpacity="0.7" />
        </g>
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
        style={{
          animation: "float-y 6s ease-in-out infinite",
          transform: `translate(${shiftX * 0.9}px, ${shiftY * 0.9}px) scale(${1 + tilt.mag * 0.06})`,
          transition: "transform 250ms cubic-bezier(0.2, 0.8, 0.2, 1)",
          boxShadow: `0 0 ${30 + tilt.mag * 40}px hsl(var(--gold) / ${0.35 + tilt.mag * 0.4})`,
        }}
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
            {/* beam — oscillates + reacts to cursor */}
            <g
              style={{
                transformOrigin: "50px 28px",
                animation: "balance-tilt 4s ease-in-out infinite",
                transform: `rotate(${tilt.x * 8}deg)`,
                transition: "transform 250ms ease",
              }}
            >
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