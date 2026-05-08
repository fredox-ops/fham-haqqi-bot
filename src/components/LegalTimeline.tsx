import { Check, Circle, Clock } from "lucide-react";

export type TimelineStep = {
  label: string;
  state: "done" | "active" | "todo";
};

const LegalTimeline = ({ steps }: { steps: TimelineStep[] }) => (
  <div className="glass rounded-3xl p-4 w-full">
    <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3">Votre parcours</div>
    <ol className="relative pl-5">
      <span className="absolute left-[7px] top-1 bottom-1 w-px bg-border" />
      {steps.map((s, i) => {
        const Icon = s.state === "done" ? Check : s.state === "active" ? Clock : Circle;
        const color =
          s.state === "done" ? "hsl(var(--electric-blue))" :
          s.state === "active" ? "hsl(var(--gold))" : "hsl(var(--muted-foreground))";
        return (
          <li key={i} className="relative pb-3 last:pb-0">
            <span
              className="absolute -left-[14px] top-0.5 h-4 w-4 rounded-full flex items-center justify-center"
              style={{
                background: s.state === "active" ? "hsl(var(--gold)/0.15)" : "hsl(var(--muted)/0.6)",
                boxShadow: s.state === "active" ? "0 0 12px hsl(var(--gold)/0.6)" : undefined,
              }}
            >
              <Icon className="h-2.5 w-2.5" style={{ color }} />
            </span>
            <div
              className="text-xs"
              style={{ color: s.state === "todo" ? "hsl(var(--muted-foreground))" : "hsl(var(--foreground))" }}
            >
              {s.label}
            </div>
          </li>
        );
      })}
    </ol>
  </div>
);

export default LegalTimeline;