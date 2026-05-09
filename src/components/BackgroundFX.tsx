const BackgroundFX = () => (
  <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-background" />
    {/* 3 slow blobs */}
    <div
      className="absolute -top-40 -left-40 h-[55vmax] w-[55vmax] rounded-full blur-[140px] opacity-[0.18] animate-mesh-drift"
      style={{ background: "radial-gradient(circle, hsl(var(--gold)), transparent 60%)" }}
    />
    <div
      className="absolute -bottom-40 -right-40 h-[55vmax] w-[55vmax] rounded-full blur-[150px] opacity-[0.18] animate-mesh-drift"
      style={{ background: "radial-gradient(circle, hsl(var(--blue)), transparent 60%)", animationDelay: "-7s" }}
    />
    <div
      className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[45vmax] w-[45vmax] rounded-full blur-[140px] opacity-[0.15] animate-mesh-drift"
      style={{ background: "radial-gradient(circle, hsl(var(--violet)), transparent 60%)", animationDelay: "-14s" }}
    />
    {/* Zellige overlay */}
    <div className="absolute inset-0 zellige-overlay opacity-[0.03]" />
    {/* Grain via SVG noise */}
    <div
      className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
      }}
    />
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/70" />
  </div>
);

export default BackgroundFX;
