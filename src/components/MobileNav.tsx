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
    <div className="glass rounded-3xl flex items-center justify-around px-2 py-1.5 shadow-glass border border-border/60">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl text-[10px] font-medium transition-all ${
              isActive
                ? "text-primary bg-primary/10"
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