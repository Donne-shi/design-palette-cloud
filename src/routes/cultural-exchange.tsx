import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/cultural-exchange")({
  head: () => ({
    meta: [
      { title: "Cultural Exchange · MBI" },
      { name: "description", content: "Forums, lectures, youth training, student exchange, church visits, and mission gatherings." },
      { property: "og:title", content: "Cultural Exchange — MBI" },
      { property: "og:description", content: "Forums, lectures, youth training, student exchange, mission gatherings." },
      { property: "og:url", content: "/cultural-exchange" },
    ],
    links: [{ rel: "canonical", href: "/cultural-exchange" }],
  }),
  component: ExchangePage,
});

function ExchangePage() {
  const { t } = useLang();
  return (
    <SiteShell>
      <PageHero
        eyebrow="Cultural Exchange"
        titleZh={t("让对话在真实空间发生。", "Where conversations happen in real space.")}
        titleEn={t("Where conversations happen.", "让对话发生。")}
        lead={t("我们将组织论坛、讲座、青年培训、国际学生交流、教会参访与宣教分享，建立跨文化、跨教会、跨领域的关系网络。", "We will host forums, lectures, youth training, student exchange, church visits, and mission gatherings — building cross-cultural, cross-church, cross-discipline networks.")}
      />
      <section className="container-prose py-32 text-center">
        <p className="eyebrow mb-6 text-accent">Coming Soon</p>
        <h2 className="serif text-4xl md:text-5xl">{t("敬请期待", "Stay tuned")}</h2>
        <p className="mt-6 text-foreground/70 max-w-lg mx-auto">
          {t("活动安排正在筹备中，第一批文化交流活动将很快公布。", "Our first cultural exchange events are in preparation and will be announced soon.")}
        </p>
      </section>
    </SiteShell>
  );
}
