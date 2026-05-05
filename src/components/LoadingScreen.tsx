import { Scale } from "lucide-react";

const LoadingScreen = ({ label = "Chargement..." }: { label?: string }) => (
  <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background">
    <div className="relative">
      <div className="absolute inset-0 rounded-3xl bg-gradient-gold blur-2xl opacity-60 animate-glow-pulse" />
      <div className="relative h-20 w-20 rounded-3xl bg-gradient-gold flex items-center justify-center shadow-gold animate-float">
        <Scale className="h-10 w-10 text-primary-foreground" strokeWidth={2.2} />
      </div>
    </div>
    <div className="mt-6 text-2xl font-bold tracking-tight">
      Darja<span className="text-gradient-gold">Lex</span>
    </div>
    <div className="mt-2 text-xs text-muted-foreground tracking-wider uppercase">
      {label}
    </div>
    <div className="mt-5 flex gap-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-primary"
          style={{
            animation: "ls-bounce 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
    <style>{`@keyframes ls-bounce { 0%,80%,100% { transform: scale(0.5); opacity: 0.4 } 40% { transform: scale(1); opacity: 1 } }`}</style>
  </div>
);

export default LoadingScreen;