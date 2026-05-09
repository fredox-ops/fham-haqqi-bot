import { NavLink } from "react-router-dom";
import { Home, MessageCircle, LayoutGrid, User } from "lucide-react";

const items = [
  { to: "/", label: "Accueil", icon: Home },
  { to: "/categories", label: "Domaines", icon: LayoutGrid },
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/dashboard", label: "Profil", icon: User },
];

const MobileNav = () => (
  <nav
    aria-label="Navigation principale"
    className="md:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-3 pt-2"
  >
    <div className="glass-strong rounded-full flex items-center justify-around px-2 py-1.5">
      {items.map((item) => (
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
          <span>{item.label}</span>
        </NavLink>
      ))}
    </div>
  </nav>
);

export default MobileNav;
