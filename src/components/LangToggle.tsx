import { Languages } from "lucide-react";
import { useLang } from "@/lib/i18n";

const LangToggle = () => {
  const { lang, toggle } = useLang();
  return (
    <button
      onClick={toggle}
      aria-label={lang === "fr" ? "تبديل إلى العربية" : "Passer au français"}
      title={lang === "fr" ? "العربية" : "Français"}
      className="haptic-tap relative inline-flex items-center gap-1.5 h-9 px-3 rounded-full glass border border-gold/30 hover:border-gold text-xs font-bold text-gold hover:bg-gold/10 transition-all"
    >
      <Languages className="h-3.5 w-3.5" />
      <span className="tabular-nums">{lang === "fr" ? "AR" : "FR"}</span>
    </button>
  );
};

export default LangToggle;