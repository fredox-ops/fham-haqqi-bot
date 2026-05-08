type Risk = { label: string; value: number };

const LegalRadar = ({ risks }: { risks: Risk[] }) => {
  const max = Math.max(1, ...risks.map((r) => r.value));
  const cx = 100, cy = 100, R = 80;
  return (
    <div className="glass rounded-3xl p-4 w-full">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Legal Radar</div>
      <div className="relative w-full aspect-square">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {[0.33, 0.66, 1].map((r, i) => (
            <circle key={i} cx={cx} cy={cy} r={R * r} fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" />
          ))}
          {risks.map((_, i) => {
            const a = (i / risks.length) * Math.PI * 2 - Math.PI / 2;
            return (
              <line
                key={i}
                x1={cx} y1={cy}
                x2={cx + Math.cos(a) * R}
                y2={cy + Math.sin(a) * R}
                stroke="hsl(var(--border))" strokeWidth="0.4"
              />
            );
          })}
          {/* polygon of risks */}
          <polygon
            points={risks.map((r, i) => {
              const a = (i / risks.length) * Math.PI * 2 - Math.PI / 2;
              const v = (r.value / max) * R;
              return `${cx + Math.cos(a) * v},${cy + Math.sin(a) * v}`;
            }).join(" ")}
            fill="hsl(var(--electric-blue) / 0.25)"
            stroke="hsl(var(--electric-blue))"
            strokeWidth="1.2"
          />
          {/* sweep */}
          <g style={{ transformOrigin: "100px 100px" }} className="animate-radar-sweep">
            <defs>
              <linearGradient id="sweep" x1="0" x2="1">
                <stop offset="0%" stopColor="hsl(var(--gold))" stopOpacity="0.6" />
                <stop offset="100%" stopColor="hsl(var(--gold))" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={`M ${cx} ${cy} L ${cx + R} ${cy} A ${R} ${R} 0 0 0 ${cx + Math.cos(-Math.PI / 4) * R} ${cy + Math.sin(-Math.PI / 4) * R} Z`} fill="url(#sweep)" />
          </g>
          {risks.map((r, i) => {
            const a = (i / risks.length) * Math.PI * 2 - Math.PI / 2;
            const v = (r.value / max) * R;
            return (
              <circle
                key={i}
                cx={cx + Math.cos(a) * v}
                cy={cy + Math.sin(a) * v}
                r={3}
                fill="hsl(var(--gold))"
              />
            );
          })}
        </svg>
        {risks.map((r, i) => {
          const a = (i / risks.length) * Math.PI * 2 - Math.PI / 2;
          const x = 50 + Math.cos(a) * 48;
          const y = 50 + Math.sin(a) * 48;
          return (
            <span
              key={i}
              className="absolute text-[10px] text-muted-foreground -translate-x-1/2 -translate-y-1/2 whitespace-nowrap"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {r.label}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default LegalRadar;