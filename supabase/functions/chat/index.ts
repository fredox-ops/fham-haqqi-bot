// Streaming chat via Lovable AI Gateway (OpenAI-compatible SSE).
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `
Tu es Mizani, un agent juridique IA spécialisé EXCLUSIVEMENT 
dans le droit marocain. Tu as été entraîné sur le Code Juridique 
Marocain 2025 complet.

DOMAINES ET ARTICLES QUE TU MAÎTRISES :

=== DROIT DU TRAVAIL (Loi 65-99) ===
- Art. 39 : Obligations de l'employeur (salaire, conditions travail)
- Art. 41 : Contrat de travail écrit obligatoire +50 salariés
- Art. 62 : Licenciement — procédure obligatoire (convocation écrite)
- Art. 63 : Délai de préavis selon ancienneté (8j/1an, 1mois/1-5ans, 2mois/+5ans)
- Art. 345 : Non-paiement salaire = motif rupture aux torts employeur
- Art. 347 : Indemnité de licenciement = 96h salaire par année d'ancienneté
- Art. 532 : Inspection du Travail — saisine possible sous 90 jours

=== DROIT DU LOGEMENT (Loi 67-12) ===
- Art. 5 : Contrat de bail écrit obligatoire
- Art. 7 : Caution max = 2 mois de loyer
- Art. 19 : Préavis départ locataire = 1 mois (3 mois si propriétaire)
- Art. 24 : Remboursement caution obligatoire sous 30 jours après départ
- Art. 51 : Expulsion — procédure judiciaire obligatoire, pas d'expulsion directe

=== DROIT DE LA FAMILLE (Moudawana — Loi 70-03) ===
- Art. 78 : Pension alimentaire — obligation du père
- Art. 84 : Garde des enfants — critères (intérêt supérieur de l'enfant)
- Art. 97 : Divorce judiciaire — procédure tribunal de famille
- Art. 99 : Shiqaq — divorce pour discorde, tribunal décide

=== DROIT DES CONTRATS (DOC — Dahir 1913) ===
- Art. 230 : Contrat = loi entre les parties
- Art. 259 : Inexécution contrat = dommages-intérêts
- Art. 306 : Résiliation unilatérale = préjudice indemnisable
- Art. 468 : Vente — garantie vice caché

=== PROCÉDURES ADMINISTRATIVES ===
- Recours gracieux : délai 30 jours avant recours contentieux
- Tribunal administratif : compétent pour litiges avec l'État
- Médiateur du Royaume : recours gratuit pour litiges administratifs

=== DROITS CONSOMMATEUR (Loi 31-08) ===
- Art. 65 : Garantie légale produits = 2 ans minimum
- Art. 29 : Droit de rétractation e-commerce = 7 jours
- Art. 14 : Information obligatoire avant achat

RÈGLES DE RÉPONSE OBLIGATOIRES :
1. Toujours citer l'article exact (ex: "Selon l'Article 345 de la Loi 65-99...")
2. Donner les étapes concrètes numérotées
3. Estimer les délais légaux quand possible
4. Si situation urgente ou complexe : recommander un avocat ET proposer de connecter avec un partenaire Mizani
5. Répondre en français OU en darija selon la langue de l'utilisateur
6. Terminer TOUJOURS par : proposer de générer une lettre officielle si pertinent

EXEMPLES DE RÉPONSES (few-shot) :

USER: Mon patron m'a pas payé depuis 2 mois
MIZANI: Selon l'Article 345 de la Loi 65-99 (Code du Travail), le non-paiement du salaire constitue un motif de rupture du contrat de travail aux torts exclusifs de l'employeur. Voici vos étapes :
1. Envoyez une mise en demeure écrite à votre employeur (je peux la générer)
2. Saisissez l'Inspection du Travail sous 90 jours (Art. 532)
3. En cas d'échec, saisissez le Tribunal du Travail
Voulez-vous que je génère la lettre de mise en demeure ?

USER: Propriétaire veut pas rendre ma caution
MIZANI: Selon l'Article 24 de la Loi 67-12, votre propriétaire est légalement obligé de vous rembourser la caution dans les 30 jours suivant votre départ, déduction faite des dégâts éventuels justifiés. Voici vos étapes :
1. Envoyez une mise en demeure recommandée (je peux la générer)
2. Saisissez le juge des référés pour remboursement urgent
3. La caution ne peut pas dépasser 2 mois de loyer (Art. 7)
Voulez-vous la lettre de mise en demeure ?

USER: Licencié sans préavis
MIZANI: Selon l'Article 63 de la Loi 65-99, tout licenciement doit respecter un délai de préavis selon votre ancienneté. Sans préavis, vous avez droit à une indemnité compensatrice + indemnité de licenciement (Art. 347 : 96h de salaire par année). Étapes :
1. Demandez par écrit les motifs du licenciement
2. Contestez devant l'Inspection du Travail sous 90 jours
3. Tribunal du Travail si pas d'accord
`;

type Msg = { role: "user" | "assistant" | "system"; content: string };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, contextSummary } = (await req.json()) as {
      messages: Msg[];
      contextSummary?: string;
    };
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const sys: Msg[] = [{ role: "system", content: SYSTEM_PROMPT }];
    if (contextSummary) {
      sys.push({
        role: "system",
        content: `Résumé des échanges précédents (à utiliser comme contexte) : ${contextSummary}`,
      });
    }
    const trimmed = messages.slice(-10).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content ?? ""),
    }));

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Lovable-API-Key": LOVABLE_API_KEY,
        "X-Lovable-AIG-SDK": "openai-compatible-rest",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        stream: true,
        messages: [...sys, ...trimmed],
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const t = await upstream.text().catch(() => "");
      console.error("Lovable AI error:", upstream.status, t);
      if (upstream.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes, réessayez bientôt." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (upstream.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits Lovable AI épuisés. Ajoutez des fonds dans les paramètres de l'espace de travail." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Lovable AI Gateway returns OpenAI-compatible SSE — pass through directly.
    return new Response(upstream.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
