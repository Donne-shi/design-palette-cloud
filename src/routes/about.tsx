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
          "Multicultural Bridge Initiative 是一个连接福音信仰、公共议题、跨文化交流与社会关怀的平台。",
          "MBI is a platform connecting Gospel faith, public discourse, cross-cultural exchange, and social care."
        )}
      />
      <section className="container-prose py-20 grid md:grid-cols-12 gap-12">
        <div className="md:col-span-4">
          <p className="eyebrow mb-3">Vision · 愿景</p>
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
            <p className="eyebrow mb-3">Mission · 使命</p>
            <h2 className="serif text-3xl">{t("我们做什么", "What we do")}</h2>
          </div>
          <ul className="md:col-span-8 grid sm:grid-cols-2 gap-x-8 gap-y-5 text-foreground/85">
            {missions.map(({ Icon, ...m }) => (
              <li key={m.en} className="border-t border-border pt-4 flex gap-4">
                <Icon className="h-5 w-5 mt-1 text-accent shrink-0" />
                <div>
                  <p className="serif text-lg">{t(m.zh, m.en)}</p>
                  <p className="italic text-sm text-stone-warm">{t(m.en, m.zh)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-prose py-24">
        <p className="eyebrow mb-4">Core Values · 核心价值</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {values.map(({ Icon, ...v }) => (
            <div key={v.en} className="border-t-2 border-accent pt-5">
              <Icon className="h-6 w-6 text-accent mb-3" />
              <p className="serif text-3xl">{v.en}</p>
              <p className="text-stone-warm mt-1">{v.zh}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-prose pb-24">
        <p className="eyebrow mb-4">Editorial Principles · 内容原则</p>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="serif text-2xl mb-4 flex items-center gap-2"><Check className="h-5 w-5 text-accent" /> {t("我们支持", "We support")}</h3>
            <ul className="space-y-2 text-foreground/85">
              {["福音中心 / Gospel-centered","跨文化理解 / Cross-cultural understanding","理性公共讨论 / Reasoned public discourse","宗教自由 / Religious liberty","家庭与社区 / Families and communities","全球教会合作 / Global church partnership","普通人的声音 / Voices of ordinary people"].map(x => (
                <li key={x} className="flex gap-2"><Check className="h-4 w-4 mt-1 text-accent shrink-0" /><span>{x}</span></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="serif text-2xl mb-4 flex items-center gap-2"><XIcon className="h-5 w-5 text-stone-warm" /> {t("我们反对", "We reject")}</h3>
            <ul className="space-y-2 text-foreground/85">
              {["极端民族主义 / Extreme nationalism","极端意识形态 / Ideological extremism","仇恨言论 / Hate speech","阴谋论传播 / Conspiracy theorizing","将福音工具化 / Weaponizing the Gospel","成功神学 / Prosperity gospel"].map(x => (
                <li key={x} className="flex gap-2"><XIcon className="h-4 w-4 mt-1 text-stone-warm shrink-0" /><span>{x}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
