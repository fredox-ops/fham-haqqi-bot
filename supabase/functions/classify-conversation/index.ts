// Classify a conversation by Moroccan legal domain using Lovable AI (gemini-2.5-flash-lite).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DOMAINS = [
  "Travail", "Famille", "Logement", "Contrats", "Administratif",
  "Pénal", "Consommation", "Commercial", "Fiscal", "Autre",
] as const;

const tools = [
  {
    type: "function",
    function: {
      name: "set_classification",
      description: "Classify the conversation and produce a short title and summary.",
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: {
          domain: { type: "string", enum: [...DOMAINS] },
          title: { type: "string", description: "Short 3-7 word title in the user's language." },
          summary: { type: "string", description: "Concise summary, max 160 characters, in the user's language." },
          tags: { type: "array", items: { type: "string" }, maxItems: 5 },
          urgency: { type: "string", enum: ["low", "medium", "high"] },
          language: { type: "string", enum: ["fr", "ar", "darija"] },
        },
        required: ["domain", "title", "summary", "tags", "urgency", "language"],
      },
    },
  },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { conversation_id } = await req.json();
    if (!conversation_id) {
      return new Response(JSON.stringify({ error: "conversation_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: msgs, error: msgsErr } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversation_id)
      .order("created_at", { ascending: true })
      .limit(40);

    if (msgsErr) throw msgsErr;
    if (!msgs || msgs.length === 0) {
      return new Response(JSON.stringify({ error: "no messages" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const transcript = msgs
      .map((m) => `${m.role === "user" ? "USER" : "ASSISTANT"}: ${m.content}`)
      .join("\n\n")
      .slice(0, 8000);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content:
              `You classify Moroccan legal-help conversations. Choose ONE domain from: ${DOMAINS.join(", ")}. Always call the set_classification tool. Reply in the user's language for title/summary/tags.`,
          },
          { role: "user", content: `Conversation:\n\n${transcript}` },
        ],
        tools,
        tool_choice: { type: "function", function: { name: "set_classification" } },
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text().catch(() => "");
      console.error("AI classify error:", aiRes.status, t);
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "rate_limited" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "credits_exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI ${aiRes.status}`);
    }

    const data = await aiRes.json();
    const call = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!call?.function?.arguments) throw new Error("no tool call");
    const args = JSON.parse(call.function.arguments);

    const { error: upErr } = await supabase
      .from("conversations")
      .update({
        domain: args.domain,
        title: args.title,
        summary: args.summary,
        tags: args.tags ?? [],
        urgency: args.urgency,
        language: args.language,
      })
      .eq("id", conversation_id);

    if (upErr) throw upErr;

    return new Response(JSON.stringify({ ok: true, ...args }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("classify error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
