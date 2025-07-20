import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { image } = body;

    if (!image || typeof image !== "string") {
      return new Response(JSON.stringify({ error: "Missing or invalid image (base64)" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const prompt = `
First, perform two checks on this image:
1. Is a stool clearly visible in the photo?
2. Is the image quality sufficient for analysis (not too blurry, not too dark)?

If either of these checks fails, return ONLY a JSON object with an "error" key.
- If no stool is visible, return: {"error": "No stool detected"}
- If the image is blurry or dark, return: {"error": "Image is too blurry"}

If both checks pass, then analyze the stool. Describe what you see using ONLY the following exact labels:

{
  "appearance": "solid" | "soft" | "loose" | "mushy" | "pebbly" | "squishy" | "hard",
  "color": "brown" | "green" | "yellow" | "red" | "black" | "pale",
  "analysis": "a 1-2 sentence plain English summary of what this means",
  "recommendations": ["tip 1", "tip 2", "tip 3"]
}

Instructions for analysis:
- Use only the allowed values.
- If color is red, black, or pale, suggest seeing a doctor.
- Return strict valid JSON only, no commentary or explanation.
`;

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("DEEPSEEK_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are a gut health assistant. Return JSON only." },
          { role: "user", content: `${prompt}\n\nHere is the base64 image:\n${image}` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 512,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: "DeepSeek API failed", details: errorText }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    const json = await response.json();
    const rawText = json.choices?.[0]?.message?.content;

    if (!rawText) {
      return new Response(JSON.stringify({ error: "No content returned from DeepSeek" }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(JSON.stringify({ error: "Could not extract valid JSON from response" }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // --- Check for AI-driven error before proceeding ---
    if (parsed.error) {
      return new Response(JSON.stringify({ error: parsed.error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // ----------------------------------------------------

    const appearanceScoreMap: Record<string, number> = {
      solid: 10,
      soft: 9,
      squishy: 8,
      loose: 7,
      hard: 7,
      mushy: 6,
      pebbly: 5,
    };

    const colorPenaltyMap: Record<string, number> = {
      brown: 0,
      green: -1,
      yellow: -1,
      red: -3,
      black: -3,
      pale: -3,
    };

    const base = appearanceScoreMap[parsed.appearance] ?? 7;
    const penalty = colorPenaltyMap[parsed.color] ?? -1;
    const rawScore = Math.max(0, Math.min(10, base + penalty));
    const fuzz = Math.floor(Math.random() * 7) - 3;
    const healthScore = Math.max(0, Math.min(100, rawScore * 10 + fuzz));

    const result = {
      appearance: parsed.appearance,
      color: parsed.color,
      health_score: healthScore,
      analysis: parsed.analysis,
      recommendations: parsed.recommendations,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
