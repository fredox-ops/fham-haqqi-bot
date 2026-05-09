import { useMemo } from "react";

const AXES = [
  { name: "Travail",       color: "hsl(var(--blue))" },
  { name: "Logement",      color: "hsl(var(--gold))" },
  { name: "Famille",       color: "hsl(var(--emerald))" },
  { name: "Contrats",      color: "hsl(var(--violet))" },
  { name: "Administratif", color: "hsl(var(--orange))" },
  { name: "Consommateur",  color: "hsl(var(--pink))" },
] as const;

const SIZE = 320;
const CENTER = SIZE / 2;
const RADIUS = 120;

const polar = (angleDeg: number, r: number) => {
  const a = (angleDeg - 90) * (Math.PI / 180);
  return [CENTER + Math.cos(a) * r, CENTER + Math.sin(a) * r] as const;
};

interface Props {
  counts: Record<string, number>;
  /** Render width in px (default 320). SVG viewBox stays the same. */
  size?: number;
  /** Hide legend/labels for compact mode */
  compact?: boolean;
}

const LegalRadar = ({ counts, size = 320, compact = false }: Props) => {
  const max = Math.max(...AXES.map((a) => counts[a.name] || 0), 1);

  const dataPoints = AXES.map((a, i) => {
    const angle = (360 / AXES.length) * i;
    const v = (counts[a.name] || 0) / max;
    return polar(angle, RADIUS * v);
  });

  const polygon = dataPoints.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

  // Approx perimeter for stroke-dash animation
  const perimeter = useMemo(() => {
    let p = 0;
    for (let i = 0; i < dataPoints.length; i++) {
      const [x1, y1] = dataPoints[i];
      const [x2, y2] = dataPoints[(i + 1) % dataPoints.length];
      p += Math.hypot(x2 - x1, y2 - y1);
    }
    return Math.ceil(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [polygon]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ width: size, height: size, maxWidth: "100%" }}
        >
          {/* Concentric rings */}
          {[0.25, 0.5, 0.75, 1].map((r) => (
            <circle
              key={r}
              cx={CENTER} cy={CENTER} r={RADIUS * r}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth={r === 1 ? 1.2 : 0.8}
              strokeDasharray={r === 1 ? "0" : "3 4"}
              opacity={0.6}
            />
          ))}

          {/* Axes lines */}
          {AXES.map((_, i) => {
            const [x, y] = polar((360 / AXES.length) * i, RADIUS);
            return (
              <line
                key={i}
                x1={CENTER} y1={CENTER} x2={x} y2={y}
                stroke="hsl(var(--border))" strokeWidth={0.8} opacity={0.5}
              />
            );
          })}

          {/* Rotating scanner sweep */}
          <g style={{ transformOrigin: `${CENTER}px ${CENTER}px`, animation: "orb-spin 4s linear infinite" }}>
            <defs>
              <linearGradient id="radar-sweep" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(var(--gold))" stopOpacity="0" />
                <stop offset="100%" stopColor="hsl(var(--gold))" stopOpacity="0.85" />
              </linearGradient>
            </defs>
            <line
              x1={CENTER} y1={CENTER} x2={CENTER + RADIUS} y2={CENTER}
              stroke="url(#radar-sweep)" strokeWidth={1.6} strokeLinecap="round"
            />
            {/* trailing wedge */}
            <path
              d={`M ${CENTER} ${CENTER} L ${CENTER + RADIUS} ${CENTER} A ${RADIUS} ${RADIUS} 0 0 0 ${
                CENTER + Math.cos(-Math.PI / 4) * RADIUS
              } ${CENTER + Math.sin(-Math.PI / 4) * RADIUS} Z`}
              fill="hsl(var(--gold))"
              opacity={0.07}
            />
          </g>

          {/* Data polygon */}
          <polygon
            points={polygon}
            fill="hsl(var(--gold) / 0.3)"
            stroke="hsl(var(--gold))"
            strokeWidth={1.8}
            strokeLinejoin="round"
            style={{
              strokeDasharray: perimeter,
              strokeDashoffset: perimeter,
              animation: "radar-draw 1.6s cubic-bezier(0.22,1,0.36,1) 0.2s forwards",
            }}
          />

          {/* Data points */}
          {dataPoints.map(([x, y], i) => (
            <circle
              key={i}
              cx={x} cy={y} r={3.5}
              fill={AXES[i].color}
              stroke="hsl(var(--background))"
              strokeWidth={1.5}
              style={{ opacity: 0, animation: `fade-in 0.4s ease ${0.6 + i * 0.08}s forwards` }}
            />
          ))}

          {/* Axis labels */}
          {!compact && AXES.map((a, i) => {
            const [x, y] = polar((360 / AXES.length) * i, RADIUS + 22);
            return (
              <text
                key={a.name}
                x={x} y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-body"
                style={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", letterSpacing: "0.08em", textTransform: "uppercase" }}
              >
                {a.name}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      {!compact && (
      <div className="mt-5 grid grid-cols-3 sm:grid-cols-6 gap-x-4 gap-y-2">
        {AXES.map((a) => (
          <div key={a.name} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ background: a.color }} />
            <span className="truncate">{a.name}</span>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};

export default LegalRadar;