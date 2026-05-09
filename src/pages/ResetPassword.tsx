import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Scale, Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import BackgroundFX from "@/components/BackgroundFX";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
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

const ResetPassword = () => {
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setValid(true);
    } else {
      toast.error("Lien de récupération invalide ou expiré.");
    }
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ password });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
      if (error) throw error;
      toast.success("Mot de passe mis à jour.");
      nav("/login", { replace: true });
    } catch (err: any) {
      toast.error(err?.message ?? "Échec de la réinitialisation.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 relative">
      <BackgroundFX />
      <Link
        to="/login"
        className="absolute top-4 left-4 z-20 inline-flex items-center gap-1.5 h-10 px-4 rounded-full bg-background/60 backdrop-blur border border-border hover:border-gold text-sm text-muted-foreground hover:text-foreground transition-all"
      >
        <ArrowLeft className="h-4 w-4" />
        Connexion
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

        <h1 className="relative z-10 font-display text-3xl mb-1.5">Nouveau mot de passe</h1>
        <p className="relative z-10 text-muted-foreground text-sm mb-7">Choisissez un nouveau mot de passe sécurisé.</p>

        {valid ? (
          <form onSubmit={submit} className="relative z-10 space-y-4">
            <label className="block relative">
              <span className="block text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5">Mot de passe</span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full h-12 px-4 pr-10 rounded-2xl bg-input/80 border border-border focus:border-gold focus:bg-input outline-none text-sm transition-colors placeholder:text-muted-foreground/60"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="haptic-tap w-full h-12 rounded-full bg-gradient-gold text-primary-foreground font-semibold shadow-gold inline-flex items-center justify-center gap-2 disabled:opacity-60 hover:scale-[1.01] transition-transform"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mettre à jour"}
            </button>
          </form>
        ) : (
          <div className="relative z-10 text-sm text-muted-foreground">
            Ce lien n'est pas valide. <Link to="/login" className="text-gold hover:underline">Retour à la connexion</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
