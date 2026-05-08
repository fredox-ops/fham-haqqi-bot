## DarjaLex — Complete Visual Redesign

Goal: rebuild the entire UI from scratch with a bold, fintech-grade aesthetic. Keep ONLY the Claude API logic (`supabase/functions/chat/index.ts` and the streaming/fetch wiring inside the chat page).

### 1. Design system overhaul (`src/index.css` + `tailwind.config.ts`)
- Pure black background (`#000`), electric blue primary (`#0066FF`), gold accent (`#FFD700`).
- New tokens: `--electric-blue`, `--gold`, `--glow-blue/orange/red`, glass surfaces, ultra-rounded radius (`1.5rem`).
- New keyframes: `mesh-drift`, `rotate-3d`, `pulse-urgent`, `paper-unfold`, `morph-pattern`, `radar-sweep`, `count-up`, `glow-border`.
- Light mode variant for the dark/light toggle (smooth CSS variable morph).
- Zellige SVG overlay utility at 5% opacity.

### 2. Shared visual primitives (new components)
- `GradientMesh.tsx` — animated blue/purple/gold blob mesh background.
- `ZelligeOverlay.tsx` — fixed SVG zellige pattern at 5%.
- `AnimatedCounter.tsx` — counts up to 2.4M.
- `Floating3DScales.tsx` — CSS 3D rotating scales icon.
- `GlassBubble.tsx` — chat bubble with urgency-driven colored glow.
- `MorphingAvatar.tsx` — animated geometric pattern avatar that morphs while typing.
- `ConfidenceBar.tsx` — animated horizontal score bar.
- `LegalRadar.tsx` — SVG radar with rotating sweep + risk dots per domain.
- `LegalTimeline.tsx` — vertical journey of user's legal situation steps.
- `PillInput.tsx` — frosted glass input with focus glow border animation.
- `ThemeToggle.tsx` — dark/light morph toggle (writes `class` on `<html>`).
- `AmbientSound.tsx` — optional background ambient sound toggle.
- `PaperUnfold.tsx` — wraps letter generation with center unfold animation.

### 3. Pages — full rewrite
- `src/pages/Index.tsx` (Hero):
  - Giant `حق` Arabic calligraphy as semi-transparent background text.
  - Animated counter line, tagline, two CTAs (solid blue / outlined gold).
  - Floating 3D scales icon, gradient mesh bg, zellige overlay.
- `src/pages/Chat.tsx`:
  - Full-screen immersive layout, slide-in/out left sidebar (sessions grouped by category — keep existing concept).
  - Glass bubbles with urgency glow, morphing avatar, confidence score bar per agent reply.
  - Pill-shaped frosted input with animated focus border.
  - Right side / floating: `LegalRadar` + `LegalTimeline` widgets driven by conversation context.
  - Mobile: convert to bottom-sheet chat, swipe-right to reveal case history.
  - **Keep** the existing `fetch`/streaming call to the `chat` edge function and message-state logic; only swap the rendering layer.
- `src/pages/Categories.tsx` and `src/pages/Dashboard.tsx`: re-skin with new tokens, keep functionality (cards, stats, flip cards).
- `src/components/LetterGenerator.tsx`: wrap modal in `PaperUnfold` animation; restyle with new palette. Keep PDF/copy/email logic intact.

### 4. Mobile + interaction polish
- Bottom-sheet chat via `vaul` Drawer on `<md`.
- Swipe-right gesture on chat history (reuse existing touch handler, retune thresholds).
- "Haptic feedback" CSS: tiny `scale(0.97)` + spring on tap for buttons/bubbles.
- `MobileNav.tsx` restyled.

### 5. What is preserved
- `supabase/functions/chat/index.ts` (Claude system prompt, streaming, category detection, urgent detection).
- Client-side conversation memory (last 10 messages) and urgent banner trigger.
- `LetterGenerator` core logic (jsPDF, autofill, FR/AR toggle, actions).
- Routing in `src/App.tsx`.

### 6. Removed / replaced
- Old `Hero`, `FeatureCards`, `ChatWidget`, `ArabicPatternBg`, `ParticleBg`, `LoadingScreen`, `ZelligeEmpty` are deleted or fully rewritten under the new identity.

### Technical notes
- All colors via HSL semantic tokens — no raw hex in components.
- 3D rotating scales uses `transform-style: preserve-3d` + `rotateY` keyframes (pure CSS, no three.js).
- Gradient mesh uses 3 absolutely-positioned radial-gradient blurred blobs animated with `translate` keyframes.
- Confidence score: derived heuristically from response length + presence of cited articles (regex on "Art."), 60–95% range.
- Radar risk weights: count of detected categories in last 10 messages.
- Theme toggle: toggles `dark` class on `<html>`; light tokens defined in `:root.light` block.
- Ambient sound: small loopable mp3 added to `public/` (or generated via `<audio>` with a CC0 URL); muted by default, toggle in header.
