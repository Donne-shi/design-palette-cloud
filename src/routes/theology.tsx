import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/theology")({
  head: () => ({
    meta: [
      { title: "神学争鸣 · Theology Forum — MBI" },
      { name: "description", content: "在真理与爱中进行神学讨论——圣经解释、教会与社会、神学家观点。" },
      { property: "og:title", content: "Theology Forum — MBI" },
      { property: "og:description", content: "Theological discussion in truth and love — Scripture, church & society, voices." },
      { property: "og:url", content: "/theology" },
    ],
    links: [{ rel: "canonical", href: "/theology" }],
  }),
  component: TheologyPage,
});

function TheologyPage() {
  const { t } = useLang();
  const debates = [
    {
      Icon: Scale,
      zh: "教会是否应当参与政治？",
      en: "Should the church engage politics?",
      a: { name: "View A", zh: "教会应当在公共领域发声，但避免被任何政党工具化。", en: "The church speaks in public, but resists capture by any party." },
      b: { name: "View B", zh: "教会的政治参与应是间接的——藉著塑造门徒的良心。", en: "The church's political role is indirect — by forming consciences." },
    },
    {
      Icon: ShieldCheck,
      zh: "宗教自由的边界",
      en: "The boundaries of religious liberty",
      a: { name: "View A", zh: "自由的范围应在最大化保护少数信仰群体之上。", en: "Liberty should maximize protection for minority faith communities." },
      b: { name: "View B", zh: "自由必须与公共秩序、第三方权益平衡。", en: "Liberty must be balanced with public order and third-party rights." },
    },
    {
      Icon: Scroll,
      zh: "社会公义与福音的关系",
      en: "Social justice and the Gospel",
      a: { name: "View A", zh: "公义是福音内在要求，不可二分。", en: "Justice is intrinsic to the Gospel — not a separate add-on." },
      b: { name: "View B", zh: "需小心区分福音核心与其社会含义。", en: "We must distinguish the Gospel itself from its social implications." },
    },
  ];
  const voices = ["John Piper","Tim Keller","N. T. Wright","D. A. Carson","Carl Henry","Esau McCaulley"];
  return (
    <SiteShell>
      <PageHero
        eyebrow="Theology Forum · 神学争鸣"
        titleZh={t("在真理与爱中进行神学讨论。", "Theology — in truth and in love.")}
        titleEn={t("In truth and love.", "在真理与爱中。")}
        lead={t("我们不代表任何宗派；我们邀请福音派、改革宗、卫理宗、长老会、浸信会与其他历史正统传统进入开放、严谨而温和的讨论。", "We belong to no single denomination. We invite Evangelical, Reformed, Methodist, Presbyterian, Baptist, and other historically orthodox traditions into open, rigorous, and gracious discussion.")}
      />

      <section className="container-prose py-20">
        <p className="eyebrow mb-3">Open Debates · 当前讨论</p>
        <div className="mt-8 space-y-14">
          {debates.map((d, i) => {
            const Icon = d.Icon;
            return (
            <article key={i} className="border-t border-border pt-10">
              <div className="flex items-start gap-4">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-sm bg-accent/10 text-accent ring-1 ring-accent/30 shrink-0">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="serif text-3xl md:text-4xl leading-tight">{t(d.zh, d.en)}</h2>
                  <p className="serif italic text-stone-warm mt-2">{t(d.en, d.zh)}</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-8 mt-8">
                {[d.a, d.b].map((v, j) => (
                  <div key={j} className="bg-card border border-border p-6">
                    <p className="eyebrow mb-3 text-accent flex items-center gap-1.5"><Quote className="h-3 w-3" /> {v.name}</p>
                    <p className="serif text-lg leading-snug">{t(v.zh, v.en)}</p>
                    <p className="serif italic text-sm text-stone-warm mt-2">{t(v.en, v.zh)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-6 text-sm text-stone-warm">
                <span className="inline-flex items-center gap-1.5"><Pencil className="h-3.5 w-3.5" /> {t("编辑点评", "Editor's note")}</span>
                <span className="inline-flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5" /> {t("读者讨论", "Reader comments")}</span>
              </div>
            </article>
          );})}
        </div>
      </section>

      <section className="bg-secondary/40 border-y border-border/70 py-20">
        <div className="container-prose">
          <p className="eyebrow mb-3">Voices in conversation · 神学家观点</p>
          <h2 className="serif text-4xl">{t("我们邀请这些声音进入对话", "Voices we engage")}</h2>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
            {voices.map((v) => (
              <div key={v} className="border border-border bg-background px-4 py-5 text-center">
                <p className="serif text-lg">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
