import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "资源中心 · Resources — MBI" },
      { name: "description", content: "神学、宣教、家庭教育、AI与信仰、公共议题研究等资源。" },
      { property: "og:title", content: "Resources — MBI" },
      { property: "og:description", content: "Theology, mission, family education, AI & faith, public issues — PDFs, video, slides, courses." },
      { property: "og:url", content: "/resources" },
    ],
    links: [{ rel: "canonical", href: "/resources" }],
  }),
  component: Resources,
});

function Resources() {
  const { t } = useLang();
  const cats = [
    { zh: "神学资源", en: "Theology", count: 42 },
    { zh: "宣教资源", en: "Mission", count: 28 },
    { zh: "家庭教育", en: "Family Education", count: 35 },
    { zh: "AI 与信仰", en: "AI & Faith", count: 14 },
    { zh: "公共议题研究", en: "Public Issues Research", count: 21 },
  ];
  return (
    <SiteShell>
      <PageHero
        eyebrow="Resources · 资源中心"
        titleZh={t("可以阅读、可以下载、可以使用的资源。", "Resources to read, download, and put to use.")}
        titleEn={t("Resources to read, download, and put to use.", "可读、可下载、可使用。")}
        lead={t("PDF、视频、PPT、课程——为牧者、教师、家庭与一般读者预备的资源。", "PDFs, video, slides, and courses for pastors, teachers, families, and general readers.")}
      />
      <section className="container-prose py-20 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cats.map((c) => (
          <article key={c.en} className="border border-border bg-card p-7 hover:border-accent transition-colors group">
            <p className="eyebrow text-accent">{c.count} {t("项资源", "resources")}</p>
            <h3 className="serif text-2xl mt-3">{t(c.zh, c.en)}</h3>
            <p className="serif italic text-stone-warm mt-1">{t(c.en, c.zh)}</p>
            <div className="mt-6 flex gap-2 text-xs uppercase tracking-widest text-stone-warm">
              <span className="border border-border px-2 py-1">PDF</span>
              <span className="border border-border px-2 py-1">Video</span>
              <span className="border border-border px-2 py-1">PPT</span>
              <span className="border border-border px-2 py-1">Course</span>
            </div>
            <p className="mt-6 text-sm text-accent uppercase tracking-widest">{t("浏览","Browse")} →</p>
          </article>
        ))}
      </section>
    </SiteShell>
  );
}
