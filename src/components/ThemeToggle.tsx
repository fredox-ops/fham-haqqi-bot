import { useEffect, useRef, useState } from "react";
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
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const saved = (localStorage.getItem(KEY) as Theme | null) ?? "dark";
    setTheme(saved);
    apply(saved);
  }, []);

  const toggle = () => {
    const btn = btnRef.current;
    const next: Theme = theme === "dark" ? "light" : "dark";
    if (btn && typeof document !== "undefined") {
      const r = btn.getBoundingClientRect();
      document.documentElement.style.setProperty("--reveal-x", `${r.left + r.width / 2}px`);
      document.documentElement.style.setProperty("--reveal-y", `${r.top + r.height / 2}px`);
      document.documentElement.classList.add("theme-transitioning");
      // Let the circular wipe cover the screen first, then swap the theme
      window.setTimeout(() => {
        setTheme(next);
        apply(next);
        try { localStorage.setItem(KEY, next); } catch {}
      }, 520);
      window.setTimeout(() => {
        document.documentElement.classList.remove("theme-transitioning");
      }, 940);
    } else {
      setTheme(next);
      apply(next);
      try { localStorage.setItem(KEY, next); } catch {}
    }
  };

  return (
    <button
      ref={btnRef}
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