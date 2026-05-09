import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText, MessageSquare, TrendingUp, CheckCircle2, ArrowUpRight, Trash2,
} from "lucide-react";
import BackgroundFX from "@/components/BackgroundFX";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import LegalRadar from "@/components/LegalRadar";
import { useAuth, loadConversations, saveConversations } from "@/lib/auth";

type Status = "Résolu" | "En cours" | "Urgent";
type Row = {
  id: string;
  date: string;
  domain: string;
  summary: string;
  status: Status;
};

const DEMO: Row[] = [
  { id: "1", date: "2026-05-08", domain: "Travail",       summary: "Licenciement sans préavis, demande d'indemnité.", status: "En cours" },
  { id: "2", date: "2026-05-05", domain: "Logement",      summary: "Augmentation de loyer abusive contestée.",        status: "Résolu" },
  { id: "3", date: "2026-05-02", domain: "Famille",       summary: "Procédure de divorce — pension alimentaire.",     status: "En cours" },
  { id: "4", date: "2026-04-28", domain: "Contrats",      summary: "Rupture contrat freelance non respecté.",         status: "Urgent" },
  { id: "5", date: "2026-04-21", domain: "Consommateur",  summary: "Refus de remboursement smartphone défectueux.",   status: "Résolu" },
];

const DOMAIN_COLORS: Record<string, string> = {
  Travail: "hsl(var(--blue))",
  Logement: "hsl(var(--gold))",
  Famille: "hsl(var(--emerald))",
  Contrats: "hsl(var(--violet))",
  Administratif: "hsl(var(--orange))",
  Consommateur: "hsl(var(--pink))",
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

const StatusBadge = ({ s }: { s: Status }) => {
  const map: Record<Status, string> = {
    "Résolu":   "bg-emerald/15 text-emerald border-emerald/30",
    "En cours": "bg-gold/15 text-gold border-gold/30",
    "Urgent":   "bg-destructive/15 text-destructive border-destructive/40 animate-pulse",
  };
  return <span className={`text-[10px] px-2.5 py-1 rounded-full border ${map[s]}`}>{s}</span>;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [resolved, setResolved] = useState(0);

  useEffect(() => {
    if (!user) return;
    const convs = loadConversations(user.email);
    setRows(
      convs.map((c) => ({
        id: c.id,
        date: c.date.slice(0, 10),
        domain: c.domain || "Autre",
        summary: c.summary,
        status: c.status,
      }))
    );
  }, [user]);

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
    if (user) {
      const convs = loadConversations(user.email).filter((c) => c.id !== id);
      saveConversations(user.email, convs);
    }
  };

  return (
    <div className="min-h-screen text-foreground relative">
      <BackgroundFX />
      <Header />

      <main className="relative z-10 pt-28 pb-28 md:pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 animate-fade-up">
            <div className="text-[11px] uppercase tracking-widest text-gold mb-2">Tableau de bord</div>
            <h1 className="font-display text-4xl md:text-5xl tracking-tight">
              Bonjour. <span className="italic text-muted-foreground">Voici votre situation juridique.</span>
            </h1>
          </div>

          {/* STATS */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            <div className="glass rounded-3xl p-6 animate-fade-up">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Consultations</span>
                <MessageSquare className="h-4 w-4 text-gold" />
              </div>
              <div className="font-display text-4xl mb-2">{rows.length}</div>
              <Sparkline data={[2, 4, 3, 5, 4, 6, 5, 7]} />
            </div>

            <div className="glass rounded-3xl p-6 animate-fade-up" style={{ animationDelay: "60ms" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Lettres générées</span>
                <FileText className="h-4 w-4 text-gold" />
              </div>
              <div className="font-display text-4xl mb-2">{Math.floor(rows.length * 0.6)}</div>
              <div className="text-xs text-muted-foreground">Mises en demeure, recours…</div>
            </div>

            <div className="glass rounded-3xl p-6 animate-fade-up" style={{ animationDelay: "120ms" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Domaine principal</span>
                <TrendingUp className="h-4 w-4 text-gold" />
              </div>
              <div className="mt-3">
                <span
                  className="inline-block px-3 py-1.5 rounded-full text-sm font-semibold"
                  style={{
                    background: `${DOMAIN_COLORS[topDomain] ?? "hsl(var(--gold))"}20`,
                    color: DOMAIN_COLORS[topDomain] ?? "hsl(var(--gold))",
                    border: `1px solid ${DOMAIN_COLORS[topDomain] ?? "hsl(var(--gold))"}40`,
                  }}
                >
                  {topDomain}
                </span>
              </div>
            </div>

            <div className="glass rounded-3xl p-6 flex items-center gap-4 animate-fade-up" style={{ animationDelay: "180ms" }}>
              <ProgressRing value={resolved} />
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Résolues</div>
                <div className="font-display text-3xl">{resolved}%</div>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="glass rounded-3xl overflow-hidden mb-10 animate-fade-up">
            <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
              <h2 className="font-display text-xl">Mes consultations</h2>
              <Link to="/chat" className="text-xs text-gold hover:underline">Nouvelle →</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-widest text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Domaine</th>
                    <th className="px-4 py-3 font-medium">Résumé</th>
                    <th className="px-4 py-3 font-medium">Statut</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
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
                            background: `${DOMAIN_COLORS[r.domain] ?? "hsl(var(--gold))"}20`,
                            color: DOMAIN_COLORS[r.domain] ?? "hsl(var(--gold))",
                          }}
                        >
                          {r.domain}
                        </span>
                      </td>
                      <td className="px-4 py-4 max-w-md truncate">{r.summary}</td>
                      <td className="px-4 py-4"><StatusBadge s={r.status} /></td>
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <Link to="/chat" className="haptic-tap inline-flex items-center gap-1 text-xs text-gold hover:underline mr-3">
                          Reprendre <ArrowUpRight className="h-3 w-3" />
                        </Link>
                        <button
                          onClick={() => remove(r.id)}
                          className="haptic-tap text-muted-foreground hover:text-destructive transition-colors"
                          aria-label="Supprimer"
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
            <h2 className="font-display text-xl mb-6">Domaines fréquents</h2>
            <div className="space-y-4">
              {domainCounts.map((d, i) => (
                <div key={d.name} className="flex items-center gap-4">
                  <div className="w-32 text-sm text-muted-foreground">{d.name}</div>
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
            <div className="text-[11px] uppercase tracking-widest text-gold mb-1">Radar Juridique</div>
            <h2 className="font-display text-xl mb-6">Vos domaines juridiques actifs</h2>
            <LegalRadar counts={radarCounts} />
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
};

export default Dashboard;
