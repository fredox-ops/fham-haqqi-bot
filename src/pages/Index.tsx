import { Link } from "react-router-dom";
import {
  ArrowRight, Mic, Brain, FileText, Download,
  Briefcase, Home as HomeIcon, Users, FileSignature, Building2, ShoppingBag,
  ShieldCheck, BookOpen, Sparkles,
} from "lucide-react";
import BackgroundFX from "@/components/BackgroundFX";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import AnimatedCounter from "@/components/AnimatedCounter";
import JusticeSeal from "@/components/JusticeSeal";
import ZelligePattern from "@/components/ZelligePattern";
import RevealOnScroll from "@/components/RevealOnScroll";
import MagneticButton from "@/components/MagneticButton";
import ArticleCard from "@/components/ArticleCard";
import Testimonial from "@/components/Testimonial";
import { useT } from "@/lib/i18n";

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
  { Icon: Brain,    title: "L'agent analyse",          desc: "Mizani identifie le droit applicable et la jurisprudence." },
  { Icon: FileText, title: "Recevez une explication",  desc: "Articles cités, démarches détaillées, langage clair." },
  { Icon: Download, title: "Téléchargez votre lettre", desc: "Mise en demeure, recours, plainte — prête à signer." },
];

const ARTICLES = [
  {
    code: "Code du Travail",
    article: "754",
    title: "Indemnité de licenciement",
    excerpt: "Le salarié lié par un contrat à durée indéterminée a droit à une indemnité, en cas de licenciement après six mois de travail dans la même entreprise.",
  },
  {
    code: "Loi 67-12",
    article: "26",
    title: "Loyer & dépôt de garantie",
    excerpt: "Le bailleur ne peut exiger un dépôt de garantie dont le montant excède deux mois de loyer.",
  },
  {
    code: "Code de la Famille",
    article: "85",
    title: "Pension alimentaire",
    excerpt: "La pension alimentaire est évaluée selon le revenu de la personne tenue de la verser et la situation de la personne qui en bénéficie.",
  },
];

const TESTIMONIALS = [
  {
    quote: "J'ai compris pour la première fois mes droits face à mon employeur. La lettre était parfaite, le DRH a payé en 3 jours.",
    name: "Yassine B.",
    role: "Technicien réseau",
    city: "Casablanca",
  },
  {
    quote: "En darija, sans jargon, et avec les bons articles cités. C'est ce qui m'a permis de récupérer ma caution.",
    name: "Salma E.",
    role: "Étudiante",
    city: "Rabat",
  },
  {
    quote: "Mizani m'a aidée à rédiger un recours pour ma commune en moins de 10 minutes. Je n'aurais jamais osé seule.",
    name: "Naïma O.",
    role: "Commerçante",
    city: "Fès",
  },
];

const glowToColor = (g: string) =>
  g === "blue" ? "hsl(var(--blue))"
  : g === "gold" ? "hsl(var(--gold))"
  : g === "emerald" ? "hsl(var(--emerald))"
  : g === "violet" ? "hsl(var(--violet))"
  : g === "orange" ? "hsl(var(--orange))"
  : "hsl(var(--pink))";

const Index = () => {
  const t = useT();
  return (
  <div className="min-h-screen text-foreground relative overflow-x-hidden">
    <BackgroundFX />
    <Header />

    <main className="relative z-10 pb-28 md:pb-12">
      {/* HERO */}
      <section className="relative min-h-[100svh] flex items-center px-6 pt-28">
        {/* zellige watermark */}
        <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
          <ZelligePattern className="absolute inset-0" opacity={0.05} size={160} />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background" />
        </div>

        {/* massive arabic ghost */}
        <div aria-hidden className="pointer-events-none select-none absolute inset-0 flex items-center justify-center overflow-hidden">
          <span
            className="font-arabic font-bold leading-none text-foreground"
            style={{ fontSize: "min(95vw, 78vh)", opacity: 0.035 }}
            lang="ar"
          >
            العدالة
          </span>
        </div>

        <div className="relative grid lg:grid-cols-[1.25fr_1fr] gap-14 items-center max-w-6xl w-full mx-auto">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2.5 text-[11px] uppercase tracking-[0.22em] px-4 py-2 rounded-full glass mb-8 animate-fade-up">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-emerald animate-ping opacity-75" />
                <span className="relative rounded-full h-2 w-2 bg-emerald" />
              </span>
              <span className="text-muted-foreground">{t("Maison de Justice")}</span>
              <span className="text-foreground/80">{t("— Code Marocain 2025")}</span>
            </div>

            <h1 className="font-justice text-6xl sm:text-7xl md:text-[5.75rem] font-normal leading-[0.95] tracking-tight mb-7">
              <span className="block animate-fade-up" style={{ animationDelay: "0.05s" }}>
                {t("La justice,")}
              </span>
              <span className="block animate-fade-up" style={{ animationDelay: "0.18s" }}>
                {t("à votre")}
              </span>
              <span className="block italic text-gradient-gold animate-fade-up" style={{ animationDelay: "0.32s" }}>
                {t("mesure.")}
              </span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mb-10 animate-fade-up leading-relaxed" style={{ animationDelay: "0.45s" }}>
              {t("Mizani — l'équilibre — vous lit la loi marocaine en darija ou en français. Articles cités, démarches expliquées, lettres prêtes à signer.")}
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-9 animate-fade-up" style={{ animationDelay: "0.55s" }}>
              <MagneticButton strength={0.25}>
                <Link
                  to="/chat"
                  className="haptic-tap inline-flex items-center justify-center gap-2 h-13 px-8 rounded-full bg-gradient-gold text-primary-foreground font-semibold shadow-gold hover:shadow-[0_18px_60px_-10px_hsl(var(--gold)/0.7)] transition-all"
                  style={{ height: "3.4rem" }}
                >
                  {t("Consulter Mizani")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </MagneticButton>
              <a
                href="#how"
                className="haptic-tap inline-flex items-center justify-center gap-2 h-13 px-6 rounded-full border border-gold/40 text-foreground/85 font-medium hover:border-gold hover:text-gold transition-all"
                style={{ height: "3.4rem" }}
              >
                {t("Comment ça marche ↓")}
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground animate-fade-up" style={{ animationDelay: "0.7s" }}>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald" /> {t("Anonyme")}</span>
              <span className="opacity-40">•</span>
              <span><AnimatedCounter to={2_400_000} />{t("+ Marocains lésés chaque année")}</span>
              <span className="opacity-40">•</span>
              <span>{t("Darija & Français")}</span>
            </div>
          </div>

          {/* Right: justice seal */}
          <div className="hidden lg:flex items-center justify-center relative animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <JusticeSeal size={460} />
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <RevealOnScroll as="section" className="relative px-6 -mt-10 max-w-6xl mx-auto">
        <div className="glass-strong rounded-3xl px-6 md:px-10 py-7 grid grid-cols-2 md:grid-cols-4 gap-5 relative overflow-hidden">
          <ZelligePattern className="absolute inset-0" opacity={0.04} size={120} />
          {[
            { v: <AnimatedCounter to={12} />, l: t("Domaines juridiques") },
            { v: "2025", l: t("Code marocain à jour") },
            { v: "FR · AR", l: t("Darija & Français") },
            { v: <AnimatedCounter to={50} />, l: t("Modèles de lettres") },
          ].map((s, i) => (
            <div key={i} className="relative text-center md:text-left">
              <div className="font-justice text-3xl md:text-4xl text-gradient-gold">{s.v}</div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </RevealOnScroll>

      {/* DOMAINES */}
      <section className="relative px-6 py-24 max-w-6xl mx-auto">
        <RevealOnScroll className="text-center mb-14">
          <div className="inline-block text-[11px] uppercase tracking-widest text-gold mb-3">{t("Domaines juridiques")}</div>
          <h2 className="font-justice text-4xl md:text-5xl tracking-tight">
            {t("Tous vos droits.")} <span className="italic text-gradient-gold">{t("Un seul agent.")}</span>
          </h2>
        </RevealOnScroll>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {DOMAINS.map((d, i) => {
            const color = glowToColor(d.glow);
            return (
              <RevealOnScroll key={d.name} delay={i * 70}>
                <Link
                  to="/categories"
                  className="group relative glass rounded-3xl p-7 hover:-translate-y-2 transition-all duration-500 block overflow-hidden h-full"
                >
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  >
                    <ZelligePattern color={color} opacity={0.10} size={110} />
                  </div>
                  <div
                    aria-hidden
                    className="absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-2xl"
                    style={{ background: `radial-gradient(circle at 30% 0%, ${color}, transparent 60%)` }}
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
                    <h3 className="font-display text-2xl font-medium mb-1.5">{t(d.name)}</h3>
                    <p className="text-sm text-muted-foreground mb-5">{t(d.desc)}</p>
                    <span className="text-xs text-gold inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {t("Consulter")} <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              </RevealOnScroll>
            );
          })}
        </div>
      </section>

      {/* ARTICLES — preview */}
      <section className="relative px-6 py-20 max-w-6xl mx-auto">
        <RevealOnScroll className="text-center mb-14">
          <div className="inline-block text-[11px] uppercase tracking-widest text-gold mb-3 inline-flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5" /> {t("Articles cités")}
          </div>
          <h2 className="font-justice text-4xl md:text-5xl tracking-tight">
            {t("La loi,")} <span className="italic text-gradient-gold">{t("à la lettre.")}</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            {t("Chaque réponse de Mizani s'appuie sur des articles précis du droit marocain.")}
          </p>
        </RevealOnScroll>
        <div className="grid md:grid-cols-3 gap-5">
          {ARTICLES.map((a, i) => (
            <RevealOnScroll key={a.article} delay={i * 100}>
              <ArticleCard {...a} code={t(a.code)} title={t(a.title)} excerpt={t(a.excerpt)} />
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section id="how" className="relative px-6 py-20 max-w-6xl mx-auto">
        <RevealOnScroll className="text-center mb-14">
          <div className="inline-block text-[11px] uppercase tracking-widest text-gold mb-3">{t("Comment ça marche")}</div>
          <h2 className="font-justice text-4xl md:text-5xl tracking-tight">
            {t("Quatre étapes.")} <span className="italic text-gradient-gold">{t("Zéro jargon.")}</span>
          </h2>
        </RevealOnScroll>

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
              <RevealOnScroll key={i} delay={i * 120} className="text-center">
                <div className="relative inline-flex">
                  <div className="h-24 w-24 rounded-full glass flex items-center justify-center mb-4 mx-auto relative">
                    <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-gradient-gold text-primary-foreground text-sm font-bold flex items-center justify-center shadow-gold">
                      {i + 1}
                    </div>
                    <s.Icon className="h-7 w-7 text-gold" />
                  </div>
                </div>
                <h3 className="font-display text-xl font-medium mb-1">{t(s.title)}</h3>
                <p className="text-xs text-muted-foreground max-w-[180px] mx-auto">{t(s.desc)}</p>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative px-6 py-20 max-w-6xl mx-auto">
        <RevealOnScroll className="text-center mb-14">
          <div className="inline-block text-[11px] uppercase tracking-widest text-gold mb-3 inline-flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" /> {t("Témoignages")}
          </div>
          <h2 className="font-justice text-4xl md:text-5xl tracking-tight">
            {t("Des droits.")} <span className="italic text-gradient-gold">{t("Des résultats.")}</span>
          </h2>
        </RevealOnScroll>
        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <RevealOnScroll key={t.name} delay={i * 100}>
              <Testimonial {...t} />
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* CTA Footer band */}
      <section className="relative px-6 py-20">
        <RevealOnScroll className="max-w-4xl mx-auto">
          <div className="relative text-center glass-strong rounded-[2rem] p-12 overflow-hidden">
            <ZelligePattern className="absolute inset-0" opacity={0.06} size={140} />
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
            <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
            <div className="relative">
              <div className="font-arabic text-3xl text-gold/70 mb-2">العدالة</div>
              <h2 className="font-justice text-4xl md:text-5xl tracking-tight mb-4">
                {t("Vos droits,")} <span className="italic text-gradient-gold">{t("à portée de mot.")}</span>
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                {t("Posez votre première question maintenant. C'est gratuit, anonyme et instantané.")}
              </p>
              <MagneticButton strength={0.2}>
                <Link
                  to="/chat"
                  className="haptic-tap inline-flex items-center gap-2 h-13 px-8 rounded-full bg-gradient-gold text-primary-foreground font-semibold shadow-gold hover:shadow-[0_18px_60px_-10px_hsl(var(--gold)/0.7)] transition-all"
                  style={{ height: "3.4rem" }}
                >
                  {t("Démarrer une consultation")} <ArrowRight className="h-4 w-4" />
                </Link>
              </MagneticButton>
            </div>
          </div>
        </RevealOnScroll>
      </section>
    </main>

    <footer className="relative z-10 border-t border-border/40 py-8 px-6 text-center text-xs text-muted-foreground">
      {t("© 2026 Mizani — Information juridique générale. Ne remplace pas un avocat agréé.")}
    </footer>

    <MobileNav />
  </div>
  );
};

export default Index;
