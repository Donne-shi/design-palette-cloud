import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { useLang } from "@/lib/i18n";
import { Compass, Sparkles, MessagesSquare, HandHeart, Sunrise, Check, X as XIcon, Globe2, BookOpen, Users, Heart, Handshake, Church } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About · Multicultural Bridge Initiative" },
      { name: "description", content: "MBI vision, mission and core values: Truth, Grace, Dialogue, Service, Hope." },
      { property: "og:title", content: "About — MBI" },
      { property: "og:description", content: "Vision, mission, and the principles guiding our work." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = useLang();
  const values = [
    { en: "Truth", zh: "真理", Icon: Compass },
    { en: "Grace", zh: "恩典", Icon: Sparkles },
    { en: "Dialogue", zh: "对话", Icon: MessagesSquare },
    { en: "Service", zh: "服务", Icon: HandHeart },
    { en: "Hope", zh: "盼望", Icon: Sunrise },
  ];
  const missions = [
    { zh: "推动跨文化理解", en: "Advance cross-cultural understanding", Icon: Globe2 },
    { zh: "促进健康的神学讨论", en: "Foster healthy theological discussion", Icon: BookOpen },
    { zh: "关注公共议题中的信仰声音", en: "Bring a faithful voice to public issues", Icon: MessagesSquare },
    { zh: "服务普通家庭与社区", en: "Serve everyday families and communities", Icon: Users },
    { zh: "促进福音与社会责任结合", en: "Connect Gospel with social responsibility", Icon: Heart },
    { zh: "推动教会合作与全球对话", en: "Encourage church partnership and global dialogue", Icon: Handshake },
  ];
  return (
    <SiteShell>
      <PageHero
        eyebrow="About"
        titleZh={t("让福音成为文化之间的桥梁。", "Let the Gospel be a bridge between cultures.")}
        titleEn={t("Let the Gospel be a bridge between cultures.", "让福音成为文化之间的桥梁。")}
        lead={t(
          "多元文化桥梁计划是一个连接福音信仰、公共议题、跨文化交流与社会关怀的平台。",
          "Multicultural Bridge Initiative is a platform connecting Gospel faith, public discourse, cross-cultural exchange, and social care."
        )}
      />
      <section className="container-prose py-20 grid md:grid-cols-12 gap-12">
        <div className="md:col-span-4">
          <p className="eyebrow mb-3">Vision</p>
          <h2 className="serif text-3xl leading-tight">{t("让福音成为文化之间的桥梁。", "Let the Gospel be a bridge between cultures.")}</h2>
        </div>
        <div className="md:col-span-8 space-y-4 text-lg leading-relaxed text-foreground/85">
          <p>{t("我们相信：福音不只是个人得救的信息，也是更新文化、和好人群的能力。", "We believe the Gospel is not only a message of personal salvation but also a power that renews cultures and reconciles peoples.")}</p>
          <p>{t("在一个易于走向极端与分裂的时代，我们立志做一种温和、理性、建设性的公共声音。", "In an age inclined to extremism and fragmentation, we aspire to be a moderate, reasoned, and constructive public voice.")}</p>
        </div>
      </section>

      <section className="bg-secondary/40 border-y border-border/70 py-20">
        <div className="container-prose grid md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <p className="eyebrow mb-3">Mission</p>
            <h2 className="serif text-3xl">{t("我们做什么", "What we do")}</h2>
          </div>
          <ul className="md:col-span-8 grid sm:grid-cols-2 gap-x-8 gap-y-5 text-foreground/85">
            {missions.map(({ Icon, ...m }) => (
              <li key={m.en} className="border-t border-border pt-4 flex gap-4">
                <Icon className="h-5 w-5 mt-1 text-accent shrink-0" />
                <div>
                  <p className="serif text-lg">{t(m.zh, m.en)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-prose py-24">
        <p className="eyebrow mb-4">Core Values</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {values.map(({ Icon, ...v }) => (
            <div key={v.en} className="border-t-2 border-accent pt-5">
              <Icon className="h-6 w-6 text-accent mb-3" />
              <p className="serif text-3xl">{t(v.zh, v.en)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-prose pb-24">
        <p className="eyebrow mb-4">Editorial Principles</p>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="serif text-2xl mb-4 flex items-center gap-2"><Check className="h-5 w-5 text-accent" /> {t("我们支持", "We support")}</h3>
            <ul className="space-y-2 text-foreground/85">
              {[
                { zh: "福音中心", en: "Gospel-centered" },
                { zh: "跨文化理解", en: "Cross-cultural understanding" },
                { zh: "理性公共讨论", en: "Reasoned public discourse" },
                { zh: "宗教自由", en: "Religious liberty" },
                { zh: "家庭与社区", en: "Families and communities" },
                { zh: "全球教会合作", en: "Global church partnership" },
                { zh: "普通人的声音", en: "Voices of ordinary people" },
              ].map(x => (
                <li key={x.en} className="flex gap-2"><Check className="h-4 w-4 mt-1 text-accent shrink-0" /><span>{t(x.zh, x.en)}</span></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="serif text-2xl mb-4 flex items-center gap-2"><XIcon className="h-5 w-5 text-stone-warm" /> {t("我们反对", "We reject")}</h3>
            <ul className="space-y-2 text-foreground/85">
              {[
                { zh: "极端民族主义", en: "Extreme nationalism" },
                { zh: "极端意识形态", en: "Ideological extremism" },
                { zh: "仇恨言论", en: "Hate speech" },
                { zh: "阴谋论传播", en: "Conspiracy theorizing" },
                { zh: "将福音工具化", en: "Weaponizing the Gospel" },
                { zh: "成功神学", en: "Prosperity gospel" },
              ].map(x => (
                <li key={x.en} className="flex gap-2"><XIcon className="h-4 w-4 mt-1 text-stone-warm shrink-0" /><span>{t(x.zh, x.en)}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
