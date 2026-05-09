// Transcribe audio via Lovable AI Gateway (Gemini multimodal).
// Accepts { audio: base64, mimeType, language? } and returns { text }.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio, mimeType, language } = await req.json();
    if (!audio || typeof audio !== "string") {
      return new Response(JSON.stringify({ error: "audio (base64) required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const langHint =
      language === "ar"
        ? "The audio is most likely in Moroccan Darija or Arabic; transcribe in Arabic script."
        : language === "fr"
        ? "The audio is most likely in French or Moroccan Darija; transcribe in the spoken language using Latin script for Darija and French for French."
        : "The audio may be in French, Arabic, or Moroccan Darija. Transcribe in the spoken language.";

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are a strict speech-to-text transcriber. Output ONLY the verbatim transcription of the audio, with no preface, no quotes, no explanation. " +
              langHint,
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Transcribe this audio." },
              {
                type: "input_audio",
                input_audio: {
                  data: audio,
                  format: (mimeType || "audio/webm").includes("mp4")
                    ? "mp4"
                    : (mimeType || "audio/webm").includes("wav")
                    ? "wav"
                    : (mimeType || "audio/webm").includes("mpeg")
                    ? "mp3"
                    : "webm",
                },
              },
            ],
          },
        ],
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("AI gateway error", resp.status, errText);
      return new Response(JSON.stringify({ error: errText }), {
        status: resp.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const text: string = data?.choices?.[0]?.message?.content?.trim?.() ?? "";

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
