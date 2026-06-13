import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { useLang } from "@/lib/i18n";
import { BookOpenText, FileDown, Archive } from "lucide-react";
import { listPublishedIssues, type PublicIssue } from "@/lib/content.functions";

export const Route = createFileRoute("/journal")({
  loader: () => listPublishedIssues(),
  head: () => ({
    meta: [
      { title: "电子期刊 · Bridge Quarterly — MBI" },
      { name: "description", content: "桥梁季刊 Bridge Quarterly：专题研究、神学文章、社会观察、文化评论、事工案例。" },
      { property: "og:title", content: "Bridge Quarterly — MBI" },
      { property: "og:description", content: "Quarterly long-form essays at the intersection of faith, culture, and public life." },
      { property: "og:url", content: "https://bridgeaway.org/journal" },
    ],
    links: [{ rel: "canonical", href: "https://bridgeaway.org/journal" }],
  }),
  errorComponent: ErrorView,
  component: JournalPage,
});

function JournalPage() {
  const { t, lang } = useLang();
  const issues = Route.useLoaderData() as PublicIssue[];
  const [latest, ...rest] = issues;

  return (
    <SiteShell>
      <PageHero
        eyebrow="Bridge Quarterly · 桥梁季刊"
        titleZh={t("每季度一次的认真阅读。", "A serious read, once a quarter.")}
        titleEn={t("A serious read, once a quarter.", "每季一次的认真阅读。")}
        lead={t("我们出版深度长文，回应当代教会与社会的根本问题。", "We publish long-form essays on the deep questions of church and society.")}
      />

      {latest ? (
        <section className="container-prose py-20 grid md:grid-cols-12 gap-12 items-start">
          <div className="md:col-span-5">
            {latest.cover_url ? (
              <img src={latest.cover_url} alt="" loading="lazy" className="w-full aspect-[3/4] object-cover shadow-[0_30px_60px_-30px_rgba(45,36,24,0.35)]" />
            ) : (
              <div className="w-full aspect-[3/4] bg-secondary border border-border grid place-items-center text-stone-warm serif italic">No cover</div>
            )}
            <div className="mt-6 flex gap-3 flex-wrap">
              <Link to="/journal/$id" params={{ id: latest.id }} className="inline-flex items-center gap-1.5 bg-accent text-accent-foreground px-5 py-2.5 text-sm tracking-widest uppercase">
                <BookOpenText className="h-4 w-4" /> {t("阅读本期", "Read issue")}
              </Link>
              {latest.pdf_url && (
                <a href={latest.pdf_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 border border-input px-5 py-2.5 text-sm tracking-widest uppercase">
                  <FileDown className="h-4 w-4" /> PDF
                </a>
              )}
            </div>
          </div>
          <div className="md:col-span-7">
            <p className="eyebrow mb-3">Vol.{latest.volume} · Issue {latest.issue_number}{latest.published_at && ` · ${new Date(latest.published_at).toLocaleDateString()}`}</p>
            <h2 className="serif text-4xl md:text-5xl leading-tight">{lang === "en" ? latest.title_en || latest.title_zh : latest.title_zh}</h2>
            {(latest.summary_zh || latest.summary_en) && (
              <p className="mt-6 text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {lang === "en" ? latest.summary_en || latest.summary_zh : latest.summary_zh || latest.summary_en}
              </p>
            )}
          </div>
        </section>
      ) : (
        <section className="container-prose py-20">
          <p className="text-muted-foreground">{t("尚未发布任何期次。", "No issues published yet.")}</p>
        </section>
      )}

      {rest.length > 0 && (
        <section className="bg-secondary/40 border-y border-border/70 py-20">
          <div className="container-prose">
            <p className="eyebrow mb-3 flex items-center gap-2"><Archive className="h-4 w-4 text-accent" /> Archive · 往期</p>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
              {rest.map((iss) => (
                <Link key={iss.id} to="/journal/$id" params={{ id: iss.id }} className="border border-border bg-card p-6 hover:border-accent transition-colors block">
                  <p className="text-xs uppercase tracking-widest text-stone-warm">Vol.{iss.volume} · Issue {iss.issue_number}</p>
                  <p className="serif text-xl mt-2">{lang === "en" ? iss.title_en || iss.title_zh : iss.title_zh}</p>
                  {iss.published_at && <p className="serif italic text-sm text-stone-warm mt-1">{new Date(iss.published_at).toLocaleDateString()}</p>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
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
