import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { useLang } from "@/lib/i18n";
import { Landmark, MessageSquareQuote, Mic, ShieldCheck, Home as HomeIcon, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/faith-public")({
  head: () => ({
    meta: [
      { title: "Faith & Public Life · MBI" },
      { name: "description", content: "Faith and public life, religious liberty, family and society, education and culture, global Christianity." },
      { property: "og:title", content: "Faith & Public Life — MBI" },
      { property: "og:description", content: "Faith and public life, religious liberty, family & society, education & culture." },
      { property: "og:url", content: "/faith-public" },
    ],
    links: [{ rel: "canonical", href: "/faith-public" }],
  }),
  component: PublicPage,
});

function PublicPage() {
  const { t } = useLang();
  const themes = [
    { Icon: Landmark, zh: "信仰与公共生活", en: "Faith & Public Life" },
    { Icon: ShieldCheck, zh: "宗教自由", en: "Religious Liberty" },
    { Icon: HomeIcon, zh: "家庭与社会议题", en: "Family & Society" },
    { Icon: GraduationCap, zh: "教育与文化", en: "Education & Culture" },
    { Icon: Mic, zh: "普通人的声音", en: "Ordinary Voices" },
    { Icon: MessageSquareQuote, zh: "全球基督教公共议题", en: "Global Christianity in Public Life" },
  ];
  return (
    <SiteShell>
      <PageHero
        eyebrow="Faith & Public Life"
        titleZh={t("信仰从不是私事——它如何进入公共生活？", "Faith was never private — how does it enter public life?")}
        titleEn={t("Faith was never private — how does it enter public life?", "信仰如何进入公共生活？")}
        lead={t("本栏目将整理与转载与信仰、宗教自由、家庭、教育、文化相关的公共议题文章，刻意避免精英主义，让普通人的真实经验成为重要的声音。", "This section will gather and republish writing on faith, religious liberty, family, education and culture — intentionally resisting elitism so that real, ordinary voices are heard.")}
      />
      <section className="container-prose py-20">
        <p className="eyebrow mb-6">{t("栏目方向", "Editorial themes")}</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map(({ Icon, zh, en }) => (
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
          {t("内容素材正在整理中，首批文章将很快与你见面。", "Articles are being curated — the first pieces will be published soon.")}
        </p>
      </section>
    </SiteShell>
  );
}
