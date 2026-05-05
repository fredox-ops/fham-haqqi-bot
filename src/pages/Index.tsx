import { useState } from "react";
import { Scale } from "lucide-react";
import Hero from "@/components/Hero";
import FeatureCards from "@/components/FeatureCards";
import ChatWidget from "@/components/ChatWidget";

const Index = () => {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-40">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 animate-fade-in">
            <div className="h-9 w-9 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
              <Scale className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Darja<span className="text-gradient-gold">Lex</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground animate-fade-in">
            <a href="#features" className="hover:text-foreground transition-colors">Domaines</a>
            <button onClick={() => setChatOpen(true)} className="hover:text-foreground transition-colors">
              Assistant
            </button>
            <span className="text-xs px-3 py-1 rounded-full glass">Code 2025</span>
          </nav>
        </div>
      </header>

      <main>
        <Hero onOpenChat={() => setChatOpen(true)} />
        <FeatureCards />
      </main>

      <footer className="border-t border-border/50 py-10 px-6 text-center text-sm text-muted-foreground">
        <p>
          © 2026 DarjaLex — Information juridique générale fondée sur le droit marocain.
          Ne remplace pas un avocat.
        </p>
      </footer>

      <ChatWidget open={chatOpen} onOpenChange={setChatOpen} />
    </div>
  );
};

export default Index;
