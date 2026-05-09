import { BookOpen } from "lucide-react";

interface Props {
  code: string;
  article: string;
  title: string;
  excerpt: string;
}

const ArticleCard = ({ code, article, title, excerpt }: Props) => (
  <div className="paper rounded-2xl p-7 relative overflow-hidden">
    <div className="flex items-start justify-between mb-4 relative z-10">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-[hsl(var(--ink)/0.8)]">
        <BookOpen className="h-3.5 w-3.5" />
        <span>{code}</span>
      </div>
      <span className="font-justice text-xs text-[hsl(var(--ink)/0.55)]">Art. {article}</span>
    </div>
    <h4 className="font-display text-xl mb-2 relative z-10 text-[hsl(var(--ink))]">{title}</h4>
    <p className="text-sm text-[hsl(var(--ink)/0.65)] leading-relaxed relative z-10 italic">
      « {excerpt} »
    </p>
    <div
      aria-hidden
      className="absolute -right-8 -bottom-8 text-[8rem] font-arabic text-gold/10 leading-none select-none"
      lang="ar"
    >
      حق
    </div>
  </div>
);

export default ArticleCard;