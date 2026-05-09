import { Link } from "react-router-dom";
import {
  ArrowRight, Sparkles, Mic, Brain, FileText, Download,
  Briefcase, Home as HomeIcon, Users, FileSignature, Building2, ShoppingBag,
} from "lucide-react";
import BackgroundFX from "@/components/BackgroundFX";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import AnimatedCounter from "@/components/AnimatedCounter";

const DOMAINS = [
  { name: "Travail",        glow: "blue",    Icon: Briefcase,     desc: "Licenciement, salaire, indemnités, CNSS." },
  { name: "Logement",       glow: "gold",    Icon: HomeIcon,      desc: "Loyer, caution, expulsion, copropriété." },
  { name: "Famille",        glow: "emerald", Icon: Users,         desc: "Divorce, pension, garde, héritage." },
  { name: "Contrats",       glow: "violet",  Icon: FileSignature, desc: "Clauses, résiliation, obligations." },
  { name: "Administratif",  glow: "orange",  Icon: Building2,     desc: "Commune, état civil, recours." },
  { name: "Consommateur",   glow: "pink",    Icon: ShoppingBag,   desc: "Achats, garanties, services défaillants." },
] as const;

const STEPS = [
  { Icon: Mic,      title: "Décrivez votre situation", desc: "En français ou en darija. À l'écrit ou bientôt à l'oral." },
  { Icon: Brain,    title: "L'agent analyse",          desc: "DarjaLex identifie le droit applicable et la jurisprudence." },
  { Icon: FileText, title: "Recevez une explication",  desc: "Articles cités, démarches détaillées, langage clair." },
  { Icon: Download, title: "Téléchargez votre lettre", desc: "Mise en demeure, recours, plainte — prête à signer." },
];

const glowToColor = (g: string) =>
  g === "blue" ? "hsl(var(--blue))"
  : g === "gold" ? "hsl(var(--gold))"
  : g === "emerald" ? "hsl(var(--emerald))"
  : g === "violet" ? "hsl(var(--violet))"
  : g === "orange" ? "hsl(var(--orange))"
  : "hsl(var(--pink))";

const Index = () => (
  <div className="min-h-screen text-foreground relative overflow-x-hidden">
    <BackgroundFX />
    <Header />

    <main className="relative z-10 pb-28 md:pb-12">
      {/* HERO */}
      <section className="relative min-h-[100svh] flex items-center px-6 pt-28">
        {/* Massive Arabic background */}
        <div aria-hidden className="pointer-events-none select-none absolute inset-0 flex items-center justify-center overflow-hidden">
          <span
            className="font-arabic font-bold leading-none text-foreground"
            style={{ fontSize: "min(95vw, 80vh)", opacity: 0.04 }}
            lang="ar"
          >
            حق
          </span>
        </div>

        <div className="relative grid lg:grid-cols-[1.3fr_1fr] gap-12 items-center max-w-6xl w-full mx-auto">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2.5 text-xs px-4 py-2 rounded-full glass mb-7 animate-fade-up">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-emerald animate-ping opacity-75" />
                <span className="relative rounded-full h-2 w-2 bg-emerald" />
              </span>
              <span className="text-muted-foreground">Agent IA actif</span>
              <span className="text-foreground/80">— Droit Marocain 2025</span>
            </div>

            <h1 className="font-display text-6xl sm:text-7xl md:text-[5.5rem] font-medium leading-[0.95] tracking-tight mb-6">
              <span className="block animate-fade-up" style={{ animationDelay: "0.05s" }}>
                Comprenez
              </span>
              <span className="block animate-fade-up" style={{ animationDelay: "0.18s" }}>
                vos droits.
              </span>
              <span className="block italic text-gradient-gold animate-fade-up" style={{ animationDelay: "0.32s" }}>
                En darija.
              </span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mb-9 animate-fade-up" style={{ animationDelay: "0.45s" }}>
              Des millions de Marocains ignorent leurs droits faute d'accès.{" "}
              <span className="text-foreground">DarjaLex change ça.</span>
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-7 animate-fade-up" style={{ animationDelay: "0.55s" }}>
              <Link
                to="/chat"
                className="haptic-tap inline-flex items-center justify-center gap-2 h-13 px-7 rounded-full bg-gradient-gold text-primary-foreground font-semibold shadow-gold hover:scale-[1.03] transition-all"
                style={{ height: "3.25rem" }}
              >
                Consulter l'agent
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how"
                className="haptic-tap inline-flex items-center justify-center gap-2 h-13 px-6 rounded-full border-2 border-gold/60 text-gold font-semibold hover:border-gold hover:bg-gold/10 transition-all"
                style={{ height: "3.25rem" }}
              >
                Voir une démo ↓
              </a>
            </div>

            <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 animate-fade-up" style={{ animationDelay: "0.7s" }}>
              <span><AnimatedCounter to={2_400_000} />+ lésés</span>
              <span className="opacity-40">•</span>
              <span>Darija &amp; Français</span>
              <span className="opacity-40">•</span>
              <span>100% gratuit</span>
            </div>
          </div>

          {/* Right: animated DarjaLex logo */}
          <div className="hidden lg:flex items-center justify-center relative animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <AnimatedLogo />
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="relative px-6 -mt-10 max-w-6xl mx-auto">
        <div className="glass-strong rounded-3xl px-6 md:px-10 py-7 grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { v: <AnimatedCounter to={12} />, l: "Domaines juridiques" },
            { v: "2025", l: "Code marocain à jour" },
            { v: "FR · AR", l: "Darija & Français" },
            { v: <AnimatedCounter to={50} />, l: "Modèles de lettres" },
          ].map((s, i) => (
            <div key={i} className="text-center md:text-left">
              <div className="font-display text-3xl md:text-4xl text-gradient-gold">{s.v}</div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* DOMAINES */}
      <section className="relative px-6 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-block text-[11px] uppercase tracking-widest text-gold mb-3">Domaines juridiques</div>
          <h2 className="font-display text-4xl md:text-5xl tracking-tight">
            Tous vos droits. <span className="italic text-gradient-gold">Un seul agent.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {DOMAINS.map((d, i) => {
            const color = glowToColor(d.glow);
            return (
              <Link
                to="/categories"
                key={d.name}
                className="group relative glass rounded-3xl p-7 hover:-translate-y-2 transition-all duration-500 animate-fade-up"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div
                  aria-hidden
                  className="absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"
                  style={{ background: `radial-gradient(circle at 30% 0%, ${color}, transparent 60%)`, opacity: 0 }}
                />
                <div className="relative">
                  <div
                    className="h-12 w-12 rounded-2xl flex items-center justify-center mb-5 transition-shadow"
                    style={{
                      background: `linear-gradient(135deg, ${color}, transparent)`,
                      boxShadow: `0 10px 40px -10px ${color}`,
                    }}
                  >
                    <d.Icon className="h-5 w-5 text-foreground" />
                  </div>
                  <h3 className="font-display text-2xl font-medium mb-1.5">{d.name}</h3>
                  <p className="text-sm text-muted-foreground mb-5">{d.desc}</p>
                  <span className="text-xs text-gold inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Consulter <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section id="how" className="relative px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-block text-[11px] uppercase tracking-widest text-gold mb-3">Comment ça marche</div>
          <h2 className="font-display text-4xl md:text-5xl tracking-tight">
            Quatre étapes. <span className="italic text-gradient-gold">Zéro jargon.</span>
          </h2>
        </div>

        <div className="relative">
          {/* Dashed connector line (desktop) */}
          <svg
            aria-hidden
            className="hidden lg:block absolute top-12 left-0 w-full h-2 pointer-events-none"
            viewBox="0 0 1000 4" preserveAspectRatio="none"
          >
            <line
              x1="60" y1="2" x2="940" y2="2"
              stroke="hsl(var(--gold))" strokeWidth="1.5" strokeDasharray="6 8"
              strokeDashoffset="900"
              style={{ animation: "dash-draw 2s ease forwards", strokeDasharray: "900" }}
            />
          </svg>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {STEPS.map((s, i) => (
              <div key={i} className="text-center animate-fade-up" style={{ animationDelay: `${i * 120}ms` }}>
                <div className="relative inline-flex">
                  <div className="h-24 w-24 rounded-full glass flex items-center justify-center mb-4 mx-auto relative">
                    <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-gradient-gold text-primary-foreground text-sm font-bold flex items-center justify-center shadow-gold">
                      {i + 1}
                    </div>
                    <s.Icon className="h-7 w-7 text-gold" />
                  </div>
                </div>
                <h3 className="font-display text-xl font-medium mb-1">{s.title}</h3>
                <p className="text-xs text-muted-foreground max-w-[180px] mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer band */}
      <section className="relative px-6 py-20">
        <div className="max-w-4xl mx-auto text-center glass-strong rounded-[2rem] p-12">
          <h2 className="font-display text-4xl md:text-5xl tracking-tight mb-4">
            Vos droits, <span className="italic text-gradient-gold">à portée de mot.</span>
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Posez votre première question maintenant. C'est gratuit, anonyme et instantané.
          </p>
          <Link
            to="/chat"
            className="haptic-tap inline-flex items-center gap-2 h-13 px-8 rounded-full bg-gradient-gold text-primary-foreground font-semibold shadow-gold hover:scale-[1.03] transition-all"
            style={{ height: "3.25rem" }}
          >
            Démarrer une consultation <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>

    <footer className="relative z-10 border-t border-border/40 py-8 px-6 text-center text-xs text-muted-foreground">
      © 2026 DarjaLex — Information juridique générale. Ne remplace pas un avocat agréé.
    </footer>

    <MobileNav />
  </div>
);

export default Index;
