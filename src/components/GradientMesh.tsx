const GradientMesh = () => (
  <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-background" />
    <div
      className="absolute -top-40 -left-40 h-[60vmax] w-[60vmax] rounded-full blur-[120px] opacity-60 animate-mesh-drift"
      style={{ background: "radial-gradient(circle, hsl(var(--electric-blue)/0.55), transparent 60%)" }}
    />
    <div
      className="absolute -bottom-40 -right-40 h-[55vmax] w-[55vmax] rounded-full blur-[140px] opacity-55 animate-mesh-drift"
      style={{ background: "radial-gradient(circle, hsl(var(--violet)/0.55), transparent 60%)", animationDelay: "-6s" }}
    />
    <div
      className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[40vmax] w-[40vmax] rounded-full blur-[120px] opacity-40 animate-mesh-drift"
      style={{ background: "radial-gradient(circle, hsl(var(--gold)/0.45), transparent 60%)", animationDelay: "-12s" }}
    />
    <div className="absolute inset-0 zellige-overlay opacity-[0.05]" />
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />
  </div>
);

export default GradientMesh;