import { useMemo } from "react";

/**
 * Slow floating gold particle background.
 * Pure CSS — no JS animation loop.
 */
const ParticleBg = ({ count = 28 }: { count?: number }) => {
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 1.5 + Math.random() * 3,
        delay: Math.random() * 12,
        duration: 14 + Math.random() * 16,
        opacity: 0.25 + Math.random() * 0.5,
      })),
    [count],
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background:
              "radial-gradient(circle, hsl(var(--gold-glow)) 0%, hsl(var(--gold)/0.6) 60%, transparent 100%)",
            boxShadow: "0 0 6px hsl(var(--gold)/0.6)",
            opacity: p.opacity,
            animation: `particle-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes particle-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -40px) scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default ParticleBg;