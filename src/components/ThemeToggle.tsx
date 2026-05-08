import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = () => {
  const [light, setLight] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("dl-theme");
    if (saved === "light") {
      document.documentElement.classList.add("light");
      setLight(true);
    }
  }, []);
  const toggle = () => {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle("light", next);
    localStorage.setItem("dl-theme", next ? "light" : "dark");
  };
  return (
    <button
      onClick={toggle}
      className="haptic-tap relative h-9 w-16 rounded-full glass border border-border/60 flex items-center px-1 transition-all"
      aria-label="Basculer thème"
    >
      <span
        className="absolute h-7 w-7 rounded-full flex items-center justify-center transition-transform duration-500 cubic-bezier(0.34,1.56,0.64,1)"
        style={{
          background: light ? "hsl(var(--gold))" : "hsl(var(--electric-blue))",
          transform: light ? "translateX(28px)" : "translateX(0)",
          boxShadow: light ? "0 0 18px hsl(var(--gold)/0.7)" : "0 0 18px hsl(var(--electric-blue)/0.7)",
        }}
      >
        {light ? <Sun className="h-3.5 w-3.5 text-black" /> : <Moon className="h-3.5 w-3.5 text-white" />}
      </span>
    </button>
  );
};

export default ThemeToggle;