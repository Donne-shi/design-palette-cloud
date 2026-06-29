import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Globe2, Heart, MessageSquareQuote, Mic, Newspaper, Users } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { useLang } from "@/lib/i18n";
import { listPublishedArticles, listPublishedEvents, listPublishedIssues, type PublicArticle, type PublicEvent } from "@/lib/content.functions";
import hero from "@/assets/hero.jpg";
import theologyImg from "@/assets/theology.jpg";
import journalImg from "@/assets/journal.jpg";
import eventImg from "@/assets/event.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "多元文化桥梁计划 · Multicultural Bridge Initiative" },
      { name: "description", content: "以福音连接文化，以真理回应时代，以恩典促进对话。Gospel-centered cross-cultural dialogue and public engagement." },
      { property: "og:title", content: "Multicultural Bridge Initiative" },
      { property: "og:description", content: "Building bridges across cultures through the Gospel." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  loader: async () => {
    const [articles, events, issues] = await Promise.all([
      listPublishedArticles(),
      listPublishedEvents(),
      listPublishedIssues(),
    ]);
    return {
      articles: articles.slice(0, 3),
      events: events.filter(e => !e.start_at || new Date(e.start_at) >= new Date()).slice(0, 3),
      latestIssue: issues[0] ?? null,
    };
  },
  errorComponent: ({ error }) => <div className="p-10 text-sm text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-10">Not found.</div>,
  component: Home,
});



function fmtDate(s: string | null | undefined) {
  if (!s) return "";
  try { return new Date(s).toISOString().slice(0, 10).replace(/-/g, "."); } catch { return ""; }
}

function Home() {
  const { t, lang } = useLang();
  const { articles, events, latestIssue } = Route.useLoaderData();

  return (
    <SiteShell>
      {/* HERO */}
      <section className="relative">
        <div className="absolute inset-0">
          <img src={hero} alt="" width={1920} height={1280} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        </div>
        <div className="relative container-prose pt-28 pb-32 md:pt-40 md:pb-44">
          <p className="eyebrow mb-5 text-accent">Multicultural Bridge Initiative</p>
          <h1 className="serif text-5xl md:text-7xl lg:text-[5.5rem] leading-[0.98] text-foreground max-w-4xl">
            Building Bridges Across Cultures Through the Gospel.
          </h1>
          <p className="serif italic text-2xl md:text-3xl text-stone-warm mt-6 max-w-3xl">
            以福音连接文化，以真理回应时代，以恩典促进对话。
          </p>
          <p className="mt-8 max-w-xl text-base md:text-lg text-foreground/80 leading-relaxed">
            {t(
              "我们是一个致力于跨文化理解、健康神学讨论与公共议题参与的平台——为普通家庭、教会与社区服务。",
              "A platform for cross-cultural understanding, sound theological discussion, and public engagement — serving families, churches, and communities."
            )}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/news" className="bg-accent text-accent-foreground px-6 py-3 text-sm tracking-[0.18em] uppercase inline-flex items-center gap-2 hover:bg-accent/90">
              {t("阅读最新文章", "Latest essays")} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/journal" className="border border-foreground/30 text-foreground px-6 py-3 text-sm tracking-[0.18em] uppercase hover:border-accent hover:text-accent">
              {t("订阅电子期刊", "Subscribe to journal")}
            </Link>
            <Link to="/events" className="px-6 py-3 text-sm tracking-[0.18em] uppercase text-foreground/70 hover:text-accent">
              {t("参与活动", "Upcoming events")} →
            </Link>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="container-prose py-24 md:py-32">
        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <span className="rule mb-6" />
            <p className="eyebrow mb-4">{t("我们是谁", "Who we are")}</p>
            <h2 className="serif text-4xl md:text-5xl leading-tight">
              {t("在多元社会中，坚持真理、实践恩典、促进理解。", "Truth, grace, and understanding in a pluralistic society.")}
            </h2>
          </div>
          <div className="md:col-span-7 md:pl-10 md:border-l border-border">
            <p className="text-lg text-foreground/80 leading-relaxed">
              {t(
                "多元文化桥梁计划致力于推动跨文化理解、促进健康神学讨论、关注公共议题中的信仰声音、服务普通家庭与社区，并将福音与社会责任结合。",
                "MBI exists to advance cross-cultural understanding, foster healthy theological discussion, bring a faithful voice to public issues, serve everyday families and communities, and connect the Gospel with social responsibility."
              )}
            </p>
            <div className="mt-10 grid sm:grid-cols-2 gap-6">
              {[
                { icon: Globe2, zh: "跨文化交流", en: "Cross-cultural exchange" },
                { icon: BookOpen, zh: "神学反思", en: "Theological reflection" },
                { icon: Users, zh: "社区参与", en: "Community engagement" },
                { icon: Heart, zh: "公共见证", en: "Public witness" },
              ].map(({ icon: Icon, zh, en }) => (
                <div key={en} className="flex gap-4">
                  <Icon className="h-5 w-5 mt-1 text-accent shrink-0" />
                  <div>
                    <p className="serif text-lg">{t(zh, en)}</p>
                    <p className="text-sm text-muted-foreground italic">{t(en, zh)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* NEWS — dynamic */}
      <section className="bg-secondary/40 border-y border-border/70">
        <div className="container-prose py-24">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="eyebrow mb-3">News & Commentary</p>
              <h2 className="serif text-4xl md:text-5xl">{t("新闻与评论", "Voices on the day's issues")}</h2>
            </div>
            <Link to="/news" className="hidden sm:inline-flex text-sm uppercase tracking-widest text-accent items-center gap-1.5">
              {t("查看全部", "View all")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {articles.length === 0 ? (
            <p className="text-muted-foreground">{t("暂无文章，敬请期待。", "No articles yet. Stay tuned.")}</p>
          ) : (
            <ul className="divide-y divide-border/70">
              {articles.map((a: PublicArticle) => {
                const title = lang === "en" && a.title_en ? a.title_en : a.title_zh;
                const subtitle = lang === "en" ? a.title_zh : (a.title_en ?? "");
                const excerpt = lang === "en" ? (a.excerpt_en || a.excerpt_zh) : (a.excerpt_zh || a.excerpt_en);
                return (
                  <li key={a.id} className="py-7 first:pt-0">
                    <Link
                      to="/news/$slug"
                      params={{ slug: a.slug || a.id }}
                      className="group block"
                    >
                      <p className="eyebrow text-foreground/60">{a.category || "Article"} · {fmtDate(a.published_at || a.created_at)}</p>
                      <h3 className="serif text-2xl md:text-3xl mt-2 leading-snug group-hover:text-accent transition-colors">{title}</h3>
                      {subtitle && <p className="serif italic text-base text-stone-warm mt-1">{subtitle}</p>}
                      {excerpt && <p className="mt-3 text-[0.95rem] text-foreground/75 leading-relaxed line-clamp-2 max-w-3xl">{excerpt}</p>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* THEOLOGY FORUM */}
      <section className="container-prose py-24 md:py-32">
        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <img src={theologyImg} alt="" loading="lazy" width={1280} height={896} className="w-full aspect-[4/5] object-cover" />
          </div>
          <div className="md:col-span-7 md:pl-6">
            <p className="eyebrow mb-3">Theology Forum</p>
            <h2 className="serif text-4xl md:text-5xl leading-tight">{t("神学争鸣", "A forum for theology in truth and love")}</h2>
            <p className="serif italic text-xl text-stone-warm mt-2">In truth and love.</p>
            <p className="mt-6 text-lg text-foreground/80 leading-relaxed">
              {t(
                "我们邀请不同传统的神学家与牧者，就当代教会与社会的关键问题展开严谨而温和的讨论：圣经解释、教会与社会、神学家观点。",
                "We invite theologians and pastors from different traditions to engage rigorously and graciously with today's key questions — Scripture, church and society, voices in conversation."
              )}
            </p>
            <Link to="/theology" className="inline-flex items-center gap-2 mt-10 text-sm uppercase tracking-widest text-accent">
              {t("进入神学争鸣", "Enter the forum")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* EVENTS — dynamic */}
      <section className="bg-primary text-primary-foreground">
        <div className="container-prose py-24">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="eyebrow mb-3 text-primary-foreground/60">Cultural Exchange</p>
              <h2 className="serif text-4xl md:text-5xl">{t("文化交流活动", "Where conversations happen")}</h2>
            </div>
            <Link to="/events" className="hidden sm:inline-flex text-sm uppercase tracking-widest items-center gap-1.5 text-primary-foreground/80 hover:text-accent">
              {t("全部活动", "All events")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {events.length === 0 ? (
            <p className="text-primary-foreground/70">{t("暂无活动安排。", "No upcoming events.")}</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {events.map((e: PublicEvent) => {
                const title = lang === "en" && e.title_en ? e.title_en : e.title_zh;
                const subtitle = lang === "en" ? e.title_zh : (e.title_en ?? "");
                return (
                  <Link
                    key={e.id}
                    to="/events/$id"
                    params={{ id: e.id }}
                    className="block border border-primary-foreground/15 p-6 hover:border-accent transition-colors"
                  >
                    <div className="aspect-[16/10] mb-5 overflow-hidden bg-primary-foreground/5">
                      <img src={e.cover_url || eventImg} alt="" loading="lazy" width={1280} height={896} className="h-full w-full object-cover opacity-90" />
                    </div>
                    <p className="text-xs uppercase tracking-widest text-accent">
                      {fmtDate(e.start_at)}
                    </p>
                    <h3 className="serif text-xl mt-2">{title}</h3>
                    {subtitle && <p className="serif italic text-sm text-primary-foreground/60 mt-1">{subtitle}</p>}
                    {e.location && (
                      <div className="mt-5 text-sm text-primary-foreground/70">{e.location}</div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* FAITH & PUBLIC LIFE */}
      <section className="container-prose py-24 md:py-32">
        <div className="max-w-3xl">
          <p className="eyebrow mb-3">Faith & Public Life</p>
          <h2 className="serif text-4xl md:text-5xl leading-tight">
            {t("公共议题与信仰观察——避免精英主义，倾听普通人的声音。", "Faith in public life — voices of ordinary people, not just elites.")}
          </h2>
        </div>
        <div className="mt-14 grid md:grid-cols-3 gap-10">
          {[
            { icon: Newspaper, zh: "美国政府与宗教", en: "Government & Religion", body: t("新政策解读、宗教自由案例、法院判决分析。", "Policy analysis, religious-liberty cases, court rulings.") },
            { icon: MessageSquareQuote, zh: "信仰回应", en: "Faithful Responses", body: t("邀请神学家与牧者就伦理、教育、家庭等议题作出回应。", "Theologians and pastors respond to ethics, education, family.") },
            { icon: Mic, zh: "普通人的声音", en: "Ordinary Voices", body: t("教师、企业主、家庭主妇、留学生——真实的故事。", "Teachers, business owners, homemakers, students — real stories.") },
          ].map(({ icon: Icon, zh, en, body }) => (
            <div key={en} className="border-t-2 border-accent pt-6">
              <Icon className="h-6 w-6 text-accent mb-4" />
              <h3 className="serif text-2xl">{t(zh, en)}</h3>
              <p className="serif italic text-stone-warm text-sm mt-1">{t(en, zh)}</p>
              <p className="mt-4 text-foreground/75 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* JOURNAL — dynamic latest issue */}
      <section className="bg-secondary/40 border-y border-border/70">
        <div className="container-prose py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src={latestIssue?.cover_url || journalImg}
              alt=""
              loading="lazy"
              width={1280}
              height={896}
              className="w-full aspect-[4/5] object-cover shadow-[0_30px_60px_-30px_rgba(45,36,24,0.35)]"
            />
          </div>
          <div>
            <p className="eyebrow mb-3">
              Bridge Quarterly · 桥梁季刊
              {latestIssue && ` · Vol. ${latestIssue.volume} No. ${latestIssue.issue_number}`}
            </p>
            <h2 className="serif text-4xl md:text-5xl leading-tight">
              {latestIssue
                ? (lang === "en" && latestIssue.title_en ? latestIssue.title_en : latestIssue.title_zh)
                : t("电子期刊即将上线", "Journal coming soon")}
            </h2>
            {latestIssue && (
              <p className="mt-6 text-foreground/80 leading-relaxed">
                {lang === "en" && latestIssue.summary_en ? latestIssue.summary_en : (latestIssue.summary_zh || "")}
              </p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              {latestIssue ? (
                <>
                  <Link to="/journal/$id" params={{ id: latestIssue.id }} className="bg-accent text-accent-foreground px-6 py-3 text-sm tracking-widest uppercase">
                    {t("阅读本期", "Read this issue")}
                  </Link>
                  {latestIssue.pdf_url && (
                    <a href={latestIssue.pdf_url} target="_blank" rel="noopener" className="border border-foreground/30 px-6 py-3 text-sm tracking-widest uppercase">PDF</a>
                  )}
                </>
              ) : (
                <Link to="/journal" className="border border-foreground/30 px-6 py-3 text-sm tracking-widest uppercase">
                  {t("查看所有期次", "Browse issues")}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CLOSING */}
      <section className="container-prose py-32 text-center">
        <p className="eyebrow mb-6">Truth · Grace · Dialogue · Service · Hope</p>
        <p className="serif text-3xl md:text-5xl leading-tight max-w-4xl mx-auto">
          {t("让福音成为文化之间的桥梁。", "Let the Gospel be a bridge between cultures.")}
        </p>
        <Link to="/about" className="inline-flex items-center gap-2 mt-10 text-sm uppercase tracking-widest text-accent">
          {t("了解我们的愿景与原则", "Read our vision & principles")} <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </SiteShell>
  );
}
