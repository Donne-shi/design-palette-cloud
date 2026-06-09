import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/faith-public")({
  head: () => ({
    meta: [
      { title: "公共议题与信仰 · Faith & Public Life — MBI" },
      { name: "description", content: "政府与宗教、信仰回应、普通人的声音——避免精英主义，倾听真实经验。" },
      { property: "og:title", content: "Faith & Public Life — MBI" },
      { property: "og:description", content: "Government & religion, faithful responses, ordinary voices." },
      { property: "og:url", content: "/faith-public" },
    ],
    links: [{ rel: "canonical", href: "/faith-public" }],
  }),
  component: PublicPage,
});

function PublicPage() {
  const { t } = useLang();
  const sections = [
    { Icon: Landmark, zh: "美国政府与宗教", en: "Government & Religion", items: [
      { zh: "新政策解读：今年值得关注的三项", en: "New policy: three things to watch this year" },
      { zh: "宗教自由案例追踪", en: "Religious-liberty case tracker" },
      { zh: "法院判决分析", en: "Court rulings, in review" },
    ]},
    { Icon: MessageSquareQuote, zh: "信仰回应", en: "Faithful Responses", items: [
      { zh: "伦理：基因编辑与生命的边界", en: "Ethics: gene editing and the boundaries of life" },
      { zh: "教育：家长在课程之争中的角色", en: "Education: parents' role in the curriculum debate" },
      { zh: "家庭：在多元社会养育孩子", en: "Family: raising children in a pluralistic society" },
    ]},
    { Icon: Mic, zh: "普通人的声音", en: "Ordinary Voices", items: [
      { zh: "一位高中老师的来信", en: "Letter from a high-school teacher" },
      { zh: "一个小企业主的两年", en: "Two years of a small-business owner" },
      { zh: "留学生眼中的美国教会", en: "American churches through a student's eyes" },
    ]},
  ];
  return (
    <SiteShell>
      <PageHero
        eyebrow="Faith & Public Life · 信仰与公共生活"
        titleZh={t("信仰从不是私事——它如何进入公共生活？", "Faith was never private — how does it enter public life?")}
        titleEn={t("Faith was never private — how does it enter public life?", "信仰如何进入公共生活？")}
        lead={t("我们刻意避免精英主义，让普通人的真实经验成为重要的声音。", "We intentionally resist elitism — the real experience of ordinary people belongs at the center.")}
      />
      <section className="container-prose py-20 space-y-16">
        {sections.map((s) => {
          const Icon = s.Icon;
          return (
          <div key={s.en}>
            <p className="eyebrow mb-3 flex items-center gap-2 text-accent"><Icon className="h-4 w-4" /> <span className="text-stone-warm">{t(s.zh, s.en)} · <span className="italic">{t(s.en, s.zh)}</span></span></p>
            <div className="grid md:grid-cols-3 gap-6">
              {s.items.map((it, i) => (
                <article key={i} className="border-t-2 border-accent pt-5">
                  <h3 className="serif text-xl leading-snug">{t(it.zh, it.en)}</h3>
                  <p className="serif italic text-sm text-stone-warm mt-1">{t(it.en, it.zh)}</p>
                </article>
              ))}
            </div>
          </div>
        );})}
      </section>
    </SiteShell>
  );
}
