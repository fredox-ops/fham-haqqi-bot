## Objectif

Remplacer l'animation actuelle (iris + mandala) — saccadée — par une transition de thème **fluide, GPU-only, et impressionnante** : un **split zellige doré** où l'écran se fend en deux moitiés qui glissent en sens opposés, séparées par une fine ligne d'or lumineuse, pendant qu'un éclat doré se propage au centre.

## Pourquoi ça ne saccade plus

Causes du lag actuel :
- `clip-path: circle(...)` animé sur un overlay plein écran → recalcul du masque chaque frame, non accéléré GPU partout.
- Pseudo-élément `::after` avec **gros SVG en background-image** + `mix-blend-mode: screen` + double `drop-shadow` filter → composite très coûteux à chaque frame.
- Combiné à `backdrop-blur` déjà présent dans l'app sur le header / cards → frame drops.

Nouvelle approche n'utilise **que `transform` et `opacity`** (les deux propriétés GPU-accélérées), zéro `clip-path`, zéro `filter`, zéro SVG raster lourd.

## Concept visuel : "Split d'or"

```text
Avant clic              Pendant (0-50%)            Pendant (50-100%)         Après
┌──────────┐          ┌─────┐  ┌─────┐           ┌──┐        ┌──┐          ┌──────────┐
│  ancien  │   →      │ anc │══│ anc │     →     │a │  ✦✦✦  │ a│    →     │ nouveau  │
│  thème   │          │ ien │  │ ien │           │  │        │  │          │  thème   │
└──────────┘          └─────┘  └─────┘           └──┘        └──┘          └──────────┘
                       glisse ←  → glisse        écartement max + flash
                       (révèle nouveau thème dessous)
```

1. Au clic, deux panneaux plein écran apparaissent côte à côte, chacun affichant **l'ancien thème figé** (snapshot du body via overlay coloré du background actuel).
2. Ces deux panneaux glissent en sens opposés (gauche → hors écran à gauche, droite → hors écran à droite) avec `translateX`.
3. À la jonction, une **fine bande verticale dorée** (gradient doux, pas de filter) s'élargit puis s'estompe — donne l'impression d'une fente lumineuse qui fend le monde.
4. Pendant que les panneaux glissent, le `<html>` change de classe → le vrai nouveau thème se révèle dessous.
5. Petite "étincelle" centrale : un disque doré radial-gradient qui scale de 0 à ~2 puis fade (uniquement transform + opacity).

Durée totale : **800 ms** (plus court = perçu plus snappy, moins de risque de saccades).

## Détails techniques

- **Pas de `clip-path` animé**, **pas de `filter` animé**, **pas de SVG en background-image** sur l'overlay.
- Trois pseudo-couches via un container fixe injecté ou via les pseudo-éléments de `<html>` :
  - `.theme-split-left`  : `transform: translateX(0) → translateX(-101%)`, background = couleur de l'ancien thème (capturée au début).
  - `.theme-split-right` : `transform: translateX(0) → translateX(101%)`, idem.
  - `.theme-spark` : disque centré, `transform: scale(0) → scale(2.4)`, `opacity: 0 → 1 → 0`.
  - `.theme-seam` : ligne verticale 2px dorée centrée, `opacity 0 → 1 → 0`, `transform: scaleY(1)` (pas de scale animé).
- Capture de l'ancienne couleur de fond : lire `getComputedStyle(document.body).backgroundColor` **avant** le swap, l'appliquer en variable CSS `--theme-from-bg` sur les deux panneaux.
- Le swap de classe `light` se fait à **400 ms** (mi-animation), quand les panneaux sont déjà à ~50% de leur course → l'utilisateur ne voit jamais un flash brut du nouveau thème, masqué par les panneaux.
- `will-change: transform` sur les panneaux uniquement pendant l'animation, retiré au cleanup.
- `pointer-events: none` sur tous les overlays.
- Respect de `prefers-reduced-motion` : durée 1ms, swap immédiat.

## Fichiers touchés

1. **`src/index.css`** — supprimer le bloc actuel `.theme-transitioning::before/::after` + keyframes `theme-iris` / `theme-mandala`. Ajouter :
   - 4 éléments stylés (`.theme-fx-left`, `.theme-fx-right`, `.theme-fx-seam`, `.theme-fx-spark`) en `position: fixed`, animés uniquement via transform/opacity.
   - Keyframes `split-left`, `split-right`, `seam-pulse`, `spark-pulse`.
2. **`src/components/ThemeToggle.tsx`** — au lieu d'ajouter une seule classe sur `<html>`, créer dynamiquement un container `<div class="theme-fx-root">` avec 4 enfants, capturer la couleur de fond actuelle dans `--theme-from-bg`, lancer l'anim, swap la classe `light` à 400 ms, retirer le container à 820 ms. Ajuster les timings en conséquence.

## Vérification

Après implémentation : tester le toggle plusieurs fois rapidement (vérifier qu'il n'y a pas d'overlays orphelins), vérifier que la frame rate reste fluide en passant le toggle dans une page chargée (Dashboard avec ses charts).
