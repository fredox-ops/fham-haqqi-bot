import { NavLink } from "react-router-dom";
import { createPortal } from "react-dom";
import { Home, MessageCircle, LayoutGrid, User } from "lucide-react";
import { useT } from "@/lib/i18n";

const baseItems = [
  { to: "/", key: "Accueil", icon: Home },
  { to: "/categories", key: "Domaines", icon: LayoutGrid },
  { to: "/chat", key: "Chat", icon: MessageCircle },
  { to: "/dashboard", key: "Profil", icon: User },
] as const;

const MobileNav = () => {
  const t = useT();
  return createPortal(
  <nav
    aria-label="Navigation principale"
    className="md:hidden fixed bottom-0 inset-x-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-2"
  >
    <div className="glass-strong rounded-full flex items-center justify-around px-2 py-1.5">
      {baseItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          className={({ isActive }) =>
            `haptic-tap flex flex-col items-center gap-0.5 px-3 py-2 rounded-full text-[10px] font-medium transition-all ${
              isActive
                ? "text-primary-foreground bg-gradient-gold shadow-gold"
                : "text-muted-foreground hover:text-foreground"
            }`
          }
        >
          <item.icon className="h-5 w-5" />
          <span>{t(item.key)}</span>
        </NavLink>
      ))}
    </div>
  </nav>,
  document.body,
);
};

export default MobileNav;
