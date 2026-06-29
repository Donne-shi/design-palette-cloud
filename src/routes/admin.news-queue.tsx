import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ExternalLink, CheckCircle2, XCircle, RefreshCcw, Loader2 } from "lucide-react";
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
};

function NewsQueuePage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [scraping, setScraping] = useState(false);
  const [filter, setFilter] = useState<"pending" | "published" | "ignored">("pending");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("news_drafts")
      .select("id,source_name,source_url,original_title,title_en,title_zh,excerpt_en,excerpt_zh,category,fetched_at,published_at_source,status")
      .eq("status", filter)
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
      toast.success(`抓取完成：新入队 ${j.queued} 条，跳过 ${j.skipped} 条`);
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

  return (
    <div className="p-10">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="eyebrow mb-2">News Queue</p>
          <h1 className="serif text-4xl">RSS 抓取审核队列</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            每天定时从 Pew、Christianity Today、Religion News Service 抓取最新条目，AI 自动生成中英双语标题与摘要，
            审核后一键发布到 <Link to="/news" className="text-accent underline">News &amp; Commentary</Link>。
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

      <div className="mt-8 flex gap-2 text-xs uppercase tracking-widest">
        {(["pending", "published", "ignored"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`border px-4 py-2 ${filter === k ? "bg-foreground text-background border-foreground" : "border-border text-foreground/70 hover:border-accent"}`}
          >
            {k === "pending" ? "待审 Pending" : k === "published" ? "已发布 Published" : "已忽略 Ignored"}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">加载中…</p>
        ) : drafts.length === 0 ? (
          <p className="text-sm text-muted-foreground">暂无{filter === "pending" ? "待审" : filter === "published" ? "已发布" : "已忽略"}的草稿。</p>
        ) : (
          drafts.map((d) => (
            <article key={d.id} className="border border-border bg-card p-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <p className="eyebrow">{d.source_name} · {d.category || "—"}</p>
                <a href={d.source_url} target="_blank" rel="noreferrer" className="text-xs text-accent inline-flex items-center gap-1 hover:underline">
                  查看原文 <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <h2 className="serif text-2xl mt-2 leading-snug">{d.title_zh || d.original_title}</h2>
              {d.title_en && <p className="serif italic text-stone-warm mt-1">{d.title_en}</p>}
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
                {filter === "pending" && (
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
