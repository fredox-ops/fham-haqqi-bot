import { Link } from "react-router-dom";
import {
  Briefcase, Home as HomeIcon, Users, FileSignature, Building2, ShoppingBag, ArrowRight,
} from "lucide-react";
import BackgroundFX from "@/components/BackgroundFX";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import { useT } from "@/lib/i18n";

const DOMAINS = [
  {
    name: "Travail", glow: "hsl(var(--blue))", Icon: Briefcase,
    desc: "Licenciement, salaires, indemnités, CNSS, heures supplémentaires.",
    articles: ["Loi 65-99", "Art. 39", "Art. 345", "Art. 41"],
    questions: ["Mon employeur me licencie sans motif", "Calcul indemnité de départ", "Heures sup non payées"],
  },
  {
    name: "Logement", glow: "hsl(var(--gold))", Icon: HomeIcon,
    desc: "Bail, loyer, caution, expulsion, troubles de voisinage.",
    articles: ["Loi 67-12", "Art. 5", "Art. 19"],
    questions: ["Mon propriétaire augmente le loyer", "Restitution caution", "Procédure expulsion"],
  },
  {
    name: "Famille", glow: "hsl(var(--emerald))", Icon: Users,
    desc: "Mariage, divorce, garde, pension, héritage, Moudawana.",
    articles: ["Loi 70-03", "Art. 78", "Art. 84", "Art. 99"],
    questions: ["Procédure de divorce", "Pension alimentaire", "Garde des enfants"],
  },
  {
    name: "Contrats", glow: "hsl(var(--violet))", Icon: FileSignature,
    desc: "Clauses, signature, résiliation, vices du consentement.",
    articles: ["DOC", "Art. 230", "Art. 259"],
    questions: ["Résilier un contrat", "Clause abusive", "Non-respect d'engagement"],
  },
  {
    name: "Administratif", glow: "hsl(var(--orange))", Icon: Building2,
    desc: "État civil, commune, recours gracieux, hiérarchique.",
    articles: ["Loi 41-90", "Art. 8"],
    questions: ["Recours contre décision", "Délivrance document", "Plainte commune"],
  },
  {
    name: "Consommateur", glow: "hsl(var(--pink))", Icon: ShoppingBag,
    desc: "Achats, garanties, e-commerce, services défaillants.",
    articles: ["Loi 31-08", "Art. 65", "Art. 202"],
    questions: ["Produit défectueux", "Refus de remboursement", "Fraude commerciale"],
  },
];

const Categories = () => {
  const t = useT();
  return (
  <div className="min-h-screen text-foreground relative">
    <BackgroundFX />
    <Header />

    <main className="relative z-10 pt-32 pb-28 md:pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14 animate-fade-up">
          <div className="text-[11px] uppercase tracking-widest text-gold mb-3">{t("Domaines juridiques")}</div>
          <h1 className="font-display text-5xl md:text-6xl tracking-tight">
            {t("Choisissez votre")} <span className="italic text-gradient-gold">{t("domaine.")}</span>
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            {t("Survolez une carte pour voir les questions les plus fréquentes.")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DOMAINS.map((d, i) => (
            <div
              key={d.name}
              className="group relative animate-fade-up"
              style={{ animationDelay: `${i * 70}ms`, perspective: "1200px" }}
            >
              <div
                className="relative w-full h-[320px] transition-transform duration-700 group-hover:[transform:rotateY(180deg)]"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* FRONT */}
                <div
                  className="absolute inset-0 glass rounded-3xl p-7 flex flex-col"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div
                    className="h-12 w-12 rounded-2xl flex items-center justify-center mb-5"
                    style={{
                      background: `linear-gradient(135deg, ${d.glow}, transparent)`,
                      boxShadow: `0 10px 40px -10px ${d.glow}`,
                    }}
                  >
                    <d.Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-2xl mb-2">{t(d.name)}</h3>
                  <p className="text-sm text-muted-foreground mb-5 flex-1">{t(d.desc)}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {d.articles.map((a) => (
                      <span key={a} className="text-[10px] px-2.5 py-1 rounded-full glass text-muted-foreground border border-border">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                {/* BACK */}
                <div
                  className="absolute inset-0 glass-strong rounded-3xl p-7 flex flex-col"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <div className="text-[11px] uppercase tracking-widest text-gold mb-3">{t("Questions fréquentes")}</div>
                  <ul className="space-y-2.5 flex-1">
                    {d.questions.map((q) => (
                      <li key={q} className="text-sm flex items-start gap-2">
                        <span className="text-gold mt-1">•</span>
                        <span>{t(q)}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/chat"
                    className="haptic-tap mt-4 inline-flex items-center justify-center gap-2 h-10 rounded-full bg-gradient-gold text-primary-foreground text-sm font-semibold"
                  >
                    {t("Consulter")} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>

    <MobileNav />
  </div>
  );
};

export default Categories;
