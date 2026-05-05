import { Link } from "react-router-dom";
import {
  ArrowLeft, Briefcase, Home, Users, FileSignature, Building2, ShoppingCart, Scale,
} from "lucide-react";
import ParticleBg from "@/components/ParticleBg";
import MobileNav from "@/components/MobileNav";

type CategoryCard = {
  name: string;
  arabic: string;
  icon: typeof Briefcase;
  accent: "gold" | "emerald";
  articles: string[];
  questions: string[];
};

const CATEGORIES: CategoryCard[] = [
  {
    name: "Travail",
    arabic: "الشغل",
    icon: Briefcase,
    accent: "gold",
    articles: ["Art. 19 CT", "Art. 41 CT", "Art. 53 CT", "Art. 65 CT"],
    questions: [
      "Quel préavis pour un licenciement ?",
      "Comment sont payées les heures supplémentaires ?",
      "Comment calculer mes indemnités de départ ?",
    ],
  },
  {
    name: "Logement",
    arabic: "السكن",
    icon: Home,
    accent: "emerald",
    articles: ["Loi 67-12", "Art. 7", "Art. 22", "Art. 35"],
    questions: [
      "Mon propriétaire peut-il augmenter le loyer ?",
      "Comment récupérer ma caution ?",
      "Procédure d'expulsion : que faire ?",
    ],
  },
  {
    name: "Famille",
    arabic: "الأسرة",
    icon: Users,
    accent: "gold",
    articles: ["Moudawana 4", "Art. 78", "Art. 85", "Art. 198"],
    questions: [
      "Quelles étapes pour un divorce ?",
      "Comment fixer la pension alimentaire ?",
      "Comment fonctionne l'héritage ?",
    ],
  },
  {
    name: "Contrats",
    arabic: "العقود",
    icon: FileSignature,
    accent: "emerald",
    articles: ["DOC Art. 230", "Art. 232", "Art. 259", "Art. 264"],
    questions: [
      "Comment résilier un contrat ?",
      "Quelles clauses sont abusives ?",
      "Comment rédiger une mise en demeure ?",
    ],
  },
  {
    name: "Administratif",
    arabic: "الإدارة",
    icon: Building2,
    accent: "gold",
    articles: ["Loi 55-19", "Décret 2-17-410", "Art. 12", "Art. 28"],
    questions: [
      "Comment obtenir un acte de naissance ?",
      "Procédure de recours administratif ?",
      "Délais pour une demande à la commune ?",
    ],
  },
  {
    name: "Consommateur",
    arabic: "المستهلك",
    icon: ShoppingCart,
    accent: "emerald",
    articles: ["Loi 31-08", "Art. 36", "Art. 65", "Art. 202"],
    questions: [
      "Délai pour retourner un produit ?",
      "Garantie légale au Maroc ?",
      "Comment porter réclamation ?",
    ],
  },
];

const FlipCard = ({ c }: { c: CategoryCard }) => {
  const Icon = c.icon;
  return (
    <div className="group [perspective:1200px] h-72">
      <div className="relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        {/* Front */}
        <div className="absolute inset-0 [backface-visibility:hidden] glass rounded-3xl p-5 flex flex-col">
          <div className="flex items-center justify-between">
            <div
              className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-${c.accent} ${
                c.accent === "gold" ? "bg-gradient-gold" : "bg-gradient-emerald"
              }`}
            >
              <Icon
                className={`h-6 w-6 ${
                  c.accent === "gold" ? "text-primary-foreground" : "text-secondary-foreground"
                }`}
              />
            </div>
            <span
              lang="ar"
              dir="rtl"
              className="text-lg text-muted-foreground/80"
            >
              {c.arabic}
            </span>
          </div>
          <h3 className="mt-4 text-xl font-bold">{c.name}</h3>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {c.articles.map((a) => (
              <span
                key={a}
                className={`text-[10px] font-medium px-2.5 py-1 rounded-full border ${
                  c.accent === "gold"
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-secondary/30 bg-secondary/10 text-secondary"
                }`}
              >
                {a}
              </span>
            ))}
          </div>
          <p className="mt-auto text-[11px] text-muted-foreground/70">
            Survolez pour voir les questions fréquentes
          </p>
        </div>

        {/* Back */}
        <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden] glass rounded-3xl p-5 flex flex-col">
          <div className="flex items-center gap-2">
            <Icon className={c.accent === "gold" ? "h-4 w-4 text-primary" : "h-4 w-4 text-secondary"} />
            <h3 className="text-base font-bold">{c.name} — Questions fréquentes</h3>
          </div>
          <ul className="mt-3 space-y-2 flex-1">
            {c.questions.map((q, i) => (
              <li
                key={i}
                className="text-sm text-muted-foreground border-l-2 pl-3 leading-snug"
                style={{ borderColor: "hsl(var(--border))" }}
              >
                {q}
              </li>
            ))}
          </ul>
          <Link
            to="/chat"
            className={`mt-3 inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full transition-all ${
              c.accent === "gold"
                ? "bg-gradient-gold text-primary-foreground shadow-gold"
                : "bg-gradient-emerald text-secondary-foreground shadow-emerald"
            } hover:scale-[1.03]`}
          >
            Poser ma question
          </Link>
        </div>
      </div>
    </div>
  );
};

const Categories = () => (
  <div className="min-h-screen bg-background text-foreground relative">
    <ParticleBg />
    <header className="relative z-10 border-b border-border/50 backdrop-blur-md bg-card/20">
      <div className="container mx-auto px-5 py-4 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Accueil</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
            <Scale className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <span className="font-bold">Domaines juridiques</span>
        </div>
      </div>
    </header>

    <main className="relative z-10 container mx-auto px-5 py-8 pb-28 md:pb-12 max-w-6xl">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold">
          Domaines <span className="text-gradient-gold">juridiques</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Explorez les six grands domaines du droit marocain.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {CATEGORIES.map((c) => (
          <FlipCard key={c.name} c={c} />
        ))}
      </div>
    </main>

    <MobileNav />
  </div>
);

export default Categories;