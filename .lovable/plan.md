## Vision

Refonte de Mizani comme un objet éditorial digital — à la croisée du **patrimoine marocain** (zellige, calligraphie arabe, ocre, indigo de Chefchaouen, vert émeraude des médinas) et de la **gravité de la justice** (typographie sérif noble, balance, colonnes, sceau). Un site qui inspire confiance, beauté et autorité, tout en restant chaleureux et accessible.

Direction: « Maison de Justice » — sobre, doré, lumineux. Inspirations: Apple éditorial, Stripe, Aesop, Rijksmuseum, manuscrits Quaraouiyine.

---

## 1. Système de design (light + dark raffinés)

**Palette dark (raffinée)**
- Fond: indigo nuit profond (au lieu du violet actuel) — `230 35% 5%`
- Or impérial: `42 78% 60%` (conservé)
- Bleu Majorelle: `220 80% 55%`
- Vert médina: `158 65% 42%`
- Terracotta sceau: `14 70% 52%` (nouvel accent justice)

**Palette light (raffinée)**
- Fond papier ivoire: `42 30% 96%`
- Encre noire: `30 30% 10%`
- Or bruni: `38 70% 45%`
- Bleu Chefchaouen: `210 60% 45%`

**Typographie**
- Display: Cormorant Garamond (conservé) → ajout de **Fraunl** pour les chiffres et capitales (sérif justice)
- Body: DM Sans (conservé)
- Arabe: Amiri + ajout de **Reem Kufi** pour titres arabes
- Mono pour articles de loi: JetBrains Mono

**Tokens additionnels**: ombres papier (light), halos lumineux (dark), gradients zellige.

---

## 2. Pages refondues

### Landing (`/`)
- **Hero**: Grande calligraphie arabe « العدالة » (justice) en filigrane animé. Titre sérif énorme. Sous-titre. Deux CTA. Sur la droite, un **sceau de justice animé** (SVG: balance + étoile à 5 branches + cercle calligraphié) qui tourne lentement.
- **Bandeau de confiance**: 4 chiffres + logo "Code Marocain 2025"
- **Domaines**: cartes en grille avec motif zellige subtil au survol, icône dans cartouche doré
- **Comment ça marche**: 4 étapes reliées par une ligne dorée animée (dash-draw amélioré)
- **Section "Articles cités"**: aperçu d'un article de loi stylisé comme un parchemin
- **Témoignages**: carousel de 3 cartes "papier" (mode clair) / verre (mode sombre)
- **CTA final**: bandeau zellige plein largeur

### Chat (`/chat`)
- En-tête épuré, bulles raffinées (bot = papier ivoire avec bordure or, user = indigo)
- Indicateur de typing en 3 points dorés
- Citations d'articles inline en cartouches

### Categories, Login, Register, Dashboard
- Mêmes principes: cartes papier/verre, sérif pour titres, accents or

---

## 3. Animations signature

- **Sceau de justice rotatif**: SVG animé (balance qui oscille, anneau extérieur tournant 30s)
- **Calligraphie tracée**: animation `stroke-dasharray` sur lettres arabes
- **Zellige révélé**: motif géométrique qui apparaît au scroll (IntersectionObserver)
- **Compteurs animés**: déjà présents, conservés
- **Parallaxe douce** sur le hero (motifs en arrière-plan)
- **Hover cards**: élévation + glow coloré + bord zellige qui s'illumine
- **Transitions de route**: fondu + léger blur (amélioration de RouteFade)
- **Curseur magnétique** sur les CTA principaux (desktop)
- **Theme toggle**: animation circulaire de transition (clip-path) au lieu d'un fade simple

---

## 4. Composants nouveaux

- `JusticeSeal.tsx` — sceau SVG animé (balance + étoile + cercle calligraphique)
- `ZelligePattern.tsx` — motif géométrique paramétrable (couleur, densité)
- `ArticleCard.tsx` — carte article de loi style parchemin
- `Testimonial.tsx` — carte témoignage
- `MagneticButton.tsx` — wrapper CTA avec effet magnétique
- `RevealOnScroll.tsx` — utilitaire d'apparition au scroll
- `ThemeToggle` amélioré — transition clip-path circulaire

---

## 5. Détails techniques

```text
src/
  components/
    JusticeSeal.tsx          (nouveau)
    ZelligePattern.tsx       (nouveau)
    ArticleCard.tsx          (nouveau)
    Testimonial.tsx          (nouveau)
    MagneticButton.tsx       (nouveau)
    RevealOnScroll.tsx       (nouveau)
    ThemeToggle.tsx          (refondu — clip-path)
    Header.tsx               (raffiné)
    BackgroundFX.tsx         (raffiné — zellige + parallaxe)
  pages/
    Index.tsx                (refondu)
    Chat.tsx                 (raffiné)
    Categories.tsx           (raffiné)
    Login.tsx / Register.tsx (raffinés)
    Dashboard.tsx            (raffiné)
  index.css                  (palette + tokens + keyframes)
  tailwind.config.ts         (nouvelles couleurs sémantiques)
```

Pas de changement de stack, pas de nouvelle dépendance majeure (juste `react-intersection-observer` éventuellement).

---

## 6. Livraison en 3 phases

1. **Fondations** — palette light/dark raffinée, tokens, typographie, ThemeToggle clip-path
2. **Composants signature** — JusticeSeal, ZelligePattern, MagneticButton, RevealOnScroll, ArticleCard
3. **Pages** — Index refondu en priorité (hero + sceau + zellige + témoignages), puis Chat, puis le reste

Chaque phase est testée en mode clair ET sombre, desktop ET mobile.

---

## Hors scope

- Pas de changement de logique métier (auth, chat, Supabase restent identiques)
- Pas de nouvelles routes
- Pas de refonte du backend
