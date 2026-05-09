import { useEffect, useRef, useState } from "react";

const AnimatedCounter = ({
  to, durationMs = 1800, suffix = "", prefix = "",
}: { to: number; durationMs?: number; suffix?: string; prefix?: string }) => {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const tick = (t: number) => {
              const p = Math.min(1, (t - start) / durationMs);
              const eased = 1 - Math.pow(1 - p, 3);
              setV(to * eased);
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.3 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [to, durationMs]);

  const formatted =
    to >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M`
    : to >= 1_000   ? `${(v / 1_000).toFixed(1)}k`
    : Math.round(v).toString();

  return <span ref={ref} className="tabular-nums">{prefix}{formatted}{suffix}</span>;
};

export default AnimatedCounter;
