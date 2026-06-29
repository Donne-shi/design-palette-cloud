import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Schema = z.object({
  texts: z.array(z.string().min(1).max(2000)).min(1).max(60),
  target: z.enum(["es", "zh", "en"]),
});

const LANG_NAME: Record<string, string> = { es: "Spanish", zh: "Simplified Chinese", en: "English" };

export const translateBatch = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Schema.parse(d))
  .handler(async ({ data }): Promise<{ translations: string[] }> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");
    const sys = `You are a professional translator. Translate each input string to ${LANG_NAME[data.target]}. Preserve meaning, tone, and proper nouns (brand names, place names). Do NOT translate "Multicultural Bridge Initiative" or "MBI". Return STRICT JSON: {"translations":[...]} with exactly ${data.texts.length} items in the same order. No extra text.`;
    const userMsg = JSON.stringify({ texts: data.texts });
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: userMsg },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Translation failed: ${res.status} ${text.slice(0, 200)}`);
    }
    const json: any = await res.json();
    const content = json?.choices?.[0]?.message?.content ?? "{}";
    let parsed: any;
    try { parsed = JSON.parse(content); } catch { parsed = {}; }
    const out: string[] = Array.isArray(parsed?.translations) ? parsed.translations : [];
    // Pad/truncate to match input length defensively
    const translations = data.texts.map((src, i) => (typeof out[i] === "string" && out[i].trim() ? out[i] : src));
    return { translations };
  });
