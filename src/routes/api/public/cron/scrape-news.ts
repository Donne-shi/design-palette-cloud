import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

// Cron-invoked endpoint. Verified by Supabase anon key in `apikey` header.
// /api/public/* bypasses Lovable's published-site auth, so this handler must
// authenticate itself.

type Source = { name: string; url: string; category: string };

// Sources curated for Multicultural Bridge Initiative — Protestant /
// evangelical, Gospel-centered, cross-cultural (East/West, Chinese diaspora),
// faith & public life. Catholic-internal outlets are intentionally excluded.
const SOURCES: Source[] = [
  { name: "Pew Research — Religion", url: "https://www.pewresearch.org/religion/feed/", category: "Society & Research" },
  { name: "Christianity Today", url: "https://www.christianitytoday.com/feed/", category: "U.S. Church" },
  { name: "Religion News Service", url: "https://religionnews.com/feed/", category: "Global Christianity" },
  { name: "The Gospel Coalition", url: "https://www.thegospelcoalition.org/feed/", category: "Theology & Culture" },
  { name: "Desiring God", url: "https://feeds.feedburner.com/DesiringGodBlog", category: "Discipleship" },
  { name: "9Marks", url: "https://www.9marks.org/feed/", category: "Church & Ministry" },
  { name: "Albert Mohler", url: "https://albertmohler.com/feed", category: "Theology & Culture" },
  { name: "Challies", url: "https://www.challies.com/feed/", category: "Discipleship" },
  { name: "Christian Headlines", url: "https://www.christianheadlines.com/rss-feed/", category: "Global Christianity" },
  { name: "Evangelical Focus", url: "https://www.evangelicalfocus.com/rss", category: "Global Christianity" },
  { name: "First Things", url: "https://www.firstthings.com/feed", category: "Faith & Public Life" },
];

const PER_SOURCE_LIMIT = 6;
const TOP_PICKS = 5;

type RssItem = { title: string; link: string; description: string; pubDate: string | null };

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

async function callAI(apiKey: string, system: string, user: string): Promise<any> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`AI call failed: ${res.status} ${t.slice(0, 200)}`);
  }
  const j: any = await res.json();
  const content = j?.choices?.[0]?.message?.content ?? "{}";
  try { return JSON.parse(content); } catch { return {}; }
}

async function summarizeBatch(apiKey: string, items: { title: string; description: string }[]): Promise<Summary[]> {
  const sys = `You are a bilingual (English / Simplified Chinese) editor for Multicultural Bridge Initiative (MBI), a Gospel-centered, cross-cultural Christian publication serving Chinese diaspora and Western readers. For each news item provided, write:
- title_en: a clean editorial English headline (max 90 chars)
- title_zh: a faithful Chinese headline (中文，最长 40 字)
- excerpt_en: a neutral 120–150 word English summary suitable for editorial preview
- excerpt_zh: 120–180 字的中文摘要

Be accurate and neutral; never invent facts. Preserve proper nouns. Do NOT translate "Multicultural Bridge Initiative" or "MBI".
Return STRICT JSON: {"summaries":[{title_en,title_zh,excerpt_en,excerpt_zh}, ...]} with exactly ${items.length} items in the same order. No prose outside JSON.`;
  const user = JSON.stringify({ items: items.map((it) => ({ title: it.title, source_text: it.description })) });
  const parsed = await callAI(apiKey, sys, user);
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

type ScoreOut = { id: string; score: number; reason: string };

async function scoreForMBI(
  apiKey: string,
  items: { id: string; title_en: string; excerpt_en: string; source_name: string; category: string | null }[],
): Promise<ScoreOut[]> {
  const sys = `You are the senior editor of Multicultural Bridge Initiative (MBI). MBI is a **Protestant, evangelical** publication. MBI's positioning:
- Gospel-centered, evangelical Protestant perspective (NOT Roman Catholic, NOT Eastern Orthodox)
- Serving the global Chinese diaspora and bridging East ↔ West
- Faith & public life: church, religion in society, religious liberty, ethics, family
- Cultural exchange between Chinese & Western Protestant Christianity
- Reformed / evangelical theology, discipleship, missions, intercultural ministry

Score each news item 0–100 for how important and on-mission it is for MBI's evangelical Protestant readers TODAY:
- 90–100: must-publish, directly central to MBI mission (Chinese church, diaspora faith, major global evangelical / Protestant event, landmark religion-and-public-life story)
- 70–89: highly relevant
- 40–69: tangentially relevant
- 0–39: off-mission, skip

HARD PENALTIES (cap score at 25):
- Catholic-internal church politics: Pope, Vatican, Holy See, Synod of Bishops, Cardinals, Curia, Roman Catholic diocese affairs, canonization, Marian devotion, papal liturgy. MBI does not cover internal Catholic governance.
- Eastern Orthodox internal affairs (patriarchs, synods) unless directly tied to persecution or East-West relations.
- Hyper-local U.S. parish news, celebrity gossip, narrow denominational squabbles.

REWARD (push toward 80+):
- China, Hong Kong, Taiwan, Asian diaspora, Chinese house church, overseas Chinese ministry
- Persecution of Christians, religious liberty, missions
- Major shifts in global evangelicalism, Reformed theology, biblical scholarship
- Cross-cultural ministry, intercultural church planting, immigrant churches

Note: an item about Catholics that is fundamentally about religious liberty, persecution, or China policy CAN still score high — judge by the actual substance, not the actor.

Return STRICT JSON: {"scores":[{"id":"...","score":0-100,"reason":"<=20 words, English"}, ...]} for every input id, no prose outside JSON.`;
  const user = JSON.stringify({
    items: items.map((it) => ({
      id: it.id,
      source: it.source_name,
      category: it.category,
      title: it.title_en,
      excerpt: it.excerpt_en.slice(0, 400),
    })),
  });
  const parsed = await callAI(apiKey, sys, user);
  const arr: any[] = Array.isArray(parsed?.scores) ? parsed.scores : [];
  const byId = new Map<string, ScoreOut>();
  for (const s of arr) {
    if (typeof s?.id === "string") {
      const score = Math.max(0, Math.min(100, Math.round(Number(s.score) || 0)));
      byId.set(s.id, { id: s.id, score, reason: typeof s.reason === "string" ? s.reason.slice(0, 240) : "" });
    }
  }
  return items.map((it) => byId.get(it.id) ?? { id: it.id, score: 0, reason: "" });
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

        const result = {
          fetched: 0,
          queued: 0,
          skipped: 0,
          scored: 0,
          top_picks: 0,
          errors: [] as string[],
        };

        const insertedIds: string[] = [];

        for (const src of SOURCES) {
          try {
            const r = await fetch(src.url, {
              headers: {
                "user-agent":
                  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                accept: "application/rss+xml, application/atom+xml, application/xml;q=0.9, */*;q=0.8",
              },
            });
            if (!r.ok) { result.errors.push(`${src.name}: HTTP ${r.status}`); continue; }
            const xml = await r.text();
            const items = parseRss(xml).slice(0, PER_SOURCE_LIMIT);
            result.fetched += items.length;
            if (items.length === 0) continue;

            const urls = items.map((it) => it.link);
            const { data: existing } = await supabase
              .from("news_drafts")
              .select("source_url")
              .in("source_url", urls);
            const seen = new Set((existing ?? []).map((e: any) => e.source_url));
            const fresh = items.filter((it) => !seen.has(it.link));
            result.skipped += items.length - fresh.length;
            if (fresh.length === 0) continue;

            const summaries = await summarizeBatch(
              lovableKey,
              fresh.map((f) => ({ title: f.title, description: f.description })),
            );

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

            const { data: inserted, error: insErr } = await supabase
              .from("news_drafts")
              .insert(rows)
              .select("id");
            if (insErr) { result.errors.push(`${src.name} insert: ${insErr.message}`); continue; }
            result.queued += rows.length;
            for (const row of inserted ?? []) insertedIds.push((row as any).id);
          } catch (e: any) {
            result.errors.push(`${src.name}: ${e?.message ?? String(e)}`);
          }
        }

        // ===== Second pass: score newly-inserted drafts for MBI relevance =====
        if (insertedIds.length > 0) {
          try {
            const { data: toScore } = await supabase
              .from("news_drafts")
              .select("id,source_name,category,title_en,excerpt_en")
              .in("id", insertedIds);
            const list = (toScore ?? []) as any[];
            if (list.length > 0) {
              const scores = await scoreForMBI(lovableKey, list.map((d) => ({
                id: d.id,
                title_en: d.title_en || "",
                excerpt_en: d.excerpt_en || "",
                source_name: d.source_name,
                category: d.category,
              })));
              const scoredAt = new Date().toISOString();

              // Update each row's score
              await Promise.all(
                scores.map((s) =>
                  supabase
                    .from("news_drafts")
                    .update({ relevance_score: s.score, relevance_reason: s.reason, scored_at: scoredAt })
                    .eq("id", s.id),
                ),
              );
              result.scored = scores.length;

              // Mark TOP_PICKS highest-scoring as is_top_pick (only within today's batch)
              const top = [...scores].sort((a, b) => b.score - a.score).slice(0, TOP_PICKS).map((s) => s.id);
              if (top.length > 0) {
                const { error: tpErr } = await supabase
                  .from("news_drafts")
                  .update({ is_top_pick: true })
                  .in("id", top);
                if (tpErr) result.errors.push(`top_pick: ${tpErr.message}`);
                else result.top_picks = top.length;
              }
            }
          } catch (e: any) {
            result.errors.push(`scoring: ${e?.message ?? String(e)}`);
          }
        }

        return Response.json({ ok: true, ...result, ran_at: new Date().toISOString() });
      },
    },
  },
});
