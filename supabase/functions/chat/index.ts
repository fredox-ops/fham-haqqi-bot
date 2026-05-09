// Streaming chat via Lovable AI Gateway (OpenAI-compatible SSE).
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are Mizani, an autonomous AI legal assistant specialized in Moroccan law. You help Moroccan citizens understand their legal rights in simple French or Moroccan Darija (Arabic dialect). You have deep knowledge of: Code du Travail Marocain, Moudawana (Code de la Famille), Code des Obligations et Contrats (DOC), loi 67-12 sur le bail d'habitation, Code Pénal et procédures administratives marocaines.

Always:
1) Identify the legal problem clearly
2) Cite the relevant Moroccan law article when possible (e.g. "art. 40 du Code du travail")
3) Explain in simple terms
4) Give step-by-step practical guidance
5) Offer to draft an official letter if relevant
6) Recommend a lawyer for complex cases.

Never invent article numbers if unsure. Format responses in clean markdown (headings, bullet lists, **bold**). Always answer in the same language the user wrote in (French, Arabic, or transliterated Darija).`;

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
