import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "dark" | "light";
const KEY = "darjalex.theme";

const apply = (t: Theme) => {
  const root = document.documentElement;
  if (t === "light") root.classList.add("light");
  else root.classList.remove("light");
};

export const initTheme = () => {
  try {
    const saved = (localStorage.getItem(KEY) as Theme | null) ?? "dark";
    apply(saved);
  } catch { apply("dark"); }
};

const ThemeToggle = ({ className = "" }: { className?: string }) => {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved = (localStorage.getItem(KEY) as Theme | null) ?? "dark";
    setTheme(saved);
    apply(saved);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    apply(next);
    try { localStorage.setItem(KEY, next); } catch {}
  };

  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "Activer le mode clair" : "Activer le mode sombre"}
      className={`haptic-tap relative h-10 w-10 rounded-full glass border border-border hover:border-gold/50 flex items-center justify-center text-foreground hover:text-gold transition-all overflow-hidden ${className}`}
    >
      <Sun
        className={`h-4 w-4 absolute transition-all duration-500 ${
          theme === "light" ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
        }`}
      />
      <Moon
        className={`h-4 w-4 absolute transition-all duration-500 ${
          theme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
        }`}
      />
    </button>
  );
};

export default ThemeToggle;