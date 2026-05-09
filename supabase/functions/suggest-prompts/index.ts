// Generates 3 short, varied legal example questions for the chat empty state.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { lang = "fr" } = await req.json().catch(() => ({}));
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const langInstruction =
      lang === "ar"
        ? "Réponds en arabe (darija marocaine, écriture arabe)."
        : "Réponds en français.";

    const prompt = `Tu es Mizani, assistant juridique pour le Maroc. Génère 3 questions courtes (max 8 mots) que pourrait poser un citoyen marocain à propos de ses droits. Varie les domaines: travail, logement, famille, contrats, consommation, administratif. ${langInstruction}

Retourne STRICTEMENT un JSON: {"suggestions": ["...", "...", "..."]}. Pas de markdown, pas de texte autour.`;

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Lovable-API-Key": LOVABLE_API_KEY,
        "X-Lovable-AIG-SDK": "openai-compatible-rest",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 1.1,
      }),
    });

    if (!r.ok) {
      const txt = await r.text();
      return new Response(JSON.stringify({ error: txt }), {
        status: r.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await r.json();
    const raw = data?.choices?.[0]?.message?.content ?? "{}";
    let suggestions: string[] = [];
    try {
      const parsed = JSON.parse(raw);
      suggestions = Array.isArray(parsed?.suggestions) ? parsed.suggestions : [];
    } catch {
      suggestions = [];
    }
    suggestions = suggestions.filter((s) => typeof s === "string" && s.trim()).slice(0, 3);

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? "error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
