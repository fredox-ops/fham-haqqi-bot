const ConfidenceBar = ({ score }: { score: number }) => {
  const pct = Math.max(0, Math.min(100, score));
  const tone =
    pct >= 80 ? "hsl(var(--electric-blue))" :
    pct >= 60 ? "hsl(var(--gold))" :
    "hsl(var(--destructive))";
  return (
    <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
      <span className="uppercase tracking-wider">Confiance</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted/60 overflow-hidden max-w-[180px]">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${tone}, hsl(var(--gold)))` }}
        />
      </div>
      <span className="tabular-nums" style={{ color: tone }}>{Math.round(pct)}%</span>
    </div>
  );
};

export default ConfidenceBar;