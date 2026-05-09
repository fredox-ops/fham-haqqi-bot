import { useEffect, useMemo, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import {
  X, Copy, Download, Mail, Stamp, FileText, Loader2, Check, Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

type Msg = { role: "user" | "assistant"; content: string };
type Lang = "fr" | "ar";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  conversation: Msg[];
  category?: string | null;
}

interface LetterFields {
  senderName: string;
  senderAddress: string;
  recipient: string;
  subject: string;
  body: string;
  city: string;
  date: string;
}

const DEFAULTS_FR: LetterFields = {
  senderName: "",
  senderAddress: "",
  recipient: "",
  subject: "",
  body: "",
  city: "Casablanca",
  date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
};

function autofillFromConversation(messages: Msg[]): Partial<LetterFields> {
  const userText = messages.filter((m) => m.role === "user").map((m) => m.content).join("\n");
  const lower = userText.toLowerCase();

  let recipient = "À qui de droit";
  if (/employeur|patron|société|entreprise|khdma/i.test(lower)) recipient = "Monsieur le Directeur des Ressources Humaines";
  else if (/propriétaire|bailleur|loyer|kira/i.test(lower)) recipient = "Monsieur/Madame le Propriétaire";
  else if (/tribunal|juge|procureur/i.test(lower)) recipient = "Monsieur le Procureur du Roi";
  else if (/commune|municipalit|administration/i.test(lower)) recipient = "Monsieur le Président de la Commune";

  let subject = "";
  if (/licenci/i.test(lower)) subject = "Contestation de licenciement";
  else if (/heures suppl|salaire|paie/i.test(lower)) subject = "Réclamation relative au paiement des salaires";
  else if (/loyer.*augment|augment.*loyer/i.test(lower)) subject = "Contestation de l'augmentation de loyer";
  else if (/caution/i.test(lower)) subject = "Demande de restitution de la caution";
  else if (/expuls/i.test(lower)) subject = "Réponse à une procédure d'expulsion";
  else if (/résili|resili/i.test(lower)) subject = "Demande de résiliation de contrat";
  else if (/divorce/i.test(lower)) subject = "Demande de divorce";
  else subject = "Demande officielle";

  // Take a clean summary of the user's first message as the body seed
  const first = messages.find((m) => m.role === "user")?.content ?? "";
  const body = first
    ? `J'ai l'honneur de porter à votre connaissance la situation suivante :\n\n${first.trim()}\n\nJe vous prie de bien vouloir prendre en considération ma demande et d'y donner une suite favorable dans les meilleurs délais.`
    : "";

  return { recipient, subject, body };
}

/* ---------- Letter preview ---------- */
const LetterPreview = ({
  fields, lang, stamped,
}: { fields: LetterFields; lang: Lang; stamped: boolean }) => {
  const t = lang === "fr"
    ? {
        kingdom: "Royaume du Maroc",
        ministry: "République — État de Droit",
        from: "De :",
        to: "À :",
        subject: "Objet :",
        opening: "Madame, Monsieur,",
        closing: "Veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.",
        signature: "Signature",
      }
    : {
        kingdom: "المملكة المغربية",
        ministry: "دولة الحق والقانون",
        from: "من :",
        to: "إلى :",
        subject: "الموضوع :",
        opening: "تحية طيبة وبعد،",
        closing: "وتقبلوا فائق الاحترام والتقدير.",
        signature: "التوقيع",
      };

  const isAr = lang === "ar";

  return (
    <div
      className="relative bg-[hsl(40_30%_98%)] text-[hsl(225_50%_12%)] rounded-xl shadow-2xl overflow-hidden font-serif"
      style={{ aspectRatio: "1 / 1.414" }}
      dir={isAr ? "rtl" : "ltr"}
      lang={isAr ? "ar" : "fr"}
    >
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span
          className="text-[hsl(0_0%_50%)]/[0.08] font-bold tracking-widest"
          style={{ fontSize: "clamp(2rem, 8vw, 5rem)", transform: "rotate(-25deg)" }}
        >
          {t.kingdom}
        </span>
      </div>

      {/* Decorative gold corners */}
      <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-[hsl(36_91%_55%)]" />
      <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-[hsl(36_91%_55%)]" />
      <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-[hsl(36_91%_55%)]" />
      <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-[hsl(36_91%_55%)]" />

      {/* Light gray header bar */}
      <div className="relative bg-[#D3D3D3] border-b border-[hsl(0_0%_75%)] px-8 py-3 text-center">
        <div className="text-[hsl(225_30%_25%)] font-bold tracking-[0.25em] text-sm uppercase">
          {t.kingdom}
        </div>
        <div className="text-[hsl(225_30%_45%)] text-[10px] tracking-widest mt-0.5">{t.ministry}</div>
      </div>

      {/* Body */}
      <div className="relative p-8 md:p-10 text-[13px] leading-relaxed h-full">
        {/* Sender / Date */}
        <div className="flex justify-between mb-8">
          <div>
            <div className="font-semibold">{fields.senderName || "—"}</div>
            <div className="text-[11px] whitespace-pre-line text-[hsl(225_50%_30%)]">
              {fields.senderAddress || "—"}
            </div>
          </div>
          <div className="text-[11px] text-right">
            {fields.city}, {fields.date}
          </div>
        </div>

        {/* Recipient */}
        <div className={`mb-6 ${isAr ? "text-left" : "text-right"} text-[12px]`}>
          <div className="font-semibold">{fields.recipient || "—"}</div>
        </div>

        {/* Subject */}
        <div className="mb-6">
          <span className="font-semibold underline decoration-[hsl(36_91%_55%)] decoration-2 underline-offset-4">
            {t.subject}
          </span>{" "}
          <span>{fields.subject || "—"}</span>
        </div>

        {/* Opening */}
        <p className="mb-3 italic">{t.opening}</p>

        {/* Body */}
        <div className="whitespace-pre-line text-justify mb-6 text-[12.5px]">
          {fields.body || "—"}
        </div>

        {/* Closing */}
        <p className="mb-10 italic text-[12px]">{t.closing}</p>

        {/* Signature */}
        <div className={`${isAr ? "text-left" : "text-right"} text-[11px]`}>
          <div className="border-t border-[hsl(225_50%_30%)]/30 inline-block min-w-[180px] pt-1">
            {t.signature}
          </div>
        </div>

        {/* Animated stamp */}
        {stamped && (
          <div
            className="absolute bottom-16 right-12 pointer-events-none"
            style={{
              animation: "stampDrop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both",
            }}
          >
            <div
              className="border-4 border-[hsl(0_70%_45%)] text-[hsl(0_70%_45%)] rounded-full flex flex-col items-center justify-center font-bold uppercase tracking-wider px-4 py-3"
              style={{
                width: "120px", height: "120px", transform: "rotate(-12deg)", opacity: 0.85,
                boxShadow: "inset 0 0 0 2px hsl(0 70% 45% / 0.3)",
              }}
            >
              <span className="text-[10px]">Mizani</span>
              <span className="text-base leading-tight my-0.5">CERTIFIÉ</span>
              <span className="text-[8px]">{fields.date}</span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes stampDrop {
          0% { transform: scale(2.5) rotate(-12deg); opacity: 0; }
          60% { transform: scale(0.9) rotate(-12deg); opacity: 0.95; }
          100% { transform: scale(1) rotate(-12deg); opacity: 0.85; }
        }
      `}</style>
    </div>
  );
};

/* ---------- Plain text & PDF builders ---------- */
function buildPlainText(f: LetterFields, lang: Lang): string {
  if (lang === "ar") {
    return [
      "المملكة المغربية",
      "",
      f.senderName, f.senderAddress, "",
      `${f.city}, ${f.date}`, "",
      `إلى: ${f.recipient}`, "",
      `الموضوع: ${f.subject}`, "",
      "تحية طيبة وبعد،", "",
      f.body, "",
      "وتقبلوا فائق الاحترام والتقدير.", "",
      "التوقيع",
    ].join("\n");
  }
  return [
    "ROYAUME DU MAROC",
    "",
    f.senderName, f.senderAddress, "",
    `${f.city}, le ${f.date}`, "",
    `À : ${f.recipient}`, "",
    `Objet : ${f.subject}`, "",
    "Madame, Monsieur,", "",
    f.body, "",
    "Veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.",
    "",
    "Signature",
  ].join("\n");
}

function downloadPdf(f: LetterFields, lang: Lang) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210;
  const margin = 20;
  const maxW = pageW - margin * 2;

  // Light gray header bar
  doc.setFillColor(211, 211, 211);
  doc.rect(0, 0, pageW, 18, "F");
  doc.setDrawColor(215, 215, 220);
  doc.line(0, 18, pageW, 18);
  doc.setTextColor(60, 65, 80);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(lang === "fr" ? "ROYAUME DU MAROC" : "AL-MAMLAKA AL-MAGHRIBIYA", pageW / 2, 11, { align: "center" });

  // Watermark
  doc.setTextColor(180, 180, 190);
  doc.setFontSize(60);
  doc.setFont("helvetica", "bold");
  const anyDoc = doc as any;
  if (anyDoc.GState && anyDoc.setGState) {
    anyDoc.setGState(new anyDoc.GState({ opacity: 0.08 }));
  }
  doc.text("ROYAUME DU MAROC", pageW / 2, 160, { align: "center", angle: 25 });
  if (anyDoc.GState && anyDoc.setGState) {
    anyDoc.setGState(new anyDoc.GState({ opacity: 1 }));
  }

  doc.setTextColor(20, 20, 30);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  let y = 35;
  // Sender
  doc.setFont("helvetica", "bold");
  doc.text(f.senderName || "—", margin, y); y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  (f.senderAddress || "").split("\n").forEach((line) => { doc.text(line, margin, y); y += 4; });

  // Date right
  doc.setFontSize(10);
  doc.text(`${f.city}, ${lang === "fr" ? "le " : ""}${f.date}`, pageW - margin, 35, { align: "right" });

  y += 10;
  // Recipient
  doc.setFont("helvetica", "bold");
  doc.text(f.recipient || "—", pageW - margin, y, { align: "right" });
  y += 12;

  // Subject
  doc.setFont("helvetica", "bold");
  doc.text(`${lang === "fr" ? "Objet : " : "Mawdu3 : "}${f.subject}`, margin, y);
  y += 12;

  // Opening
  doc.setFont("helvetica", "italic");
  doc.text(lang === "fr" ? "Madame, Monsieur," : "Tahiya tayyiba,", margin, y);
  y += 8;

  // Body
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const bodyLines = doc.splitTextToSize(f.body || "—", maxW);
  doc.text(bodyLines, margin, y);
  y += bodyLines.length * 5 + 8;

  // Closing
  doc.setFont("helvetica", "italic");
  const closing = lang === "fr"
    ? doc.splitTextToSize("Veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.", maxW)
    : doc.splitTextToSize("Wa taqabbalu fa'iqa al-ihtiram wa at-taqdir.", maxW);
  doc.text(closing, margin, y);
  y += closing.length * 5 + 14;

  // Signature
  doc.setFont("helvetica", "normal");
  doc.text(lang === "fr" ? "Signature" : "At-tawqi3", pageW - margin, y, { align: "right" });

  doc.save(`lettre-${f.subject.toLowerCase().replace(/\s+/g, "-").slice(0, 40) || "officielle"}.pdf`);
}

/* ---------- Main component ---------- */
const LetterGenerator = ({ open, onOpenChange, conversation, category }: Props) => {
  const [fields, setFields] = useState<LetterFields>(DEFAULTS_FR);
  const [lang, setLang] = useState<Lang>("fr");
  const [stamped, setStamped] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const lastGenLangRef = useRef<Lang | null>(null);

  const arabicDate = () =>
    new Date().toLocaleDateString("ar-MA", { day: "numeric", month: "long", year: "numeric" });

  const generateWithAI = async (targetLang: Lang) => {
    if (!conversation || conversation.length === 0) return;
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-letter", {
        body: { messages: conversation, lang: targetLang, category: category ?? null },
      });
      if (error) throw error;
      setFields((prev) => ({
        ...prev,
        recipient: data?.recipient || prev.recipient,
        subject: data?.subject || prev.subject,
        body: data?.body || prev.body,
        city: targetLang === "ar" ? "الدار البيضاء" : (prev.city || "Casablanca"),
        date: targetLang === "ar" ? arabicDate() : new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
      }));
      lastGenLangRef.current = targetLang;
    } catch (e) {
      console.error(e);
      toast.error(targetLang === "ar" ? "فشل توليد الرسالة" : "Échec de la génération IA");
    } finally {
      setAiLoading(false);
    }
  };

  // Auto-fill on open
  useEffect(() => {
    if (open) {
      const auto = autofillFromConversation(conversation);
      setFields((prev) => ({ ...prev, ...DEFAULTS_FR, ...auto }));
      setStamped(false);
      lastGenLangRef.current = null;
      // Fire AI generation for current language
      generateWithAI(lang);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Regenerate when language changes while open
  useEffect(() => {
    if (open && lastGenLangRef.current && lastGenLangRef.current !== lang) {
      generateWithAI(lang);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const update = (k: keyof LetterFields, v: string) => setFields((p) => ({ ...p, [k]: v }));

  const finalize = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 700));
    setStamped(true);
    setGenerating(false);
    toast.success(lang === "ar" ? "تم اعتماد الرسالة." : "Lettre certifiée et prête.");
  };

  const onCopy = async () => {
    await navigator.clipboard.writeText(buildPlainText(fields, lang));
    toast.success("Lettre copiée dans le presse-papiers.");
  };

  const onDownload = () => {
    downloadPdf(fields, lang);
    toast.success("PDF téléchargé.");
  };

  const onEmail = () => {
    const subject = encodeURIComponent(fields.subject || "Lettre officielle");
    const body = encodeURIComponent(buildPlainText(fields, lang));
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const previewFields = useMemo(() => fields, [fields]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-6xl w-[95vw] h-[90vh] p-0 glass overflow-hidden flex flex-col gap-0 animate-paper-unfold"
        style={{ transformOrigin: "center center", borderRadius: "1.5rem" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-gold">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Lettre Officielle</h2>
              <p className="text-xs text-muted-foreground">
                {category ? `Catégorie : ${category}` : "Format administratif marocain"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <div className="glass rounded-full p-1 flex text-xs">
              {(["fr", "ar"] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1 rounded-full transition-all ${
                    lang === l
                      ? "bg-gradient-gold text-primary-foreground shadow-gold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l === "fr" ? "Français" : "العربية"}
                </button>
              ))}
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Body: split */}
        <div className="flex-1 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] overflow-hidden">
          {/* LEFT: form */}
          <div className="overflow-y-auto p-6 space-y-4 border-r border-border/50">
            <FieldGroup
              label="Nom complet"
              value={fields.senderName}
              onChange={(v) => update("senderName", v)}
              placeholder="Ex : Hamza El Idrissi"
            />
            <FieldGroup
              label="Adresse complète"
              value={fields.senderAddress}
              onChange={(v) => update("senderAddress", v)}
              placeholder={"Ex : 12, Rue Allal Ben Abdellah\nCasablanca 20000"}
              textarea
              rows={3}
            />
            <div className="grid grid-cols-2 gap-3">
              <FieldGroup label="Ville" value={fields.city} onChange={(v) => update("city", v)} />
              <FieldGroup label="Date" value={fields.date} onChange={(v) => update("date", v)} />
            </div>
            <FieldGroup
              label="Destinataire"
              value={fields.recipient}
              onChange={(v) => update("recipient", v)}
              placeholder="Ex : Monsieur le Directeur..."
              hint="Auto-détecté"
            />
            <FieldGroup
              label="Objet"
              value={fields.subject}
              onChange={(v) => update("subject", v)}
              placeholder="Ex : Contestation de licenciement"
              hint="Auto-détecté"
            />
            <FieldGroup
              label={lang === "ar" ? "نص الرسالة" : "Corps de la lettre"}
              value={fields.body}
              onChange={(v) => update("body", v)}
              textarea
              rows={8}
              hint={aiLoading ? (lang === "ar" ? "جاري التوليد بالذكاء الاصطناعي…" : "Génération IA en cours…") : (lang === "ar" ? "تم توليده بالذكاء الاصطناعي" : "Généré par IA depuis votre conversation")}
            />

            {/* AI regenerate */}
            <Button
              onClick={() => generateWithAI(lang)}
              disabled={aiLoading}
              variant="outline"
              className="w-full h-10 rounded-2xl"
            >
              {aiLoading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {lang === "ar" ? "جاري التوليد…" : "Génération IA…"}</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" /> {lang === "ar" ? "إعادة التوليد بالذكاء الاصطناعي" : "Régénérer avec l'IA"}</>
              )}
            </Button>

            {/* Finalize */}
            <Button
              onClick={finalize}
              disabled={generating || stamped || aiLoading}
              className="w-full h-12 rounded-2xl bg-gradient-gold text-primary-foreground font-semibold shadow-gold hover:scale-[1.02] disabled:opacity-60 transition-all"
            >
              {generating ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {lang === "ar" ? "جاري الاعتماد…" : "Certification…"}</>
              ) : stamped ? (
                <><Check className="h-4 w-4 mr-2" /> {lang === "ar" ? "رسالة معتمدة" : "Lettre certifiée"}</>
              ) : (
                <><Stamp className="h-4 w-4 mr-2" /> {lang === "ar" ? "إنهاء ووضع الختم" : "Finaliser & apposer le tampon"}</>
              )}
            </Button>
          </div>

          {/* RIGHT: preview */}
          <div className="overflow-y-auto p-6 bg-gradient-to-br from-muted/20 to-background">
            <div className="max-w-[560px] mx-auto">
              <LetterPreview fields={previewFields} lang={lang} stamped={stamped} />
            </div>

            {/* Action bar */}
            <div className="max-w-[560px] mx-auto mt-5 grid grid-cols-3 gap-2">
              <ActionBtn icon="📋" label="Copier" onClick={onCopy} ariaIcon={Copy} />
              <ActionBtn icon="📥" label="Télécharger PDF" onClick={onDownload} ariaIcon={Download} primary />
              <ActionBtn icon="✉️" label="Envoyer par Email" onClick={onEmail} ariaIcon={Mail} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* ---------- Subcomponents ---------- */
const FieldGroup = ({
  label, value, onChange, placeholder, textarea, rows, hint,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; textarea?: boolean; rows?: number; hint?: string;
}) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
      {hint && <span className="text-[10px] text-secondary">✦ {hint}</span>}
    </div>
    {textarea ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows ?? 3}
        className="w-full bg-input/50 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all resize-none"
      />
    ) : (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-input/50 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
      />
    )}
  </div>
);

const ActionBtn = ({
  icon, label, onClick, ariaIcon: Icon, primary,
}: { icon: string; label: string; onClick: () => void; ariaIcon: typeof Copy; primary?: boolean }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 p-3 rounded-2xl border transition-all hover:-translate-y-0.5 ${
      primary
        ? "bg-gradient-gold text-primary-foreground border-transparent shadow-gold hover:scale-[1.02]"
        : "glass border-border hover:border-secondary/50 hover:text-secondary"
    }`}
  >
    <span className="text-xl leading-none" aria-hidden>{icon}</span>
    <span className="text-[11px] font-medium flex items-center gap-1">
      <Icon className="h-3 w-3 opacity-70" /> {label}
    </span>
  </button>
);

export default LetterGenerator;