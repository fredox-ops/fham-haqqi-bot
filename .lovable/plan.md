## DarjaLex — Complete Rebuild

A from-scratch rebuild of DarjaLex with an editorial, awards-grade visual identity. Keeps only the existing Claude API edge function (`supabase/functions/chat`) and the Supabase client. Everything else (pages, components, design tokens, fonts) is replaced.

---

### 1. Design system reset

**`index.html`** — load Google Fonts (Cormorant Garamond, DM Sans, Amiri).

**`src/index.css`** — full rewrite:
- Tokens (HSL): `--bg-primary 260 80% 2%`, `--bg-secondary 258 45% 7%`, `--accent-gold 42 78% 60%`, `--accent-blue 230 84% 60%`, `--accent-emerald 162 94% 43%`, `--text-primary 265 100% 98%`, `--text-muted 270 12% 49%`, `--glass`, `--glass-border`.
- Utility classes: `.font-display` (Cormorant), `.font-body` (DM Sans), `.font-arabic` (Amiri), `.glass`, `.grain` (SVG noise data-URI), `.zellige` (3% opacity overlay), `.text-gradient-gold`, `.scrollbar-gold` (thin gold custom scrollbar via `::-webkit-scrollbar`), focus-visible gold ring.
- Keyframes: `mesh-drift`, `float-y`, `fade-up`, `slide-right`, `pulse-dot`, `dash-draw`, `bounce-dot`, `spring-in`, `stream-in`, `bar-fill`, `count-pop`.

**`tailwind.config.ts`** — register fonts (`display`, `body`, `arabic`), color tokens, shadows (`shadow-gold`, `shadow-blue`, `shadow-glass`), keyframes/animations above.

---

### 2. Shared components (`src/components/`)

- `BackgroundFX.tsx` — fixed `-z-10`: 3 radial blobs (gold/blue/purple, `mesh-drift`), zellige SVG overlay 3%, grain texture.
- `Header.tsx` — sticky, blur backdrop, scales logo + "DarjaLex" (Cormorant), centered nav (Domaines / Comment ça marche / À propos), right CTA "Commencer" (gold border → fill on hover). Shrinks on scroll via `useEffect` scroll listener toggling `py-2` vs `py-5`.
- `Footer.tsx` — minimal, legal disclaimer.
- `LoadingScreen.tsx` — black bg, SVG logo with `stroke-dasharray` draw animation.
- `Toast` — reuse existing `sonner`, restyled via `toaster.tsx` to slide-in top-right gold accent.
- `MobileNav.tsx` — bottom pill nav (Accueil / Domaines / Chat / Dashboard).
- `RouteFade.tsx` — wrapper applying `fade-up` on route mount.

---

### 3. Pages

**`src/pages/Index.tsx`** (Landing)
- Header + BackgroundFX.
- Hero: huge `حق` Amiri 600px, 4% opacity, absolute centered. Left 60%: green-dot badge "Agent IA actif — Droit Marocain 2025", staggered H1 ("Comprenez" / "vos droits." / "En darija." gold), subtitle, CTAs ("Consulter l'agent →" gold filled, "Voir une démo ↓" outlined), micro-stats inline. Right 40%: floating glass chat preview card (fake user + assistant snippet citing Article 345), gold glow blur behind, `float-y` loop.
- Stats bar: 4 counters, dark glass strip, animate on intersection.
- Domaines section: 6 glass cards (3×2), each with emoji + colored glow (Travail blue, Logement gold, Famille emerald, Contrats purple, Administratif orange, Consommateur pink), hover lift + "Consulter →", staggered scroll-in.
- Comment ça marche: 4-step horizontal timeline, animated dashed SVG line draws on scroll, gold number badges, icons (Mic / Brain / FileText / Download).

**`src/pages/Chat.tsx`**
- Two-panel layout, full-screen, no body scroll.
- Left sidebar (280px, collapsible via `useState`): logo + green dot, "Nouvelle consultation" gold button, history grouped (Aujourd'hui / Cette semaine / Plus ancien) from `localStorage`, bottom user/settings.
- Main: top bar with category badge + "Effacer". Empty state: pulsing logo, prompt, 3 suggestion chips. Messages: user bubbles (gold gradient, right, `18px 18px 4px 18px`, slide-right), agent bubbles (glass, left blue 4px border, avatar 32px geometric SVG, word-by-word stream-in, action row "Générer lettre / Copier / 👍 👎"), urgent banner if regex matches keywords (urgent, immédiat, danger, agression). Typing: 3 gold bouncing dots.
- Input: pill glass, FR/AR language toggle (left), mic + send (gold arrow with hover translate-x). Reuses existing Claude streaming logic from `supabase/functions/chat`.

**`src/components/LetterGenerator.tsx`** (modal)
- Full-screen `Dialog` with backdrop blur, spring scale-in.
- Left 40%: form (Nom / Adresse / Destinataire / Objet auto-filled from conversation context), FR/AR toggle, "Générer" gold.
- Right 60%: white paper card with shadow, header "ROYAUME DU MAROC" small caps + ville + date, body live-updates, faint Moroccan star watermark SVG.
- Bottom action bar: Copier / Télécharger PDF (`window.print` styled, or jsPDF if available — use simple Blob download of `.txt`/`.html` to avoid new deps; PDF via browser print stylesheet) / Envoyer email (`mailto:`).

**`src/pages/Dashboard.tsx`**
- Greeting header.
- 4 stat glass cards: Consultations (number + inline SVG sparkline), Lettres générées, Domaine le plus consulté (colored badge), Situations résolues (SVG progress ring gold).
- "Mes consultations" table: Date / Domaine / Résumé / Statut / Actions, status badges (Résolu green / En cours gold / Urgent red pulse), row hover gold left border, actions Reprendre / Lettre / Supprimer.
- "Domaines fréquents": custom CSS horizontal bar chart, bars `bar-fill` animation on mount, category colors.
- Data source: `localStorage` conversations (same store used by Chat).

**`src/pages/Categories.tsx`** — kept simple; reuses 6 glass cards from landing, links to `/chat?domain=...`.

**`src/pages/NotFound.tsx`** — black bg, large Amiri "حق غير موجود", small French line, zellige pattern, link home.

---

### 4. Routing & app shell

**`src/App.tsx`** — Routes: `/`, `/chat`, `/dashboard`, `/categories`, `*` NotFound. Wrap each in `<RouteFade>`. Global `<Toaster>` top-right. `<MobileNav>` on small screens.

**`src/main.tsx`** — unchanged.

---

### 5. Files removed (no longer used)

`Hero.tsx`, `FeatureCards.tsx`, `ChatWidget.tsx`, `NavLink.tsx`, `ArabicPatternBg.tsx`, `ParticleBg.tsx`, `GradientMesh.tsx`, `AnimatedCounter.tsx` (replaced by inline counter in BackgroundFX consumers), `Floating3DScales.tsx`, `MorphingAvatar.tsx`, `ConfidenceBar.tsx`, `LegalRadar.tsx`, `LegalTimeline.tsx`, `ThemeToggle.tsx`, `AmbientSound.tsx`, `ZelligeEmpty.tsx`. AnimatedCounter will actually be kept and reused.

---

### 6. Preserved (untouched)

- `supabase/functions/chat/index.ts` — Claude API logic.
- `src/integrations/supabase/{client,types}.ts`.
- All `src/components/ui/*` shadcn primitives.

---

### Technical notes

- No new dependencies. Sparklines, progress ring, bar chart all inline SVG/CSS.
- PDF "download" uses `window.print()` with a print-only stylesheet scoping the letter card; copy uses Clipboard API; email uses `mailto:` with prefilled body.
- All counters use `IntersectionObserver` + `requestAnimationFrame`.
- All colors via HSL tokens; no raw hex in components.
- Conversations persisted in `localStorage` under `darjalex.conversations` so Dashboard + Sidebar history work without backend changes.
