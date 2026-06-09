import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { useLang } from "@/lib/i18n";
import newsImg from "@/assets/news.jpg";
import dialogueImg from "@/assets/dialogue.jpg";
import theologyImg from "@/assets/theology.jpg";
import eventImg from "@/assets/event.jpg";
import { CalendarDays, Tag } from "lucide-react";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "新闻与评论 · News & Commentary — MBI" },
      { name: "description", content: "美国基督教动态、社会议题观察、国际基督教新闻——以福音视角回应时代。" },
      { property: "og:title", content: "News & Commentary — MBI" },
      { property: "og:description", content: "U.S. church news, society, and global Christianity — through a Gospel lens." },
      { property: "og:url", content: "/news" },
    ],
    links: [{ rel: "canonical", href: "/news" }],
  }),
  component: NewsPage,
});

const items = [
  { img: newsImg, cat: { zh: "美国基督教动态", en: "U.S. Church" }, zh: "福音派现状：在两党政治之间的福音见证", en: "Evangelicalism today: gospel witness between two parties", date: "2026.05.28", excerpt: { zh: "当福音派被政党化标签捆绑时，教会该如何重新找回纯粹的见证？", en: "When evangelicalism is captured by partisan labels, how does the church recover its witness?" } },
  { img: dialogueImg, cat: { zh: "社会议题观察", en: "Society" }, zh: "AI、青少年与心理健康", en: "AI, youth, and mental health", date: "2026.05.22", excerpt: { zh: "新一代成长在算法之中，教会、家庭和学校如何回应？", en: "A generation shaped by algorithms — how should church, family, and school respond?" } },
  { img: theologyImg, cat: { zh: "国际基督教新闻", en: "Global" }, zh: "全球宣教运动：从北到南的转移", en: "Global mission: a shift from north to south", date: "2026.05.15", excerpt: { zh: "宣教中心正从西方移向全球南方，这意味着什么？", en: "The center of mission is moving south — what does it mean?" } },
  { img: eventImg, cat: { zh: "家庭价值", en: "Family" }, zh: "家庭信仰传承的五个误区", en: "Five myths about passing on the faith at home", date: "2026.05.10", excerpt: { zh: "我们常以为做对了，但孩子心里听到的可能完全不同。", en: "We think we're doing it right — children may be hearing something else." } },
  { img: dialogueImg, cat: { zh: "教育问题", en: "Education" }, zh: "公立学校里的信仰对话", en: "Faith conversations in public schools", date: "2026.05.04", excerpt: { zh: "宗教自由的边界究竟在哪里？教师、家长、学生的真实经验。", en: "Where exactly is religious freedom drawn? Real stories from teachers, parents, students." } },
  { img: newsImg, cat: { zh: "宗教自由", en: "Religious Liberty" }, zh: "近期法院判决回顾", en: "Recent court rulings, in review", date: "2026.04.27", excerpt: { zh: "三个值得每个信徒关注的判决——它们意味着什么。", en: "Three rulings every believer should follow — and what they mean." } },
];

function NewsPage() {
  const { t } = useLang();
  return (
    <SiteShell>
      <PageHero
        eyebrow="News & Commentary"
        titleZh={t("新闻与评论", "Voices on the day's issues")}
        titleEn={t("Voices on the day's issues", "新闻与评论")}
        lead={t("我们以福音视角，关注美国基督教动态、当代社会议题与国际基督教新闻。", "Through a Gospel lens — U.S. church news, contemporary issues, and global Christianity.")}
      />
      <section className="container-prose py-20">
        <div className="flex gap-3 flex-wrap mb-12 text-xs uppercase tracking-widest">
          {[t("全部","All"), t("美国基督教","U.S. Church"), t("社会议题","Society"), t("国际","Global"), t("家庭","Family"), t("宗教自由","Religious Liberty")].map((tab, i) => (
            <button key={tab} className={`border px-4 py-2 ${i===0?"bg-foreground text-background border-foreground":"border-border text-foreground/70 hover:border-accent hover:text-accent"}`}>{tab}</button>
          ))}
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
          {items.map((a, i) => (
            <article key={i} className="group">
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                <img src={a.img} alt="" loading="lazy" width={1280} height={896} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
              </div>
              <p className="eyebrow mt-5 inline-flex items-center gap-3"><span className="inline-flex items-center gap-1"><Tag className="h-3 w-3 text-accent" />{t(a.cat.zh, a.cat.en)}</span><span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3 text-accent" />{a.date}</span></p>
              <h3 className="serif text-xl mt-2 leading-snug">{t(a.zh, a.en)}</h3>
              <p className="serif italic text-sm text-stone-warm mt-1">{t(a.en, a.zh)}</p>
              <p className="mt-3 text-sm text-foreground/75 leading-relaxed">{t(a.excerpt.zh, a.excerpt.en)}</p>
            </article>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
