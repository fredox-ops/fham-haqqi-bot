import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Scale, Loader2, ArrowRight, Check } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import BackgroundFX from "@/components/BackgroundFX";
import { useAuth } from "@/lib/auth";
import { Field } from "./Login";

const schema = z.object({
  firstName: z.string().trim().min(2, { message: "Prénom trop court" }).max(50),
  email: z.string().trim().email({ message: "Email invalide" }).max(255),
  password: z.string().min(6, { message: "6 caractères minimum" }).max(128),
});

const scorePassword = (pw: string) => {
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4); // 0..4
};

const Register = () => {
  const nav = useNavigate();
  const { register } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const strength = useMemo(() => scorePassword(password), [password]);
  const strengthMeta = [
    { label: "Très faible", color: "hsl(var(--destructive))" },
    { label: "Faible",      color: "hsl(var(--destructive))" },
    { label: "Moyen",       color: "hsl(var(--orange))" },
    { label: "Bon",         color: "hsl(var(--gold))" },
    { label: "Excellent",   color: "hsl(var(--emerald))" },
  ][strength];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error("Les mots de passe ne correspondent pas."); return; }
    const parsed = schema.safeParse({ firstName, email, password });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
    try {
      const { needsConfirmation } = await register(parsed.data.firstName, parsed.data.email, parsed.data.password);
      if (needsConfirmation) {
        toast.success("Compte créé. Vérifiez votre email pour confirmer.");
        setTimeout(() => nav("/login", { replace: true }), 1500);
        return;
      }
      setSuccess(true);
      setTimeout(() => nav("/chat", { replace: true }), 1100);
    } catch (err: any) {
      toast.error(err?.message ?? "Inscription impossible.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10 relative">
      <BackgroundFX />
      <div
        className="relative w-full max-w-[480px] glass rounded-3xl p-8 md:p-10 overflow-hidden border border-gold/30"
        style={{ boxShadow: "0 30px 80px -20px hsl(42 78% 60% / 0.35)", animation: "spring-in 0.6s cubic-bezier(0.34,1.56,0.64,1)" }}
      >
        <Link to="/" className="inline-flex items-center gap-2.5 mb-7">
          <span className="h-9 w-9 rounded-2xl bg-gradient-gold flex items-center justify-center">
            <Scale className="h-4 w-4 text-primary-foreground" />
          </span>
          <span className="font-display text-2xl">
            Darja<span className="text-gradient-gold italic">Lex</span>
          </span>
        </Link>

        {success ? (
          <div className="py-10 text-center">
            <div
              className="mx-auto h-20 w-20 rounded-full bg-emerald flex items-center justify-center text-emerald-foreground"
              style={{ animation: "spring-in 0.5s cubic-bezier(0.34,1.56,0.64,1)" }}
            >
              <Check className="h-10 w-10" strokeWidth={3} />
            </div>
            <h2 className="font-display text-3xl mt-5">Compte créé.</h2>
            <p className="text-muted-foreground text-sm mt-2">Redirection vers votre espace…</p>
          </div>
        ) : (
          <>
            <h1 className="font-display text-4xl mb-1.5">Créer un compte.</h1>
            <p className="text-muted-foreground text-sm mb-7">Vos consultations seront sauvegardées en privé.</p>

            <form onSubmit={submit} className="space-y-4">
              <Field label="Prénom" value={firstName} onChange={setFirstName} placeholder="Yasmine" autoComplete="given-name" />
              <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="vous@exemple.ma" autoComplete="email" />
              <Field label="Mot de passe" type="password" value={password} onChange={setPassword} placeholder="••••••••" autoComplete="new-password">
                {password && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden flex gap-0.5">
                      {[0,1,2,3].map((i) => (
                        <div
                          key={i}
                          className="flex-1 transition-all"
                          style={{ background: i < strength ? strengthMeta.color : "hsl(var(--muted))" }}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] uppercase tracking-widest" style={{ color: strengthMeta.color }}>
                      {strengthMeta.label}
                    </span>
                  </div>
                )}
              </Field>
              <Field label="Confirmer le mot de passe" type="password" value={confirm} onChange={setConfirm} placeholder="••••••••" autoComplete="new-password" />

              <button
                type="submit"
                disabled={loading}
                className="haptic-tap w-full h-12 rounded-full bg-gradient-gold text-primary-foreground font-semibold shadow-gold inline-flex items-center justify-center gap-2 disabled:opacity-60 hover:scale-[1.01] transition-transform"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer mon compte"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <Link to="/login" className="text-gold hover:underline inline-flex items-center gap-1">
                Déjà un compte ? Se connecter <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;