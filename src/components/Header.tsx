import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Scale } from "lucide-react";

const Header = () => {
  const [shrunk, setShrunk] = useState(false);
  useEffect(() => {
    const onScroll = () => setShrunk(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = [
    { to: "/categories", label: "Domaines" },
    { to: "/#how", label: "Comment ça marche" },
    { to: "/dashboard", label: "Tableau de bord" },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ${
        shrunk ? "py-2 backdrop-blur-2xl bg-background/70 border-b border-border/40" : "py-4"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative h-9 w-9 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
            <Scale className="h-5 w-5 text-primary-foreground" strokeWidth={2.4} />
          </div>
          <span className="font-display text-2xl font-semibold tracking-tight">
            Darja<span className="text-gradient-gold italic">Lex</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm">
          {navItems.map((n) =>
            n.to.startsWith("/#") ? (
              <a
                key={n.to}
                href={n.to.slice(1)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {n.label}
              </a>
            ) : (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `transition-colors ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`
                }
              >
                {n.label}
              </NavLink>
            )
          )}
        </nav>

        <Link
          to="/chat"
          className="haptic-tap inline-flex items-center justify-center h-10 px-5 rounded-full font-semibold text-sm border-2 border-gold text-gold hover:bg-gold hover:text-primary-foreground transition-all"
        >
          Commencer
        </Link>
      </div>
    </header>
  );
};

export default Header;
