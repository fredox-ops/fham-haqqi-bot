import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Scale, Loader2, ArrowRight, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import BackgroundFX from "@/components/BackgroundFX";
import { useAuth } from "@/lib/auth";
import { useT } from "@/lib/i18n";
import LangToggle from "@/components/LangToggle";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  email: z.string().trim().email({ message: "Email invalide" }).max(255),
  password: z.string().min(6, { message: "6 caractères minimum" }).max(128),
});

const ZelligeCorner = () => (
  <svg
    viewBox="0 0 120 120"
    className="absolute top-0 right-0 w-32 h-32 text-gold/30 pointer-events-none"
    fill="none" stroke="currentColor" strokeWidth="0.7"
  >
    <polygon points="80,8 96,32 124,32 102,52 112,84 80,68 48,84 58,52 36,32 64,32" />
    <circle cx="80" cy="40" r="22" />
    <polygon points="80,22 94,40 80,58 66,40" />
  </svg>
);

const Login = () => {
  const nav = useNavigate();
  const { login } = useAuth();
  const t = useT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
    try {
      await login(parsed.data.email, parsed.data.password);
      toast.success(t("Bienvenue."));
      nav("/chat", { replace: true });
    } catch (err: any) {
      toast.error(err?.message ?? "Connexion impossible.");
    } finally { setLoading(false); }
  };

  const sendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = z.string().trim().email().safeParse(forgotEmail);
    if (!parsed.success) { toast.error("Email invalide"); return; }
    setForgotLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Un lien de réinitialisation a été envoyé.");
      setForgotMode(false);
    } catch (err: any) {
      toast.error(err?.message ?? "Échec de l'envoi.");
    } finally { setForgotLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 relative">
      <BackgroundFX />
      <div className="absolute top-4 right-4 z-20"><LangToggle /></div>
      <Link
        to="/"
        className="absolute top-4 left-4 z-20 inline-flex items-center gap-1.5 h-10 px-4 rounded-full bg-background/60 backdrop-blur border border-border hover:border-gold text-sm text-muted-foreground hover:text-foreground transition-all"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("Accueil")}
      </Link>
      <div
        className="relative w-full max-w-[480px] glass rounded-3xl p-8 md:p-10 overflow-hidden border border-gold/30"
        style={{ boxShadow: "0 30px 80px -20px hsl(42 78% 60% / 0.35), inset 0 1px 0 hsl(0 0% 100% / 0.05)", animation: "spring-in 0.6s cubic-bezier(0.34,1.56,0.64,1)" }}
      >
        <ZelligeCorner />

        <Link to="/" className="relative z-10 inline-flex items-center gap-2.5 mb-8">
          <span className="h-9 w-9 rounded-2xl bg-gradient-gold flex items-center justify-center">
            <Scale className="h-4 w-4 text-primary-foreground" />
          </span>
          <span className="font-display text-2xl">
            Miz<span className="text-gradient-gold italic">ani</span>
          </span>
        </Link>

        {!forgotMode ? (
          <>
            <h1 className="relative z-10 font-display text-4xl mb-1.5">{t("Bon retour.")}</h1>
            <p className="relative z-10 text-muted-foreground text-sm mb-7">{t("Vos droits vous attendent.")}</p>

            <form onSubmit={submit} className="relative z-10 space-y-4">
              <Field label={t("Email")} type="email" value={email} onChange={setEmail} placeholder="vous@exemple.ma" autoComplete="email" />
              <Field
                label={t("Mot de passe")}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                autoComplete="current-password"
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setForgotMode(true)}
                  className="text-xs text-gold hover:underline"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="haptic-tap w-full h-12 rounded-full bg-gradient-gold text-primary-foreground font-semibold shadow-gold inline-flex items-center justify-center gap-2 disabled:opacity-60 hover:scale-[1.01] transition-transform"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("Se connecter")}
              </button>
            </form>

            <div className="relative z-10 mt-6 text-center text-sm">
              <Link to="/register" className="text-gold hover:underline inline-flex items-center gap-1">
                {t("Pas encore de compte ? S'inscrire")} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="relative z-10 font-display text-3xl mb-1.5">Réinitialiser le mot de passe</h1>
            <p className="relative z-10 text-muted-foreground text-sm mb-7">Entrez votre email pour recevoir un lien.</p>

            <form onSubmit={sendReset} className="relative z-10 space-y-4">
              <Field label={t("Email")} type="email" value={forgotEmail} onChange={setForgotEmail} placeholder="vous@exemple.ma" autoComplete="email" />
              <button
                type="submit"
                disabled={forgotLoading}
                className="haptic-tap w-full h-12 rounded-full bg-gradient-gold text-primary-foreground font-semibold shadow-gold inline-flex items-center justify-center gap-2 disabled:opacity-60 hover:scale-[1.01] transition-transform"
              >
                {forgotLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Envoyer le lien"}
              </button>
              <button
                type="button"
                onClick={() => setForgotMode(false)}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Retour à la connexion
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
};

export const Field = ({
  label, type = "text", value, onChange, placeholder, autoComplete, children, rightElement,
}: {
  label: string; type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; autoComplete?: string; children?: React.ReactNode; rightElement?: React.ReactNode;
}) => (
  <label className="block relative">
    <span className="block text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5">{label}</span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      className="w-full h-12 px-4 pr-10 rounded-2xl bg-input/80 border border-border focus:border-gold focus:bg-input outline-none text-sm transition-colors placeholder:text-muted-foreground/60"
    />
    {rightElement}
    {children}
  </label>
);

export default Login;
