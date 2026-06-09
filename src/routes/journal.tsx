import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { useLang } from "@/lib/i18n";
import journalImg from "@/assets/journal.jpg";
import { BookOpenText, FileDown, Archive } from "lucide-react";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "电子期刊 · Bridge Quarterly — MBI" },
      { name: "description", content: "桥梁季刊 Bridge Quarterly：专题研究、神学文章、社会观察、文化评论、事工案例。" },
      { property: "og:title", content: "Bridge Quarterly — MBI" },
      { property: "og:description", content: "Quarterly long-form essays at the intersection of faith, culture, and public life." },
      { property: "og:url", content: "/journal" },
    ],
    links: [{ rel: "canonical", href: "/journal" }],
  }),
  component: JournalPage,
});

function JournalPage() {
  const { t } = useLang();
  const toc = [
    { zh: "重新学习对话：在分裂时代的盼望", en: "Re-learning dialogue: hope in a divided age", kind: t("专题","Feature") },
    { zh: "圣经叙事与公共理性", en: "Biblical narrative and public reason", kind: t("神学","Theology") },
    { zh: "美国华人教会的代际转变", en: "Generational shift in U.S. Chinese churches", kind: t("观察","Observation") },
    { zh: "AI 时代的家庭门徒训练", en: "Family discipleship in the age of AI", kind: t("文化","Culture") },
    { zh: "一个城市教会五年的实验", en: "A city church's five-year experiment", kind: t("事工","Ministry") },
  ];
  return (
    <SiteShell>
      <PageHero
        eyebrow="Bridge Quarterly · 桥梁季刊"
        titleZh={t("每季度一次的认真阅读。", "A serious read, once a quarter.")}
        titleEn={t("A serious read, once a quarter.", "每季一次的认真阅读。")}
        lead={t("我们出版深度长文，回应当代教会与社会的根本问题。支持 PDF、网页阅读与手机阅读。", "We publish long-form essays on the deep questions of church and society — available as PDF, web, and mobile.")}
      />
      <section className="container-prose py-20 grid md:grid-cols-12 gap-12 items-start">
        <div className="md:col-span-5">
          <img src={journalImg} alt="" loading="lazy" width={1280} height={896} className="w-full aspect-[3/4] object-cover shadow-[0_30px_60px_-30px_rgba(45,36,24,0.35)]" />
          <div className="mt-6 flex gap-3">
            <button className="inline-flex items-center gap-1.5 bg-accent text-accent-foreground px-5 py-2.5 text-sm tracking-widest uppercase"><BookOpenText className="h-4 w-4" /> {t("网页阅读","Read online")}</button>
            <button className="inline-flex items-center gap-1.5 border border-input px-5 py-2.5 text-sm tracking-widest uppercase"><FileDown className="h-4 w-4" /> PDF</button>
          </div>
        </div>
        <div className="md:col-span-7">
          <p className="eyebrow mb-3">Issue 01 · 2026 Summer</p>
          <h2 className="serif text-4xl md:text-5xl leading-tight">{t("在分裂的时代，重新学习对话", "Re-learning dialogue in a divided age")}</h2>
          <p className="mt-6 text-foreground/80 leading-relaxed">
            {t("本期五篇专题文章——从神学、社会观察、文化评论到事工案例，邀请读者一同思考：在一个易于分裂的时代，福音如何重塑公共生活？", "Five long-form essays — from theology and social observation to cultural critique and ministry case studies — ask how the Gospel reshapes public life in a fragmenting age.")}
          </p>
          <div className="mt-10">
            <p className="eyebrow mb-4">Contents · 目录</p>
            <ol className="divide-y divide-border">
              {toc.map((a, i) => (
                <li key={i} className="py-4 flex gap-6 items-baseline">
                  <span className="serif text-stone-warm w-8">{String(i+1).padStart(2,"0")}</span>
                  <div className="flex-1">
                    <p className="serif text-lg leading-snug">{t(a.zh, a.en)}</p>
                    <p className="serif italic text-sm text-stone-warm">{t(a.en, a.zh)}</p>
                  </div>
                  <span className="text-xs uppercase tracking-widest text-accent">{a.kind}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="bg-secondary/40 border-y border-border/70 py-20">
        <div className="container-prose">
          <p className="eyebrow mb-3 flex items-center gap-2"><Archive className="h-4 w-4 text-accent" /> Archive · 往期</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {["2026 Spring","2025 Winter","2025 Autumn","2025 Summer"].map((iss, i) => (
              <article key={iss} className="border border-border bg-card p-6">
                <p className="text-xs uppercase tracking-widest text-stone-warm">Issue 0{4-i}</p>
                <p className="serif text-xl mt-2">{iss}</p>
                <p className="serif italic text-sm text-stone-warm mt-1">Bridge Quarterly</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
