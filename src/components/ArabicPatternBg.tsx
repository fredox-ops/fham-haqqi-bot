const ArabicPatternBg = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Animated geometric pattern */}
      <div className="absolute inset-0 arabic-pattern opacity-60 animate-pattern-drift" />

      {/* Glowing orbs */}
      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px] animate-float" />
      <div
        className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-secondary/10 blur-[140px] animate-float"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute top-1/2 left-1/3 h-[300px] w-[300px] rounded-full bg-primary/5 blur-[100px] animate-float"
        style={{ animationDelay: "4s" }}
      />

      {/* Decorative arabesque SVG */}
      <svg
        className="absolute right-0 top-1/4 h-[400px] w-[400px] opacity-[0.07]"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g stroke="hsl(var(--primary))" strokeWidth="0.8" fill="none">
          {Array.from({ length: 8 }).map((_, i) => (
            <g key={i} transform={`rotate(${i * 45} 100 100)`}>
              <path d="M100 100 Q140 60 100 20 Q60 60 100 100" />
              <circle cx="100" cy="50" r="20" />
            </g>
          ))}
          <circle cx="100" cy="100" r="80" />
          <circle cx="100" cy="100" r="50" />
        </g>
      </svg>

      <svg
        className="absolute left-10 bottom-10 h-[300px] w-[300px] opacity-[0.06]"
        viewBox="0 0 200 200"
      >
        <g stroke="hsl(var(--secondary))" strokeWidth="0.8" fill="none">
          {Array.from({ length: 12 }).map((_, i) => (
            <g key={i} transform={`rotate(${i * 30} 100 100)`}>
              <path d="M100 100 L100 30 L115 50 L100 70 Z" />
            </g>
          ))}
          <circle cx="100" cy="100" r="70" />
        </g>
      </svg>

      {/* Top fade */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />
      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
};

export default ArabicPatternBg;