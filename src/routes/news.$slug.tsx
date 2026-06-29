import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { getArticleBySlug, type PublicArticle } from "@/lib/content.functions";
import { useLang } from "@/lib/i18n";
import { CalendarDays, Tag, ArrowLeft, ExternalLink } from "lucide-react";
import { CommentsSection } from "@/components/site/Comments";

// Strip the auto-appended "— Source: <name>\n<url>" / "— 来源：<name>\n<url>" tail
// from scraped article bodies and surface it as a structured "Read Original" link.
function extractSource(body: string | null | undefined): { body: string; sourceUrl: string | null; sourceName: string | null } {
  if (!body) return { body: "", sourceUrl: null, sourceName: null };
  const re = /\n+\s*(?:—|--)\s*(?:Source|来源)\s*[:：]\s*([^\n]+?)\n+(https?:\/\/\S+)\s*$/i;
  const m = body.match(re);
  if (!m) return { body, sourceUrl: null, sourceName: null };
  return { body: body.slice(0, m.index).trimEnd(), sourceName: m[1].trim(), sourceUrl: m[2].trim() };
}

// Minimal, safe inline-markdown renderer: paragraphs + **bold** + *italic* + [text](url).
function renderBody(text: string) {
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const inline = (s: string) => {
    const parts: Array<string | JSX.Element> = [];
    const regex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
    let last = 0; let m: RegExpExecArray | null; let i = 0;
    while ((m = regex.exec(s))) {
      if (m.index > last) parts.push(s.slice(last, m.index));
      if (m[2]) parts.push(<a key={i++} href={m[2]} target="_blank" rel="noreferrer" className="text-accent underline underline-offset-4 hover:opacity-80">{m[1]}</a>);
      else if (m[3]) parts.push(<strong key={i++}>{m[3]}</strong>);
      else if (m[4]) parts.push(<em key={i++}>{m[4]}</em>);
      last = regex.lastIndex;
    }
    if (last < s.length) parts.push(s.slice(last));
    return parts;
  };
  return paragraphs.map((p, idx) => (
    <p key={idx} className="mb-5 whitespace-pre-wrap">{inline(p)}</p>
  ));
}

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
        <CommentsSection articleId={a.id} />
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
