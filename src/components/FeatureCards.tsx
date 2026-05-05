import { Briefcase, Home, FileSignature } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  arabic: string;
  description: string;
  examples: string[];
  accent: "gold" | "emerald";
}

const features: Feature[] = [
  {
    icon: Briefcase,
    title: "Droits du Travail",
    arabic: "حقوق الشغل",
    description: "Contrats, salaires, licenciement, congés payés et indemnités selon le Code du Travail marocain.",
    examples: ["Préavis", "SMIG", "CNSS"],
    accent: "gold",
  },
  {
    icon: Home,
    title: "Logement",
    arabic: "السكن",
    description: "Bail, caution, expulsion, augmentation de loyer et obligations entre propriétaire et locataire.",
    examples: ["Bail", "Caution", "Loyer"],
    accent: "emerald",
  },
  {
    icon: FileSignature,
    title: "Contrats",
    arabic: "العقود",
    description: "Comprendre, négocier et résilier vos contrats commerciaux, civils et de prestations de service.",
    examples: ["DOC", "Résiliation", "Clauses"],
    accent: "gold",
  },
];

const FeatureCards = () => {
  return (
    <section id="features" className="relative py-24 px-6">
      <div className="container mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm uppercase tracking-[0.3em] text-secondary mb-4">Domaines couverts</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Trois piliers du droit <span className="text-gradient-gold">marocain</span>
          </h2>
          <p className="text-muted-foreground">
            Des réponses claires et actionnables sur les questions juridiques qui vous concernent au quotidien.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            const isGold = f.accent === "gold";
            return (
              <article
                key={f.title}
                className="group relative glass rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 hover:border-foreground/20 animate-fade-in cursor-pointer"
                style={{ animationDelay: `${0.1 * i}s` }}
              >
                {/* Glow */}
                <div
                  className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
                    isGold ? "shadow-gold" : "shadow-emerald"
                  }`}
                />

                {/* Arabic accent in corner */}
                <span
                  className="absolute top-6 right-6 text-2xl text-muted-foreground/40 group-hover:text-foreground/70 transition-colors"
                  lang="ar"
                  dir="rtl"
                >
                  {f.arabic}
                </span>

                <div
                  className={`inline-flex items-center justify-center h-14 w-14 rounded-2xl mb-6 transition-transform duration-500 group-hover:scale-110 ${
                    isGold
                      ? "bg-gradient-gold text-primary-foreground shadow-gold"
                      : "bg-gradient-emerald text-secondary-foreground shadow-emerald"
                  }`}
                >
                  <Icon className="h-7 w-7" strokeWidth={2.2} />
                </div>

                <h3 className="text-2xl font-bold mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">{f.description}</p>

                <div className="flex flex-wrap gap-2">
                  {f.examples.map((ex) => (
                    <span
                      key={ex}
                      className="text-xs px-3 py-1 rounded-full bg-muted/50 border border-border text-muted-foreground"
                    >
                      {ex}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;