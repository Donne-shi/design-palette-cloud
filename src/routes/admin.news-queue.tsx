import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ExternalLink, CheckCircle2, XCircle, RefreshCcw, Loader2, Star, Rocket } from "lucide-react";
import { slugify } from "@/lib/slug";

export const Route = createFileRoute("/admin/news-queue")({
  head: () => ({ meta: [{ title: "News Queue · Admin · MBI" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: NewsQueuePage,
});

type Draft = {
  id: string;
  source_name: string;
  source_url: string;
  original_title: string;
  title_en: string | null;
  title_zh: string | null;
  excerpt_en: string | null;
  excerpt_zh: string | null;
  category: string | null;
  fetched_at: string;
  published_at_source: string | null;
  status: "pending" | "published" | "ignored";
  relevance_score: number | null;
  relevance_reason: string | null;
  is_top_pick: boolean | null;
};

type FilterKey = "top" | "pending" | "published" | "ignored";

function NewsQueuePage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [scraping, setScraping] = useState(false);
  const [batchBusy, setBatchBusy] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("top");
  // Per-card local edits before publishing (keyed by draft id).
  const [edits, setEdits] = useState<Record<string, Partial<Draft>>>({});
  const editVal = (d: Draft, k: keyof Draft) => (edits[d.id]?.[k] as string | null | undefined) ?? (d[k] as any);
  const setEdit = (id: string, k: keyof Draft, v: string) =>
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], [k]: v } }));

  const load = async () => {
    setLoading(true);
    let q = supabase
      .from("news_drafts")
      .select("id,source_name,source_url,original_title,title_en,title_zh,excerpt_en,excerpt_zh,category,fetched_at,published_at_source,status,relevance_score,relevance_reason,is_top_pick");
    if (filter === "top") {
      q = q.eq("status", "pending").eq("is_top_pick", true);
    } else {
      q = q.eq("status", filter);
    }
    const { data, error } = await q
      .order("is_top_pick", { ascending: false })
      .order("relevance_score", { ascending: false, nullsFirst: false })
      .order("fetched_at", { ascending: false })
      .limit(100);
    if (error) toast.error(error.message);
    setDrafts((data as Draft[]) || []);
    setLoading(false);
  };

  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [filter]);

  const runScrape = async () => {
    setScraping(true);
    try {
      const anonKey = (import.meta as any).env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const r = await fetch("/api/public/cron/scrape-news", {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: anonKey },
        body: "{}",
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
      toast.success(`抓取完成：入队 ${j.queued} · 跳过 ${j.skipped} · 评分 ${j.scored ?? 0} · Top ${j.top_picks ?? 0}`);
      await load();
    } catch (e: any) {
      toast.error(`抓取失败：${e.message}`);
    } finally {
      setScraping(false);
    }
  };

  const publish = async (d: Draft) => {
    setBusyId(d.id);
    try {
      const title_zh = (d.title_zh || d.original_title).trim();
      const title_en = (d.title_en || d.original_title).trim();
      const excerpt_zh = (d.excerpt_zh || "").trim();
      const excerpt_en = (d.excerpt_en || "").trim();
      const body_en = `${excerpt_en}\n\n— Source: ${d.source_name}\n${d.source_url}`;
      const body_zh = `${excerpt_zh}\n\n— 来源：${d.source_name}\n${d.source_url}`;

      const baseSlug = slugify(title_en || title_zh) || `news-${d.id.slice(0, 8)}`;
      const slug = `${baseSlug}-${d.id.slice(0, 6)}`;

      const { data: art, error: insErr } = await supabase
        .from("articles")
        .insert({
          slug,
          title_zh,
          title_en,
          excerpt_zh,
          excerpt_en,
          body_zh,
          body_en,
          category: d.category || "News & Commentary",
          status: "published",
          published_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (insErr) throw insErr;

      const { error: upErr } = await supabase
        .from("news_drafts")
        .update({ status: "published", published_article_id: art!.id })
        .eq("id", d.id);
      if (upErr) throw upErr;

      toast.success("已发布到 News & Commentary");
      await load();
    } catch (e: any) {
      toast.error(`发布失败：${e.message}`);
    } finally {
      setBusyId(null);
    }
  };

  const ignore = async (d: Draft) => {
    setBusyId(d.id);
    const { error } = await supabase.from("news_drafts").update({ status: "ignored" }).eq("id", d.id);
    if (error) toast.error(error.message); else { toast.success("已忽略"); await load(); }
    setBusyId(null);
  };

  const restore = async (d: Draft) => {
    setBusyId(d.id);
    const { error } = await supabase.from("news_drafts").update({ status: "pending" }).eq("id", d.id);
    if (error) toast.error(error.message); else { toast.success("已恢复为待审"); await load(); }
    setBusyId(null);
  };

  const emptyLabel: Record<FilterKey, string> = {
    top: "本批没有 Top 5（请先点「手动抓取」或等待每日 cron）",
    pending: "暂无待审草稿",
    published: "暂无已发布",
    ignored: "暂无已忽略",
  };

  return (
    <div className="p-10">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="eyebrow mb-2">News Queue</p>
          <h1 className="serif text-4xl">RSS 抓取审核队列</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            每日定时从 Pew、Christianity Today、Religion News Service、The Gospel Coalition、Desiring God、World、First Things、Catholic News Agency、Vatican News
            抓取最新条目，AI 生成中英双语标题与摘要并按 MBI 定位（华人离散群体 / 信仰与公共生活 / 中西文化桥梁）打分 0–100，
            自动标记当批 <span className="text-accent font-medium">Top 5</span> 推荐。审核后一键发布到{" "}
            <Link to="/news" className="text-accent underline">News &amp; Commentary</Link>。
          </p>
        </div>
        <button
          onClick={runScrape}
          disabled={scraping}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 text-xs uppercase tracking-widest hover:bg-accent disabled:opacity-50"
        >
          {scraping ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          手动抓取
        </button>
      </div>

      <div className="mt-8 flex gap-2 text-xs uppercase tracking-widest flex-wrap">
        {(["top", "pending", "published", "ignored"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`border px-4 py-2 inline-flex items-center gap-2 ${filter === k ? "bg-foreground text-background border-foreground" : "border-border text-foreground/70 hover:border-accent"}`}
          >
            {k === "top" && <Star className="h-3 w-3" />}
            {k === "top" ? "Top 5 今日" : k === "pending" ? "全部待审" : k === "published" ? "已发布" : "已忽略"}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">加载中…</p>
        ) : drafts.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyLabel[filter]}。</p>
        ) : (
          drafts.map((d) => (
            <article key={d.id} className={`border bg-card p-6 ${d.is_top_pick ? "border-accent ring-1 ring-accent/30" : "border-border"}`}>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="eyebrow">{d.source_name} · {d.category || "—"}</p>
                  {d.is_top_pick && (
                    <span className="inline-flex items-center gap-1 bg-accent text-accent-foreground px-2 py-0.5 text-[10px] uppercase tracking-widest">
                      <Star className="h-3 w-3" /> Top Pick
                    </span>
                  )}
                  {typeof d.relevance_score === "number" && (
                    <span
                      className={`px-2 py-0.5 text-[10px] uppercase tracking-widest border ${
                        d.relevance_score >= 80
                          ? "border-accent text-accent"
                          : d.relevance_score >= 60
                            ? "border-foreground/40 text-foreground/70"
                            : "border-border text-muted-foreground"
                      }`}
                    >
                      MBI {d.relevance_score}
                    </span>
                  )}
                </div>
                <a href={d.source_url} target="_blank" rel="noreferrer" className="text-xs text-accent inline-flex items-center gap-1 hover:underline">
                  查看原文 <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <h2 className="serif text-2xl mt-2 leading-snug">{d.title_zh || d.original_title}</h2>
              {d.title_en && <p className="serif italic text-stone-warm mt-1">{d.title_en}</p>}
              {d.relevance_reason && (
                <p className="text-xs text-muted-foreground italic mt-2">编辑评分理由：{d.relevance_reason}</p>
              )}
              <div className="grid md:grid-cols-2 gap-6 mt-4 text-sm leading-relaxed text-foreground/80">
                <div>
                  <p className="eyebrow text-[10px] mb-1">中文摘要</p>
                  <p>{d.excerpt_zh || <span className="text-muted-foreground">（无）</span>}</p>
                </div>
                <div>
                  <p className="eyebrow text-[10px] mb-1">English summary</p>
                  <p>{d.excerpt_en || <span className="text-muted-foreground">(none)</span>}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                抓取于 {new Date(d.fetched_at).toLocaleString()}
                {d.published_at_source ? ` · 原文发布 ${new Date(d.published_at_source).toLocaleDateString()}` : ""}
              </p>
              <div className="mt-4 flex gap-2">
                {(filter === "pending" || filter === "top") && (
                  <>
                    <button
                      onClick={() => publish(d)}
                      disabled={busyId === d.id}
                      className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 text-xs uppercase tracking-widest hover:opacity-90 disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-4 w-4" /> 发布
                    </button>
                    <button
                      onClick={() => ignore(d)}
                      disabled={busyId === d.id}
                      className="inline-flex items-center gap-2 border border-border px-4 py-2 text-xs uppercase tracking-widest hover:border-destructive hover:text-destructive disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4" /> 忽略
                    </button>
                  </>
                )}
                {filter === "ignored" && (
                  <button onClick={() => restore(d)} disabled={busyId === d.id} className="border border-border px-4 py-2 text-xs uppercase tracking-widest hover:border-accent disabled:opacity-50">
                    恢复待审
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
