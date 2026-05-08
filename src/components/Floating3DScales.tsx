import { Scale } from "lucide-react";

const Floating3DScales = ({ size = 220 }: { size?: number }) => (
  <div
    className="relative"
    style={{
      width: size, height: size,
      perspective: "900px",
    }}
  >
    <div className="absolute inset-0 rounded-full blur-3xl opacity-60"
         style={{ background: "radial-gradient(circle, hsl(var(--electric-blue)/0.6), transparent 65%)" }} />
    <div
      className="absolute inset-0 flex items-center justify-center animate-scales-3d"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div
        className="rounded-3xl flex items-center justify-center shadow-blue"
        style={{
          width: size * 0.6, height: size * 0.6,
          background: "linear-gradient(135deg, hsl(var(--electric-blue)), hsl(var(--violet)))",
          transform: "translateZ(40px)",
          boxShadow: "0 30px 60px -20px hsl(var(--electric-blue)/0.7), inset 0 0 30px hsl(0 0% 100% / 0.1)",
        }}
      >
        <Scale style={{ color: "hsl(var(--gold))" }} size={size * 0.32} strokeWidth={1.6} />
      </div>
    </div>
  </div>
);

export default Floating3DScales;