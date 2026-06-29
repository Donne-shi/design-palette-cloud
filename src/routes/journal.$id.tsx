import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { getIssueById, type PublicIssue } from "@/lib/content.functions";
import { useLang } from "@/lib/i18n";
import { ArrowLeft, FileDown, BookOpenText } from "lucide-react";

const SITE = "https://bridgeaway.org";

export const Route = createFileRoute("/journal/$id")({
  loader: async ({ params }) => {
    const issue = await getIssueById({ data: { id: params.id } });
    if (!issue) throw notFound();
    return issue;
  },
  head: ({ params, loaderData }) => {
    const i = loaderData as PublicIssue | undefined;
    const title = i ? `Vol.${i.volume} · Issue ${i.issue_number} — ${i.title_zh}` : "Bridge Quarterly";
    const desc = i?.summary_zh ?? i?.summary_en ?? "Bridge Quarterly — long-form essays from Multicultural Bridge Initiative.";
    const url = `${SITE}/journal/${params.id}`;
    return {
      meta: [
        { title: `${title} — MBI` },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        ...(i?.cover_url ? [{ property: "og:image", content: i.cover_url }, { name: "twitter:image", content: i.cover_url }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  errorComponent: ErrorView,
  notFoundComponent: NotFoundView,
  component: IssueDetail,
});

function IssueDetail() {
  const i = Route.useLoaderData() as PublicIssue;
  const { t, lang } = useLang();
  const title = lang === "en" ? i.title_en || i.title_zh : i.title_zh;
  const summary = lang === "en" ? i.summary_en || i.summary_zh : i.summary_zh || i.summary_en;

  return (
    <SiteShell>
      <section className="container-prose py-16 md:py-24 grid md:grid-cols-12 gap-12 items-start">
        <div className="md:col-span-5">
          <Link to="/journal" className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-stone-warm hover:text-accent mb-6">
            <ArrowLeft className="h-3 w-3" /> {t("往期目录", "Back to issues")}
          </Link>
          {i.cover_url ? (
            <img src={i.cover_url} alt="" className="w-full aspect-[3/4] object-cover shadow-[0_30px_60px_-30px_rgba(45,36,24,0.35)]" />
          ) : (
            <div className="w-full aspect-[3/4] bg-secondary border border-border grid place-items-center text-stone-warm serif italic">No cover</div>
          )}
          <div className="mt-6 flex gap-3 flex-wrap">
            {i.pdf_url && (
              <a href={i.pdf_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 bg-accent text-accent-foreground px-5 py-2.5 text-sm tracking-widest uppercase">
                <FileDown className="h-4 w-4" /> PDF
              </a>
            )}
            <button className="inline-flex items-center gap-1.5 border border-input px-5 py-2.5 text-sm tracking-widest uppercase">
              <BookOpenText className="h-4 w-4" /> {t("网页阅读", "Read online")}
            </button>
          </div>
        </div>
        <div className="md:col-span-7">
          <p className="eyebrow mb-3">Vol.{i.volume} · Issue {i.issue_number} {i.published_at && `· ${new Date(i.published_at).toLocaleDateString()}`}</p>
          <h1 className="serif text-4xl md:text-5xl leading-tight">{title}</h1>
          {summary && <p className="mt-6 text-foreground/80 leading-relaxed whitespace-pre-wrap">{summary}</p>}
        </div>
      </section>
    </SiteShell>
  );
}

function NotFoundView() {
  return (
    <SiteShell>
      <div className="container-prose py-24 text-center">
        <p className="eyebrow mb-3">404</p>
        <h1 className="serif text-3xl">Issue not found</h1>
        <Link to="/journal" className="inline-block mt-6 bg-accent text-accent-foreground px-4 py-2 text-sm uppercase tracking-wider">Bridge Quarterly</Link>
      </div>
    </SiteShell>
  );
}

function ErrorView({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <SiteShell>
      <div className="container-prose py-24 text-center">
        <h1 className="serif text-2xl">Failed to load</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-6 bg-accent text-accent-foreground px-4 py-2 text-sm uppercase tracking-wider">Try again</button>
      </div>
    </SiteShell>
  );
}
