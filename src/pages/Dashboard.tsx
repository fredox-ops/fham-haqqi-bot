import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, MessageSquare, FileText, TrendingUp, CheckCircle2,
  Briefcase, Home, Users, FileSignature, Scale,
} from "lucide-react";
import { toast } from "sonner";
import GradientMesh from "@/components/GradientMesh";
import MobileNav from "@/components/MobileNav";
import ZelligeEmpty from "@/components/ZelligeEmpty";

type Category = "Travail" | "Logement" | "Famille" | "Contrats";

type Conv = {
  id: string;
  title: string;
  category: Category;
  date: string;
  resolved: boolean;
};

const SEED: Conv[] = [
  { id: "1", title: "Licenciement sans préavis", category: "Travail", date: "12 mars", resolved: true },
  { id: "2", title: "Calcul indemnités de départ", category: "Travail", date: "18 mars", resolved: false },
  { id: "3", title: "Augmentation de loyer abusive", category: "Logement", date: "22 mars", resolved: false },
  { id: "4", title: "Restitution de la caution", category: "Logement", date: "01 avril", resolved: true },
  { id: "5", title: "Procédure de divorce", category: "Famille", date: "08 avril", resolved: false },
  { id: "6", title: "Pension alimentaire", category: "Famille", date: "15 avril", resolved: false },
  { id: "7", title: "Résiliation contrat freelance", category: "Contrats", date: "20 avril", resolved: true },
];

const CAT_ICON: Record<Category, typeof Briefcase> = {
  Travail: Briefcase,
  Logement: Home,
  Famille: Users,
  Contrats: FileSignature,
};

const StatCard = ({
  icon: Icon, label, value, accent, sublabel,
}: {
  icon: typeof MessageSquare; label: string; value: string | number;
  accent: "gold" | "emerald"; sublabel?: string;
}) => (
  <div className="glass rounded-3xl p-5 hover:-translate-y-0.5 transition-all animate-fade-in relative overflow-hidden">
    <div
      className={`absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl opacity-30 ${
        accent === "gold" ? "bg-primary" : "bg-secondary"
      }`}
    />
    <div
      className={`relative h-11 w-11 rounded-2xl flex items-center justify-center shadow-${accent} ${
        accent === "gold" ? "bg-gradient-gold" : "bg-gradient-emerald"
      }`}
    >
      <Icon className={`h-5 w-5 ${accent === "gold" ? "text-primary-foreground" : "text-secondary-foreground"}`} />
    </div>
    <div className="relative mt-4 text-3xl font-bold tracking-tight">{value}</div>
    <div className="relative text-sm text-muted-foreground mt-1">{label}</div>
    {sublabel && <div className="relative text-[11px] text-muted-foreground/70 mt-1">{sublabel}</div>}
  </div>
);

const Dashboard = () => {
  const [conversations, setConversations] = useState<Conv[]>(SEED);

  const stats = useMemo(() => {
    const total = conversations.length;
    const letters = conversations.filter((c) => c.resolved).length + 4;
    const counts: Record<Category, number> = { Travail: 0, Logement: 0, Famille: 0, Contrats: 0 };
    conversations.forEach((c) => counts[c.category]++);
    const top = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—") as Category;
    return { total, letters, top, topCount: counts[top] ?? 0 };
  }, [conversations]);

  const toggleResolved = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const next = !c.resolved;
        toast.success(next ? "Marqué comme résolu" : "Marqué comme en cours");
        return { ...c, resolved: next };
      }),
    );
  };

  const TopIcon = CAT_ICON[stats.top as Category] ?? Scale;

  return (
    <div className="min-h-screen text-foreground relative">
      <GradientMesh />

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
            <span className="font-bold">Mon espace</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-5 py-8 pb-28 md:pb-12 max-w-5xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold">
            Tableau de <span className="text-gradient-gold">bord</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Suivez vos consultations et l'évolution de vos dossiers.
          </p>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          <StatCard
            icon={MessageSquare}
            label="Consultations"
            value={stats.total}
            accent="gold"
            sublabel="Total des conversations"
          />
          <StatCard
            icon={FileText}
            label="Lettres générées"
            value={stats.letters}
            accent="emerald"
            sublabel="Lettres officielles"
          />
          <StatCard
            icon={TrendingUp}
            label="Catégorie principale"
            value={stats.top}
            accent="gold"
            sublabel={`${stats.topCount} consultation${stats.topCount > 1 ? "s" : ""}`}
          />
        </section>

        <section className="glass rounded-3xl p-5 md:p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Mes conversations</h2>
              <p className="text-xs text-muted-foreground">
                Marquez comme résolu pour suivre vos dossiers.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <TopIcon className="h-4 w-4 text-secondary" />
              <span>{stats.top}</span>
            </div>
          </div>

          {conversations.length === 0 ? (
            <div className="flex flex-col items-center text-center py-10">
              <ZelligeEmpty className="h-32 w-32 opacity-70" />
              <p className="mt-4 text-sm text-muted-foreground">Aucune conversation pour le moment.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border/40">
              {conversations.map((c) => {
                const Icon = CAT_ICON[c.category];
                return (
                  <li
                    key={c.id}
                    className="flex items-center gap-3 py-3 group"
                  >
                    <div className="h-9 w-9 rounded-xl bg-muted/60 border border-border flex items-center justify-center">
                      <Icon className="h-4 w-4 text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{c.title}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {c.category} · {c.date}
                      </div>
                    </div>

                    {/* Resolved toggle */}
                    <button
                      onClick={() => toggleResolved(c.id)}
                      className={`relative inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border transition-all ${
                        c.resolved
                          ? "bg-secondary/15 border-secondary/40 text-secondary"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                      aria-pressed={c.resolved}
                    >
                      <CheckCircle2 className={`h-3.5 w-3.5 ${c.resolved ? "" : "opacity-60"}`} />
                      <span className="hidden sm:inline">
                        {c.resolved ? "Résolu" : "En cours"}
                      </span>
                      <span
                        className={`relative inline-block h-4 w-7 rounded-full transition-colors ${
                          c.resolved ? "bg-secondary" : "bg-muted"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-3 w-3 rounded-full bg-background transition-all ${
                            c.resolved ? "left-3.5" : "left-0.5"
                          }`}
                        />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>

      <MobileNav />
    </div>
  );
};

export default Dashboard;