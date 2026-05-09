import { Scale } from "lucide-react";

const LoadingScreen = ({ label = "Chargement…" }: { label?: string }) => (
  <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background">
    <svg width="120" height="120" viewBox="0 0 120 120" className="mb-6">
      <circle
        cx="60" cy="60" r="50"
        fill="none" stroke="hsl(var(--gold))" strokeWidth="2"
        strokeDasharray="320" strokeDashoffset="320"
        style={{ animation: "dash-draw 1.6s ease forwards" }}
      />
      <foreignObject x="40" y="40" width="40" height="40">
        <div className="h-10 w-10 flex items-center justify-center text-gold">
          <Scale className="h-7 w-7" />
        </div>
      </foreignObject>
    </svg>
    <div className="font-display text-3xl">
      <span className="text-gradient-gold italic">Mizani</span>
    </div>
    <div className="mt-3 text-xs text-muted-foreground tracking-widest uppercase">{label}</div>
    <style>{`@keyframes dash-draw { to { stroke-dashoffset: 0; } }`}</style>
  </div>
);

export default LoadingScreen;
