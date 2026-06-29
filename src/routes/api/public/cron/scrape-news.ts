import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

// Cron-invoked endpoint. Verified by Supabase anon key in `apikey` header.
// /api/public/* bypasses Lovable's published-site auth, so this handler must
// authenticate itself.

type Source = { name: string; url: string; category: string };

const SOURCES: Source[] = [
  { name: "Pew Research — Religion", url: "https://www.pewresearch.org/religion/feed/", category: "Society" },
  { name: "Christianity Today", url: "https://www.christianitytoday.com/ct/rss.xml", category: "U.S. Church" },
  { name: "Religion News Service", url: "https://religionnews.com/feed/", category: "Global Christianity" },
];

const PER_SOURCE_LIMIT = 5;

type RssItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string | null;
};

function stripTags(s: string): string {
  return s
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function pick(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return m ? stripTags(m[1]) : "";
}

function parseRss(xml: string): RssItem[] {
  const items: RssItem[] = [];
  const itemRegex = /<item\b[^>]*>([\s\S]*?)<\/item>/gi;
  const entryRegex = /<entry\b[^>]*>([\s\S]*?)<\/entry>/gi;
  let m: RegExpExecArray | null;
  while ((m = itemRegex.exec(xml)) !== null) {
    const block = m[1];
    const link = pick(block, "link") || (block.match(/<link[^>]*href="([^"]+)"/i)?.[1] ?? "");
    const title = pick(block, "title");
    const description = pick(block, "description") || pick(block, "summary") || pick(block, "content:encoded");
    const pubDate = pick(block, "pubDate") || pick(block, "published") || pick(block, "updated") || null;
    if (title && link) items.push({ title, link, description: description.slice(0, 800), pubDate });
  }
  if (items.length === 0) {
    while ((m = entryRegex.exec(xml)) !== null) {
      const block = m[1];
      const link = block.match(/<link[^>]*href="([^"]+)"/i)?.[1] ?? pick(block, "link");
      const title = pick(block, "title");
      const description = pick(block, "summary") || pick(block, "content");
      const pubDate = pick(block, "updated") || pick(block, "published") || null;
      if (title && link) items.push({ title, link, description: description.slice(0, 800), pubDate });
    }
  }
  return items;
}

type Summary = { title_en: string; title_zh: string; excerpt_en: string; excerpt_zh: string };

async function summarizeBatch(apiKey: string, items: { title: string; description: string }[]): Promise<Summary[]> {
  const sys = `You are a bilingual (English / Simplified Chinese) editor for a Gospel-centered Christian publication. For each news item provided, write:
- title_en: a clean editorial English headline (max 90 chars)
- title_zh: a faithful Chinese headline (中文，最长 40 字)
- excerpt_en: a neutral 120–150 word English summary suitable for editorial preview
- excerpt_zh: 120–180 字的中文摘要

Be accurate and neutral; never invent facts. Preserve proper nouns. Do NOT translate "Multicultural Bridge Initiative" or "MBI".
Return STRICT JSON: {"summaries":[{title_en,title_zh,excerpt_en,excerpt_zh}, ...]} with exactly ${items.length} items in the same order. No prose outside JSON.`;
  const user = JSON.stringify({ items: items.map((it) => ({ title: it.title, source_text: it.description })) });
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`AI summarize failed: ${res.status} ${t.slice(0, 200)}`);
  }
  const j: any = await res.json();
  const content = j?.choices?.[0]?.message?.content ?? "{}";
  let parsed: any;
  try { parsed = JSON.parse(content); } catch { parsed = {}; }
  const arr: any[] = Array.isArray(parsed?.summaries) ? parsed.summaries : [];
  return items.map((it, i) => {
    const s = arr[i] || {};
    return {
      title_en: typeof s.title_en === "string" && s.title_en.trim() ? s.title_en.trim() : it.title,
      title_zh: typeof s.title_zh === "string" && s.title_zh.trim() ? s.title_zh.trim() : it.title,
      excerpt_en: typeof s.excerpt_en === "string" ? s.excerpt_en.trim() : "",
      excerpt_zh: typeof s.excerpt_zh === "string" ? s.excerpt_zh.trim() : "",
    };
  });
}

export const Route = createFileRoute("/api/public/cron/scrape-news")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabaseUrl = process.env.SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const anonKey = process.env.SUPABASE_PUBLISHABLE_KEY;
        const lovableKey = process.env.LOVABLE_API_KEY;
        if (!supabaseUrl || !serviceKey || !anonKey || !lovableKey) {
          return Response.json({ error: "Server not configured" }, { status: 500 });
        }
        const apikey = request.headers.get("apikey");
        if (apikey !== anonKey) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const supabase = createClient(supabaseUrl, serviceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const result = { fetched: 0, queued: 0, skipped: 0, errors: [] as string[] };

        for (const src of SOURCES) {
          try {
            const r = await fetch(src.url, { headers: { "user-agent": "MBI-NewsBot/1.0 (+https://bridgeaway.org)" } });
            if (!r.ok) { result.errors.push(`${src.name}: HTTP ${r.status}`); continue; }
            const xml = await r.text();
            const items = parseRss(xml).slice(0, PER_SOURCE_LIMIT);
            result.fetched += items.length;
            if (items.length === 0) continue;

            // Dedupe against existing drafts
            const urls = items.map((it) => it.link);
            const { data: existing } = await supabase
              .from("news_drafts")
              .select("source_url")
              .in("source_url", urls);
            const seen = new Set((existing ?? []).map((e: any) => e.source_url));
            const fresh = items.filter((it) => !seen.has(it.link));
            result.skipped += items.length - fresh.length;
            if (fresh.length === 0) continue;

            const summaries = await summarizeBatch(lovableKey, fresh.map((f) => ({ title: f.title, description: f.description })));

            const rows = fresh.map((it, i) => ({
              source_name: src.name,
              source_url: it.link,
              original_title: it.title,
              original_excerpt: it.description.slice(0, 600),
              title_en: summaries[i].title_en,
              title_zh: summaries[i].title_zh,
              excerpt_en: summaries[i].excerpt_en,
              excerpt_zh: summaries[i].excerpt_zh,
              category: src.category,
              published_at_source: it.pubDate ? new Date(it.pubDate).toISOString() : null,
              status: "pending" as const,
            }));

            const { error: insErr } = await supabase
              .from("news_drafts")
              .insert(rows);
            if (insErr) { result.errors.push(`${src.name} insert: ${insErr.message}`); continue; }
            result.queued += rows.length;
          } catch (e: any) {
            result.errors.push(`${src.name}: ${e?.message ?? String(e)}`);
          }
        }

        return Response.json({ ok: true, ...result, ran_at: new Date().toISOString() });
      },
    },
  },
});
