import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { getArticleBySlug, type PublicArticle } from "@/lib/content.functions";
import { useLang } from "@/lib/i18n";
import { CalendarDays, Tag, ArrowLeft } from "lucide-react";

const SITE = "https://bridgeaway.org";

export const Route = createFileRoute("/news/$slug")({
  loader: async ({ params }) => {
    const article = await getArticleBySlug({ data: { slug: params.slug } });
    if (!article) throw notFound();
    return article;
  },
  head: ({ params, loaderData }) => {
    const a = loaderData as PublicArticle | undefined;
    const title = a?.title_zh ?? "文章 · Article";
    const desc = a?.excerpt_zh ?? a?.excerpt_en ?? a?.title_en ?? "Multicultural Bridge Initiative article.";
    const url = `${SITE}/news/${params.slug}`;
    return {
      meta: [
        { title: `${title} — MBI` },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        ...(a?.cover_url ? [{ property: "og:image", content: a.cover_url }, { name: "twitter:image", content: a.cover_url }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: a
        ? [{
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              headline: a.title_zh,
              alternativeHeadline: a.title_en ?? undefined,
              description: desc,
              image: a.cover_url ?? undefined,
              datePublished: a.published_at ?? a.created_at,
              articleSection: a.category,
              mainEntityOfPage: url,
            }),
          }]
        : [],
    };
  },
  errorComponent: ErrorView,
  notFoundComponent: NotFoundView,
  component: ArticleDetail,
});

function ArticleDetail() {
  const a = Route.useLoaderData() as PublicArticle;
  const { t, lang } = useLang();
  const body = lang === "en" ? a.body_en || a.body_zh : a.body_zh || a.body_en;
  const title = lang === "en" ? a.title_en || a.title_zh : a.title_zh;
  const subtitle = lang === "en" ? a.title_zh : a.title_en;
  const date = new Date(a.published_at || a.created_at).toLocaleDateString();
  const words = (body || "").replace(/\s+/g, "").length;
  const readMin = Math.max(1, Math.round(words / 400));

  return (
    <SiteShell>
      <article className="container-prose py-16 md:py-24 max-w-3xl">
        <Link to="/news" className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-stone-warm hover:text-accent">
          <ArrowLeft className="h-3 w-3" /> {t("返回新闻", "Back to News")}
        </Link>
        <p className="eyebrow mt-6 inline-flex items-center gap-3">
          <span className="inline-flex items-center gap-1"><Tag className="h-3 w-3 text-accent" />{a.category}</span>
          <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3 text-accent" />{date}</span>
          <span>· {readMin} {t("分钟阅读", "min read")}</span>
        </p>
        <h1 className="serif text-4xl md:text-5xl mt-3 leading-tight">{title}</h1>
        {subtitle && <p className="serif italic text-stone-warm mt-2 text-lg">{subtitle}</p>}
        {a.cover_url && (
          <img src={a.cover_url} alt="" className="mt-10 w-full aspect-[16/9] object-cover" />
        )}
        <div className="prose-content mt-10 serif text-lg leading-relaxed text-foreground/85 whitespace-pre-wrap">
          {body || <p className="text-muted-foreground italic">{t("正文待编辑。", "Body coming soon.")}</p>}
        </div>
      </article>
    </SiteShell>
  );
}

function NotFoundView() {
  return (
    <SiteShell>
      <div className="container-prose py-24 text-center">
        <p className="eyebrow mb-3">404</p>
        <h1 className="serif text-3xl">文章未找到 · Article not found</h1>
        <Link to="/news" className="inline-block mt-6 bg-accent text-accent-foreground px-4 py-2 text-sm uppercase tracking-wider">返回 News</Link>
      </div>
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
