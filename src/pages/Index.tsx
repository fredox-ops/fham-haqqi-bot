import { Link } from "react-router-dom";
import { Scale, ArrowRight, Play, Sparkles } from "lucide-react";
import GradientMesh from "@/components/GradientMesh";
import AnimatedCounter from "@/components/AnimatedCounter";
import Floating3DScales from "@/components/Floating3DScales";
import ThemeToggle from "@/components/ThemeToggle";
import AmbientSound from "@/components/AmbientSound";
import MobileNav from "@/components/MobileNav";

const Index = () => {
  return (
    <div className="min-h-screen text-foreground relative overflow-x-hidden">
      <GradientMesh />

      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-40">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 animate-fade-in">
            <div className="h-9 w-9 rounded-2xl bg-gradient-blue flex items-center justify-center shadow-blue">
              <Scale className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Darja<span className="text-gradient-blue">Lex</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground animate-fade-in">
            <Link to="/categories" className="hover:text-foreground transition-colors">Domaines</Link>
            <Link to="/dashboard" className="hover:text-foreground transition-colors">Tableau de bord</Link>
            <Link to="/chat" className="hover:text-foreground transition-colors">Assistant</Link>
            <AmbientSound />
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="relative z-10 pb-24 md:pb-0">
        {/* HERO */}
        <section className="relative min-h-screen flex items-center justify-center px-6 pt-24">
          {/* Massive Arabic calligraphy background */}
          <div
            aria-hidden
            lang="ar"
            className="pointer-events-none select-none absolute inset-0 flex items-center justify-center overflow-hidden"
          >
            <span
              className="font-bold text-gradient-mixed leading-none"
              style={{
                fontSize: "min(80vw, 60vh)",
                opacity: 0.10,
                letterSpacing: "-0.02em",
              }}
            >
              حق
            </span>
          </div>

          <div className="relative grid lg:grid-cols-[1.2fr_1fr] gap-10 items-center max-w-6xl w-full">
            {/* Left content */}
            <div className="text-center lg:text-left animate-fade-in">
              <div className="inline-flex items-center gap-2 text-xs px-4 py-2 rounded-full glass border border-primary/30 text-primary mb-6">
                <Sparkles className="h-3.5 w-3.5" />
                IA juridique marocaine — propulsée par Claude
              </div>

              {/* Animated counter */}
              <div className="text-base md:text-lg text-muted-foreground mb-4">
                <span className="text-3xl md:text-4xl font-bold text-gradient-gold">
                  +<AnimatedCounter to={2_400_000} />
                </span>{" "}
                citoyens marocains lésés de leurs droits chaque année
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-5">
                L'IA qui parle{" "}
                <span className="text-gradient-blue">darija</span>.
                <br />
                L'IA qui connaît{" "}
                <span className="text-gradient-gold">vos droits</span>.
              </h1>

              <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-10">
                Posez vos questions juridiques en français ou en darija.
                DarjaLex vous explique vos droits, cite la loi marocaine et
                rédige vos lettres officielles.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  to="/chat"
                  className="haptic-tap inline-flex items-center justify-center gap-2 h-14 px-7 rounded-full bg-gradient-blue text-white font-semibold shadow-blue hover:scale-[1.03] transition-all"
                >
                  Commencer gratuitement
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/categories"
                  className="haptic-tap inline-flex items-center justify-center gap-2 h-14 px-7 rounded-full bg-transparent border-2 font-semibold transition-all hover:scale-[1.03]"
                  style={{ borderColor: "hsl(var(--gold))", color: "hsl(var(--gold))" }}
                >
                  <Play className="h-4 w-4" />
                  Voir une démo
                </Link>
              </div>
            </div>

            {/* Right: floating 3D scales */}
            <div className="hidden lg:flex items-center justify-center">
              <Floating3DScales size={320} />
            </div>
          </div>
        </section>

        {/* Quick value props */}
        <section className="relative px-6 py-20 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { t: "Droit du Travail", d: "Licenciement, salaire, indemnités, préavis.", c: "blue" },
              { t: "Logement & Bail", d: "Loyer, caution, expulsion, copropriété.", c: "gold" },
              { t: "Famille & Moudawana", d: "Divorce, pension, garde, héritage.", c: "blue" },
            ].map((x) => (
              <div key={x.t} className="glass rounded-3xl p-6 hover:-translate-y-1 transition-all">
                <div
                  className="h-10 w-10 rounded-2xl flex items-center justify-center mb-4"
                  style={{
                    background: x.c === "blue" ? "var(--gradient-blue)" : "var(--gradient-gold)",
                    boxShadow: x.c === "blue" ? "var(--shadow-blue)" : "var(--shadow-gold)",
                  }}
                >
                  <Scale className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-1">{x.t}</h3>
                <p className="text-sm text-muted-foreground">{x.d}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border/50 py-10 px-6 text-center text-xs text-muted-foreground">
        © 2026 DarjaLex — Information juridique générale. Ne remplace pas un avocat.
      </footer>

      <MobileNav />
    </div>
  );
};

export default Index;
