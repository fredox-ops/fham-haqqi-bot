// Generate official letter content via Lovable AI Gateway.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Msg = { role: "user" | "assistant"; content: string };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, lang, category } = (await req.json()) as {
      messages: Msg[];
      lang: "fr" | "ar";
      category?: string | null;
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const convo = (messages || [])
      .slice(-12)
      .map((m) => `${m.role === "user" ? "USER" : "ASSISTANT"}: ${m.content}`)
      .join("\n");

    const sys = lang === "ar"
      ? `أنت مساعد قانوني مغربي. اكتب رسالة إدارية رسمية باللغة العربية الفصحى فقط، بأسلوب احترافي يليق بالمراسلات الرسمية المغربية. أعد JSON صالحًا فقط بالحقول: recipient, subject, body. الجسم (body) يجب أن يكون فقرات واضحة ومهذبة، بدون التحية الافتتاحية ولا الخاتمة (يضافان تلقائيًا). لا تخترع أرقام مواد قانونية إن لم تكن متأكدًا.`
      : `Tu es un assistant juridique marocain. Rédige une lettre administrative officielle en français soutenu, dans le style des courriers administratifs marocains. Réponds UNIQUEMENT par un JSON valide avec les champs: recipient, subject, body. Le body doit être des paragraphes clairs et polis, SANS la formule d'appel ni la formule de politesse finale (ajoutées automatiquement). N'invente pas de numéros d'articles si tu n'es pas sûr.`;

    const userPrompt = `${category ? `Catégorie: ${category}\n` : ""}Conversation:\n${convo}\n\nGénère la lettre en ${lang === "ar" ? "arabe" : "français"}. JSON uniquement.`;

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Lovable-API-Key": LOVABLE_API_KEY,
        "X-Lovable-AIG-SDK": "openai-compatible-rest",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!r.ok) {
      const t = await r.text().catch(() => "");
      console.error("AI error:", r.status, t);
      return new Response(JSON.stringify({ error: "AI error", status: r.status }), {
        status: r.status === 429 || r.status === 402 ? r.status : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await r.json();
    const txt = data.choices?.[0]?.message?.content ?? "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(txt); } catch { parsed = {}; }

    return new Response(
      JSON.stringify({
        recipient: parsed.recipient ?? "",
        subject: parsed.subject ?? "",
        body: parsed.body ?? "",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("generate-letter error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
