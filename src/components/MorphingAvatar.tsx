const MorphingAvatar = ({ active = false, size = 36 }: { active?: boolean; size?: number }) => (
  <div
    className="relative shrink-0"
    style={{ width: size, height: size }}
    aria-hidden
  >
    <div
      className="absolute inset-0 animate-morph-pattern"
      style={{
        background: "conic-gradient(from 0deg, hsl(var(--electric-blue)), hsl(var(--violet)), hsl(var(--gold)), hsl(var(--electric-blue)))",
        animationDuration: active ? "2.6s" : "8s",
        boxShadow: "0 0 20px hsl(var(--electric-blue)/0.45)",
      }}
    />
    <div className="absolute inset-[3px] rounded-full bg-background flex items-center justify-center">
      <span lang="ar" className="text-[12px] font-bold text-gradient-gold">حق</span>
    </div>
  </div>
);

export default MorphingAvatar;