import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ArabicPatternBg from "./ArabicPatternBg";

interface HeroProps {
  onOpenChat: () => void;
}

const Hero = ({ onOpenChat }: HeroProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      <ArabicPatternBg />

      <div className="relative z-10 container mx-auto px-6 py-24 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 mb-8 animate-fade-in">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            Basé sur le <span className="text-foreground font-medium">Code Juridique Marocain 2025</span>
          </span>
        </div>

        {/* Arabic title */}
        <h2
          className="text-5xl md:text-7xl text-gradient-gold mb-4 animate-fade-in"
          style={{ animationDelay: "0.1s", fontWeight: 700, direction: "rtl" }}
          lang="ar"
        >
          فهم حقوقك
        </h2>

        {/* Main heading */}
        <h1
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <span className="text-foreground">Fham </span>
          <span className="text-gradient-mixed">Hqoqek</span>
        </h1>

        <p
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in"
          style={{ animationDelay: "0.3s" }}
        >
          DarjaLex est votre assistant juridique IA. Posez vos questions en{" "}
          <span className="text-secondary font-medium">darija</span>,{" "}
          <span className="text-primary font-medium">français</span> ou arabe et comprenez vos droits en
          quelques secondes.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in"
          style={{ animationDelay: "0.4s" }}
        >
          <Button
            size="lg"
            onClick={onOpenChat}
            className="bg-gradient-gold text-primary-foreground hover:opacity-95 hover:scale-[1.03] shadow-gold transition-all duration-300 px-8 h-14 text-base font-semibold rounded-2xl group"
          >
            Poser une question
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="glass border-glass-border text-foreground hover:bg-muted/40 h-14 px-8 rounded-2xl"
            onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
          >
            Découvrir les domaines
          </Button>
        </div>

        {/* Trust row */}
        <div
          className="mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm text-muted-foreground animate-fade-in"
          style={{ animationDelay: "0.6s" }}
        >
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
            <span>Disponible 24/7</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span>Confidentiel & sécurisé</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
            <span>Bilingue FR / Darija</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;