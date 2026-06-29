import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { useLang } from "@/lib/i18n";
import { BookMarked, Globe2, Home, Cpu, Landmark } from "lucide-react";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resources · MBI" },
      { name: "description", content: "Theology, mission, family education, AI & faith, and public issues research." },
      { property: "og:title", content: "Resources — MBI" },
      { property: "og:description", content: "Theology, mission, family education, AI & faith, public issues." },
      { property: "og:url", content: "/resources" },
    ],
    links: [{ rel: "canonical", href: "/resources" }],
  }),
  component: Resources,
});

function Resources() {
  const { t } = useLang();
  const cats = [
    { Icon: BookMarked, zh: "神学资源", en: "Theology" },
    { Icon: Globe2, zh: "宣教资源", en: "Mission" },
    { Icon: Home, zh: "家庭教育", en: "Family Education" },
    { Icon: Cpu, zh: "AI 与信仰", en: "AI & Faith" },
    { Icon: Landmark, zh: "公共议题研究", en: "Public Issues Research" },
  ];
  return (
    <SiteShell>
      <PageHero
        eyebrow="Resources"
        titleZh={t("可以阅读、可以下载、可以使用的资源。", "Resources to read, download, and put to use.")}
        titleEn={t("Resources to read, download, and put to use.", "可读、可下载、可使用。")}
        lead={t("PDF、视频、PPT、课程——为牧者、教师、家庭与一般读者预备的资源。", "PDFs, video, slides and courses for pastors, teachers, families and general readers.")}
      />
      <section className="container-prose py-20">
        <p className="eyebrow mb-6">{t("资源分类", "Categories")}</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cats.map(({ Icon, zh, en }) => (
            <div key={en} className="border border-border p-6">
              <Icon className="h-5 w-5 text-accent mb-3" />
              <h3 className="serif text-xl">{t(zh, en)}</h3>
              <p className="serif italic text-sm text-stone-warm mt-1">{t(en, zh)}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="container-prose pb-32 text-center">
        <p className="eyebrow mb-6 text-accent">Coming Soon</p>
        <h2 className="serif text-4xl md:text-5xl">{t("敬请期待", "Stay tuned")}</h2>
        <p className="mt-6 text-foreground/70 max-w-lg mx-auto">
          {t("资源素材正在整理中，第一批资料将很快上线。", "Materials are being curated — the first resources will be available soon.")}
        </p>
      </section>
    </SiteShell>
  );
}
