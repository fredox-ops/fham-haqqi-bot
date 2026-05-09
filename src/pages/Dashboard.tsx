import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText, MessageSquare, TrendingUp, CheckCircle2, ArrowUpRight, Trash2,
} from "lucide-react";
import BackgroundFX from "@/components/BackgroundFX";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import LegalRadar from "@/components/LegalRadar";
import { useAuth, fetchConversations, deleteConversation } from "@/lib/auth";
import { useT } from "@/lib/i18n";

type Status = "Résolu" | "En cours" | "Urgent";
type Urgency = "low" | "medium" | "high";
type Row = {
  id: string;
  date: string;
  domain: string;
  summary: string;
  status: Status;
  title?: string | null;
  tags?: string[];
  urgency?: Urgency;
};

const DEMO: Row[] = [
  { id: "1", date: "2026-05-08", domain: "Travail",       summary: "Licenciement sans préavis, demande d'indemnité.", status: "En cours" },
  { id: "2", date: "2026-05-05", domain: "Logement",      summary: "Augmentation de loyer abusive contestée.",        status: "Résolu" },
  { id: "3", date: "2026-05-02", domain: "Famille",       summary: "Procédure de divorce — pension alimentaire.",     status: "En cours" },
  { id: "4", date: "2026-04-28", domain: "Contrats",      summary: "Rupture contrat freelance non respecté.",         status: "Urgent" },
  { id: "5", date: "2026-04-21", domain: "Consommateur",  summary: "Refus de remboursement smartphone défectueux.",   status: "Résolu" },
];

const DOMAIN_COLORS: Record<string, string> = {
  Travail: "var(--blue)",
  Logement: "var(--gold)",
  Famille: "var(--emerald)",
  Contrats: "var(--violet)",
  Administratif: "var(--orange)",
  Consommation: "var(--pink)",
  Consommateur: "var(--pink)",
  Pénal: "var(--destructive)",
  Commercial: "var(--blue)",
  Fiscal: "var(--gold)",
  Autre: "var(--muted-foreground)",
};
const domainColor = (name: string, alpha = 1) => {
  const v = DOMAIN_COLORS[name] ?? "var(--gold)";
  return alpha >= 1 ? `hsl(${v})` : `hsl(${v} / ${alpha})`;
};

const ALL_DOMAINS = ["Travail","Famille","Logement","Contrats","Administratif","Pénal","Consommation","Commercial","Fiscal","Autre"];

const URGENCY_STYLES: Record<Urgency, string> = {
  low: "bg-emerald/15 text-emerald border-emerald/30",
  medium: "bg-gold/15 text-gold border-gold/30",
  high: "bg-destructive/15 text-destructive border-destructive/40 animate-pulse",
};

const Sparkline = ({ data }: { data: number[] }) => {
  const max = Math.max(...data, 1);
  const points = data
    .map((d, i) => `${(i / (data.length - 1)) * 100},${30 - (d / max) * 28}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 30" className="w-full h-8" preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke="hsl(var(--gold))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const ProgressRing = ({ value }: { value: number }) => {
  const r = 28;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 70 70" className="w-16 h-16 -rotate-90">
      <circle cx="35" cy="35" r={r} stroke="hsl(var(--border))" strokeWidth="5" fill="none" />
      <circle
        cx="35" cy="35" r={r}
        stroke="hsl(var(--gold))" strokeWidth="5" fill="none"
        strokeDasharray={c} strokeDashoffset={c - (c * value) / 100}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1.2s ease" }}
      />
    </svg>
  );
};

const StatusBadge = ({ s, t }: { s: Status; t: (s: string) => string }) => {
  const map: Record<Status, string> = {
    "Résolu":   "bg-emerald/15 text-emerald border-emerald/30",
    "En cours": "bg-gold/15 text-gold border-gold/30",
    "Urgent":   "bg-destructive/15 text-destructive border-destructive/40 animate-pulse",
  };
  return <span className={`text-[10px] px-2.5 py-1 rounded-full border ${map[s]}`}>{t(s)}</span>;
};

const Dashboard = () => {
  const { user } = useAuth();
  const t = useT();
  const [rows, setRows] = useState<Row[]>([]);
  const [resolved, setResolved] = useState(0);
  const [domainFilter, setDomainFilter] = useState<string>("all");

  useEffect(() => {
    if (!user) return;
    fetchConversations().then((convs) => {
      setRows(
        convs.map((c) => ({
          id: c.id,
          date: c.date.slice(0, 10),
          domain: c.domain || "Autre",
          summary: c.summary,
          status: c.status,
          title: c.title,
          tags: c.tags,
          urgency: c.urgency,
        }))
      );
    });
  }, [user]);

  const filteredRows = useMemo(
    () => (domainFilter === "all" ? rows : rows.filter((r) => r.domain === domainFilter)),
    [rows, domainFilter]
  );

  useEffect(() => {
    if (!rows.length) { setResolved(0); return; }
    const r = (rows.filter((x) => x.status === "Résolu").length / rows.length) * 100;
    const t = setTimeout(() => setResolved(Math.round(r)), 200);
    return () => clearTimeout(t);
  }, [rows]);

  const topDomain = useMemo(() => {
    const counts: Record<string, number> = {};
    rows.forEach((r) => (counts[r.domain] = (counts[r.domain] || 0) + 1));
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  }, [rows]);

  const domainCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    rows.forEach((r) => (counts[r.domain] = (counts[r.domain] || 0) + 1));
    const max = Math.max(...Object.values(counts), 1);
    return Object.entries(counts).map(([k, v]) => ({ name: k, value: v, pct: (v / max) * 100 }));
  }, [rows]);

  const radarCounts = useMemo(() => {
    const c: Record<string, number> = {};
    rows.forEach((r) => (c[r.domain] = (c[r.domain] || 0) + 1));
    return c;
  }, [rows]);

  const remove = (id: string) => {
    setRows((p) => p.filter((r) => r.id !== id));
    deleteConversation(id);
  };

  return (
    <div className="min-h-screen text-foreground relative">
      <BackgroundFX />
      <Header />

      <main className="relative z-10 pt-28 pb-28 md:pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 animate-fade-up">
            <div className="text-[11px] uppercase tracking-widest text-gold mb-2">{t("Tableau de bord")}</div>
            <h1 className="font-display text-4xl md:text-5xl tracking-tight">
              {t("Bonjour.")} <span className="italic text-muted-foreground">{t("Voici votre situation juridique.")}</span>
            </h1>
          </div>

          {/* STATS */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            <div className="glass rounded-3xl p-6 animate-fade-up">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">{t("Consultations")}</span>
                <MessageSquare className="h-4 w-4 text-gold" />
              </div>
              <div className="font-display text-4xl mb-2">{rows.length}</div>
              <Sparkline data={[2, 4, 3, 5, 4, 6, 5, 7]} />
            </div>

            <div className="glass rounded-3xl p-6 animate-fade-up" style={{ animationDelay: "60ms" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">{t("Lettres générées")}</span>
                <FileText className="h-4 w-4 text-gold" />
              </div>
              <div className="font-display text-4xl mb-2">{Math.floor(rows.length * 0.6)}</div>
              <div className="text-xs text-muted-foreground">{t("Mises en demeure, recours…")}</div>
            </div>

            <div className="glass rounded-3xl p-6 animate-fade-up" style={{ animationDelay: "120ms" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">{t("Domaine principal")}</span>
                <TrendingUp className="h-4 w-4 text-gold" />
              </div>
              <div className="mt-3">
                <span
                  className="inline-block px-3 py-1.5 rounded-full text-sm font-semibold"
                  style={{
                    background: domainColor(topDomain, 0.12),
                    color: domainColor(topDomain),
                    border: `1px solid ${domainColor(topDomain, 0.25)}`,
                  }}
                >
                  {t(topDomain)}
                </span>
              </div>
            </div>

            <div className="glass rounded-3xl p-6 flex items-center gap-4 animate-fade-up" style={{ animationDelay: "180ms" }}>
              <ProgressRing value={resolved} />
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{t("Résolues")}</div>
                <div className="font-display text-3xl">{resolved}%</div>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="glass rounded-3xl overflow-hidden mb-10 animate-fade-up">
            <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between flex-wrap gap-3">
              <h2 className="font-display text-xl">{t("Mes consultations")}</h2>
              <Link to="/chat" className="text-xs text-gold hover:underline">{t("Nouvelle →")}</Link>
            </div>
            <div className="px-6 py-3 border-b border-border/40 flex flex-wrap gap-2">
              <button
                onClick={() => setDomainFilter("all")}
                className={`text-[11px] px-3 py-1.5 rounded-full border transition ${domainFilter === "all" ? "bg-gold/15 text-gold border-gold/40" : "border-border/50 text-muted-foreground hover:text-foreground"}`}
              >
                {t("Tous")} ({rows.length})
              </button>
              {ALL_DOMAINS.map((d) => {
                const count = rows.filter((r) => r.domain === d).length;
                if (count === 0) return null;
                const active = domainFilter === d;
                return (
                  <button
                    key={d}
                    onClick={() => setDomainFilter(d)}
                    className={`text-[11px] px-3 py-1.5 rounded-full border transition ${active ? "border-transparent" : "border-border/50 hover:text-foreground"}`}
                    style={active ? {
                      background: domainColor(d, 0.12),
                      color: domainColor(d),
                      borderColor: domainColor(d, 0.4),
                    } : undefined}
                  >
                    {t(d)} ({count})
                  </button>
                );
              })}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-widest text-muted-foreground">
                    <th className="px-6 py-3 font-medium">{t("Date")}</th>
                    <th className="px-4 py-3 font-medium">{t("Domaine")}</th>
                    <th className="px-4 py-3 font-medium">{t("Sujet")}</th>
                    <th className="px-4 py-3 font-medium">{t("Urgence")}</th>
                    <th className="px-4 py-3 font-medium">{t("Statut")}</th>
                    <th className="px-4 py-3 font-medium text-right">{t("Actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((r) => (
                    <tr
                      key={r.id}
                      className="border-t border-border/40 group hover:bg-muted/20 transition-colors relative"
                    >
                      <td className="px-6 py-4 text-muted-foreground tabular-nums whitespace-nowrap relative">
                        <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-gradient-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                        {r.date}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                          style={{
                            background: domainColor(r.domain, 0.12),
                            color: domainColor(r.domain),
                          }}
                        >
                          {t(r.domain)}
                        </span>
                      </td>
                      <td className="px-4 py-4 max-w-md">
                        <div className="truncate font-medium">{r.title || r.summary}</div>
                        {r.tags && r.tags.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {r.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {r.urgency && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${URGENCY_STYLES[r.urgency]}`}>
                            {t(r.urgency)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4"><StatusBadge s={r.status} t={t} /></td>
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <Link to="/chat" className="haptic-tap inline-flex items-center gap-1 text-xs text-gold hover:underline mr-3">
                          {t("Reprendre")} <ArrowUpRight className="h-3 w-3" />
                        </Link>
                        <button
                          onClick={() => remove(r.id)}
                          className="haptic-tap text-muted-foreground hover:text-destructive transition-colors"
                          aria-label={t("Supprimer")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* BAR CHART */}
          <div className="glass rounded-3xl p-6 animate-fade-up">
            <h2 className="font-display text-xl mb-6">{t("Domaines fréquents")}</h2>
            <div className="space-y-4">
              {domainCounts.map((d, i) => (
                <div key={d.name} className="flex items-center gap-4">
                  <div className="w-32 text-sm text-muted-foreground">{t(d.name)}</div>
                  <div className="flex-1 h-3 rounded-full bg-muted/40 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${d.pct}%`,
                        background: `linear-gradient(90deg, ${DOMAIN_COLORS[d.name]}, ${DOMAIN_COLORS[d.name]}70)`,
                        animation: `bar-fill 1.2s cubic-bezier(0.22,1,0.36,1) ${i * 100}ms both`,
                      }}
                    />
                  </div>
                  <div className="w-8 text-right tabular-nums text-sm">{d.value}</div>
                </div>
              ))}
            </div>
            <style>{`@keyframes bar-fill { from { width: 0%; } }`}</style>
          </div>

          {/* LEGAL RADAR */}
          <div className="glass rounded-3xl p-6 mt-10 animate-fade-up">
            <div className="text-[11px] uppercase tracking-widest text-gold mb-1">{t("Radar Juridique")}</div>
            <h2 className="font-display text-xl mb-6">{t("Vos domaines juridiques actifs")}</h2>
            <LegalRadar counts={radarCounts} />
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
};

export default Dashboard;
