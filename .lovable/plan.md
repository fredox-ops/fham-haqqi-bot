## Goal

Faire fonctionner le chat sans clé API à fournir, et **classer automatiquement** chaque conversation par domaine juridique marocain pour filtrer l'historique.

---

## 1. Quelle API ? Quel dataset ?

**API → Lovable AI Gateway** (intégré, sans clé à gérer, facturé en crédits Lovable).
- Modèle conversation : `google/gemini-2.5-pro` — excellent en français, arabe et darija, gros contexte (citations longues, mémoire de conversation).
- Modèle classification : `google/gemini-2.5-flash-lite` — rapide et bon marché, parfait pour étiqueter et résumer.
- On remplace l'edge function actuelle qui dépend de `ANTHROPIC_API_KEY` (qu'il faudrait remplacer après remix). Plus de clé à entretenir.

**Dataset → aucun dataset à entraîner.**
Trois options possibles, du plus simple au plus complet :

1. **LLM seul (recommandé maintenant)** — Gemini 2.5 Pro connaît déjà le Code du travail, la Moudawana, le DOC, etc. Zéro setup. Risque modéré d'erreur sur des numéros d'articles précis.
2. **RAG léger (étape suivante, optionnel)** — stocker ~200-500 chunks des codes marocains clés (Travail, Famille, DOC, Logement 67-12, Pénal) dans une table avec embeddings (`pgvector` + embeddings via Lovable AI), et injecter les 5 articles les plus pertinents dans le prompt. Améliore beaucoup la fiabilité des citations.
3. Scrape complet du Bulletin Officiel (sgg.gov.ma) — surdimensionné, à éviter pour l'instant.

Pour la **classification**, pas de dataset nécessaire : on utilise le LLM en zero-shot avec une taxonomie fixe.

**Taxonomie utilisée partout** (UI, BD, IA) :
`Travail`, `Famille`, `Logement`, `Contrats`, `Administratif`, `Pénal`, `Consommation`, `Commercial`, `Fiscal`, `Autre`.

---

## 2. Ce qu'on construit

### A. Réécriture de `supabase/functions/chat/index.ts`
- Appel à Lovable AI Gateway (`https://ai.gateway.lovable.dev/v1/chat/completions`) avec `google/gemini-2.5-pro` et `stream: true`.
- Conserver le system prompt (assistant juridique marocain, FR/AR/Darija, markdown).
- Envoyer les 10 derniers messages comme mémoire.
- Gestion explicite des erreurs 429 / 402 → toast côté client.
- Le format SSE renvoyé reste OpenAI-compatible → le parseur frontend ne change pas.

### B. Nouvelle edge function `supabase/functions/classify-conversation/index.ts`
- Entrée : `{ conversation_id }`.
- Charge les messages (service role) via la base.
- Appelle `google/gemini-2.5-flash-lite` avec **structured output** pour produire :
  ```
  { domain, summary (≤120 car), tags[], urgency: low|medium|high, language: fr|ar|darija, title }
  ```
- Met à jour `conversations` : `domain`, `summary` + nouvelles colonnes `tags`, `urgency`, `language`, `title`.
- Déclenchée depuis le client après chaque réponse de l'assistant (debounce 1s).

### C. Migration base de données
Ajouter à `conversations` :
- `tags text[] default '{}'`
- `urgency text default 'low'` (low/medium/high)
- `language text default 'fr'`
- `title text`

Le champ `domain` reste `text`, contraint dans l'app à la taxonomie.

### D. Frontend
- **`src/pages/Chat.tsx`** : persister les messages (déjà partiellement câblé), puis appeler `classify-conversation` après chaque tour assistant.
- **`src/pages/Dashboard.tsx`** : historique groupé/filtrable par `domain`, badges `urgency` et `tags`, affichage du `title` au lieu du brut.
- Tous les libellés via `i18n.tsx` existant (FR/AR).

### E. Mémoire conversation
La mémoire = derniers 10 messages envoyés au gateway. Pour des fils plus longs, le `summary` produit par le classifier est ajouté en system note pour conserver le contexte sans payer un gros historique.

---

## 3. Flux technique

```text
Client (Chat.tsx)
   │  stream  ┌──────────────────────────┐
   ├────────► │ /functions/v1/chat       │ → Lovable AI (gemini-2.5-pro, SSE)
   │ ◄────────┤ tokens                   │
   │ insère user+assistant en BD
   │
   │ après réponse complète
   ├────────► │ /functions/v1/classify-  │ → Lovable AI (flash-lite, structured)
   │          │ conversation             │ → UPDATE conversations SET domain,
   │          └──────────────────────────┘                            summary,
   │                                                                  tags,
   │                                                                  urgency,
   │                                                                  language,
   │                                                                  title
   ▼
Dashboard.tsx lit conversations, filtre par domaine, affiche badges.
```

Erreurs : 429 → toast « Trop de requêtes ». 402 → toast « Crédits Lovable AI épuisés, ajoutez des fonds ».

Secrets : seulement `LOVABLE_API_KEY` (déjà présent). `ANTHROPIC_API_KEY` n'est plus utilisé.

---

## 4. Hors scope (étapes futures)

- RAG avec `pgvector` sur les codes marocains (option 2 ci-dessus).
- Génération de lettres officielles ancrée sur les articles récupérés.
- Dashboard de modération admin.
