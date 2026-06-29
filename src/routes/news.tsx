import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { useLang } from "@/lib/i18n";

import { CalendarDays, Tag } from "lucide-react";
import { listPublishedArticles, type PublicArticle } from "@/lib/content.functions";
import { useState } from "react";

export const Route = createFileRoute("/news")({
  loader: () => listPublishedArticles(),
  head: () => ({
    meta: [
      { title: "新闻与评论 · News & Commentary — MBI" },
      { name: "description", content: "美国基督教动态、社会议题观察、国际基督教新闻——以福音视角回应时代。" },
      { property: "og:title", content: "News & Commentary — MBI" },
      { property: "og:description", content: "U.S. church news, society, and global Christianity — through a Gospel lens." },
      { property: "og:url", content: "https://bridgeaway.org/news" },
    ],
    links: [{ rel: "canonical", href: "https://bridgeaway.org/news" }],
  }),
  errorComponent: ErrorView,
  component: NewsPage,
});

function NewsPage() {
  const { t, lang } = useLang();
  const articles = Route.useLoaderData() as PublicArticle[];
  const cats = Array.from(new Set(articles.map((a) => a.category).filter(Boolean)));
  const [active, setActive] = useState<string>("__all");
  const filtered = active === "__all" ? articles : articles.filter((a) => a.category === active);

  return (
    <SiteShell>
      <PageHero
        eyebrow="News & Commentary"
        titleZh={t("新闻与评论", "Voices on the day's issues")}
        titleEn={t("Voices on the day's issues", "新闻与评论")}
        lead={t("我们以福音视角，关注美国基督教动态、当代社会议题与国际基督教新闻。", "Through a Gospel lens — U.S. church news, contemporary issues, and global Christianity.")}
      />
      <section className="container-prose py-20">
        {cats.length > 0 && (
          <div className="flex gap-3 flex-wrap mb-12 text-xs uppercase tracking-widest">
            <button onClick={() => setActive("__all")} className={`border px-4 py-2 ${active === "__all" ? "bg-foreground text-background border-foreground" : "border-border text-foreground/70 hover:border-accent hover:text-accent"}`}>{t("全部", "All")}</button>
            {cats.map((c) => (
              <button key={c} onClick={() => setActive(c)} className={`border px-4 py-2 ${active === c ? "bg-foreground text-background border-foreground" : "border-border text-foreground/70 hover:border-accent hover:text-accent"}`}>{c}</button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <p className="text-muted-foreground">{t("暂无文章。请稍后再来。", "No articles yet — please check back soon.")}</p>
        ) : (
          <ul className="divide-y divide-border/70">
            {filtered.map((a) => {
              const title = lang === "en" ? a.title_en || a.title_zh : a.title_zh;
              const sub = lang === "en" ? a.title_zh : a.title_en;
              const excerpt = lang === "en" ? a.excerpt_en || a.excerpt_zh : a.excerpt_zh || a.excerpt_en;
              const date = new Date(a.published_at || a.created_at).toLocaleDateString();
              return (
                <li key={a.id} className="py-8 first:pt-0">
                  <Link to="/news/$slug" params={{ slug: a.slug || a.id }} className="group block">
                    <p className="eyebrow inline-flex items-center gap-4 text-foreground/60">
                      {a.category && <span className="inline-flex items-center gap-1"><Tag className="h-3 w-3 text-accent" />{a.category}</span>}
                      <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3 text-accent" />{date}</span>
                    </p>
                    <h3 className="serif text-2xl md:text-3xl mt-2 leading-snug group-hover:text-accent transition-colors">{title}</h3>
                    {sub && <p className="serif italic text-base text-stone-warm mt-1">{sub}</p>}
                    {excerpt && <p className="mt-3 text-[0.95rem] text-foreground/75 leading-relaxed line-clamp-3 max-w-3xl">{excerpt}</p>}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </SiteShell>
  );
}

function ErrorView({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <SiteShell>
      <div className="container-prose py-24 text-center">
        <h1 className="serif text-2xl">加载失败 · Failed to load</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-6 bg-accent text-accent-foreground px-4 py-2 text-sm uppercase tracking-wider">Try again</button>
      </div>
    </SiteShell>
  );
}
