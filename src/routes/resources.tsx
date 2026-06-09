import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { useLang } from "@/lib/i18n";
import { BookMarked, Globe2, Home, Cpu, Landmark, FileText, Video, Presentation, GraduationCap, ArrowRight } from "lucide-react";

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
    { Icon: BookMarked, zh: "神学资源", en: "Theology", count: 42 },
    { Icon: Globe2, zh: "宣教资源", en: "Mission", count: 28 },
    { Icon: Home, zh: "家庭教育", en: "Family Education", count: 35 },
    { Icon: Cpu, zh: "AI 与信仰", en: "AI & Faith", count: 14 },
    { Icon: Landmark, zh: "公共议题研究", en: "Public Issues Research", count: 21 },
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
        {cats.map(({ Icon, ...c }) => (
          <article key={c.en} className="border border-border bg-card p-7 hover:border-accent transition-colors group">
            <div className="flex items-start justify-between">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-sm bg-accent/10 text-accent ring-1 ring-accent/30">
                <Icon className="h-6 w-6" />
              </span>
              <p className="eyebrow text-accent">{c.count} {t("项资源", "resources")}</p>
            </div>
            <h3 className="serif text-2xl mt-5">{t(c.zh, c.en)}</h3>
            <p className="serif italic text-stone-warm mt-1">{t(c.en, c.zh)}</p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs uppercase tracking-widest text-stone-warm">
              <span className="inline-flex items-center gap-1 border border-border px-2 py-1"><FileText className="h-3 w-3" /> PDF</span>
              <span className="inline-flex items-center gap-1 border border-border px-2 py-1"><Video className="h-3 w-3" /> Video</span>
              <span className="inline-flex items-center gap-1 border border-border px-2 py-1"><Presentation className="h-3 w-3" /> PPT</span>
              <span className="inline-flex items-center gap-1 border border-border px-2 py-1"><GraduationCap className="h-3 w-3" /> Course</span>
            </div>
            <p className="mt-6 inline-flex items-center gap-1.5 text-sm text-accent uppercase tracking-widest">{t("浏览","Browse")} <ArrowRight className="h-3.5 w-3.5" /></p>
          </article>
        ))}
      </section>
    </SiteShell>
  );
}
