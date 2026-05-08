import { useEffect, useState } from "react";

const AnimatedCounter = ({
  to, durationMs = 2200, suffix = "", prefix = "",
}: { to: number; durationMs?: number; suffix?: string; prefix?: string }) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(to * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, durationMs]);

  const formatted =
    to >= 1_000_000
      ? `${(v / 1_000_000).toFixed(1)}M`
      : to >= 1_000
        ? `${(v / 1_000).toFixed(1)}k`
        : Math.round(v).toString();

  return (
    <span className="tabular-nums">
      {prefix}{formatted}{suffix}
    </span>
  );
};

export default AnimatedCounter;