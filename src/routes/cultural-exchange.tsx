import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { useLang } from "@/lib/i18n";
import eventImg from "@/assets/event.jpg";

export const Route = createFileRoute("/cultural-exchange")({
  head: () => ({
    meta: [
      { title: "文化交流 · Cultural Exchange — MBI" },
      { name: "description", content: "论坛、讲座、青年培训、国际学生交流、教会参访、宣教分享。" },
      { property: "og:title", content: "Cultural Exchange — MBI" },
      { property: "og:description", content: "Forums, lectures, youth training, student exchange, mission gatherings." },
      { property: "og:url", content: "/cultural-exchange" },
    ],
    links: [{ rel: "canonical", href: "/cultural-exchange" }],
  }),
  component: ExchangePage,
});

const events = [
  { zh: "中美文化交流论坛", en: "U.S.–China Cultural Forum", date: "Jul 12, 2026", place: "Boston, MA", status: "open" },
  { zh: "青年领袖暑期培训", en: "Youth Leadership Summer", date: "Aug 04, 2026", place: "Online", status: "soon" },
  { zh: "国际学生秋季交流", en: "International Students Autumn Meet", date: "Sep 20, 2026", place: "Pasadena, CA", status: "open" },
  { zh: "线上讲座：跨文化宣教伦理", en: "Lecture: Ethics of Cross-cultural Mission", date: "Oct 03, 2026", place: "Online", status: "soon" },
  { zh: "教会参访（费城）", en: "Church Visit — Philadelphia", date: "Oct 18, 2026", place: "Philadelphia, PA", status: "soon" },
  { zh: "年度宣教分享会", en: "Annual Mission Gathering", date: "Nov 14, 2026", place: "Atlanta, GA", status: "open" },
];

const statusLabel = (s: string, t: (zh: string, en: string) => string) =>
  s === "open" ? t("报名中", "Open") : s === "soon" ? t("即将开始", "Coming soon") : t("已结束", "Closed");

function ExchangePage() {
  const { t } = useLang();
  return (
    <SiteShell>
      <PageHero
        eyebrow="Cultural Exchange · 文化交流"
        titleZh={t("让对话在真实空间发生。", "Where conversations happen in real space.")}
        titleEn={t("Where conversations happen.", "让对话发生。")}
        lead={t("我们组织论坛、讲座、青年培训、国际学生交流、教会参访与宣教分享，建立跨文化、跨教会、跨领域的关系网络。", "We host forums, lectures, youth training, student exchange, church visits, and mission gatherings — building cross-cultural, cross-church, cross-discipline networks.")}
      />
      <section className="container-prose py-20 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((e, i) => (
          <article key={i} className="border border-border bg-card hover:border-accent transition-colors">
            <div className="aspect-[16/10] overflow-hidden">
              <img src={eventImg} alt="" loading="lazy" width={1280} height={896} className="h-full w-full object-cover" />
            </div>
            <div className="p-6">
              <p className="text-xs uppercase tracking-widest text-accent">{statusLabel(e.status, t)}</p>
              <h3 className="serif text-2xl mt-2 leading-snug">{t(e.zh, e.en)}</h3>
              <p className="serif italic text-sm text-stone-warm mt-1">{t(e.en, e.zh)}</p>
              <div className="mt-5 pt-5 border-t border-border flex items-center justify-between text-sm">
                <span>{e.date}</span><span className="text-stone-warm">{e.place}</span>
              </div>
              <button className="mt-5 text-sm uppercase tracking-widest text-accent">{t("报名 / 了解", "Register / Learn")} →</button>
            </div>
          </article>
        ))}
      </section>
    </SiteShell>
  );
}
