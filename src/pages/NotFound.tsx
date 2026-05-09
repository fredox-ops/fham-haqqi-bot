import { Link } from "react-router-dom";
import BackgroundFX from "@/components/BackgroundFX";
import { useT } from "@/lib/i18n";

const NotFound = () => {
  const t = useT();
  return (
  <div className="min-h-screen relative flex items-center justify-center px-6">
    <BackgroundFX />
    <div className="absolute inset-0 zellige-overlay opacity-[0.04] pointer-events-none" />
    <div className="relative text-center animate-fade-up">
      <div className="font-arabic text-gradient-gold text-7xl md:text-9xl mb-4" lang="ar" dir="rtl">
        حق غير موجود
      </div>
      <h1 className="font-display text-3xl md:text-4xl mb-3">{t("Cette page n'existe pas.")}</h1>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        {t("Le droit que vous cherchez s'est perdu en chemin. Revenons à l'accueil.")}
      </p>
      <Link
        to="/"
        className="haptic-tap inline-flex items-center justify-center h-12 px-7 rounded-full bg-gradient-gold text-primary-foreground font-semibold shadow-gold hover:scale-105 transition-all"
      >
        {t("Retour à l'accueil")}
      </Link>
    </div>
  </div>
  );
};

export default NotFound;
