import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { listPublishedEvents, type PublicEvent } from "@/lib/content.functions";
import { useLang } from "@/lib/i18n";
import { CalendarDays, MapPin } from "lucide-react";

const SITE = "https://bridgeaway.org";

export const Route = createFileRoute("/events")({
  loader: () => listPublishedEvents(),
  head: () => ({
    meta: [
      { title: "活动 · Events — MBI" },
      { name: "description", content: "Multicultural Bridge Initiative 主办的对话、讲座与研讨会。" },
      { property: "og:title", content: "Events — MBI" },
      { property: "og:description", content: "Talks, dialogues, and gatherings hosted by MBI." },
      { property: "og:url", content: `${SITE}/events` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/events` }],
  }),
  errorComponent: ErrorView,
  component: EventsPage,
});

function EventsPage() {
  const events = Route.useLoaderData() as PublicEvent[];
  const { t, lang } = useLang();
  const now = Date.now();
  const upcoming = events.filter((e) => new Date(e.start_at).getTime() >= now);
  const past = events.filter((e) => new Date(e.start_at).getTime() < now);

  return (
    <SiteShell>
      <PageHero
        eyebrow="Events"
        titleZh={t("活动与对话", "Events & dialogue")}
        titleEn={t("Events & dialogue", "活动与对话")}
        lead={t("讲座、读书会、跨界对谈——我们诚邀你一同思考。", "Talks, reading groups, and cross-cultural conversations — join us.")}
      />
      <section className="container-prose py-20">
        <h2 className="serif text-2xl mb-8">{t("即将举办", "Upcoming")}</h2>
        {upcoming.length === 0 ? (
          <p className="text-muted-foreground">{t("暂无活动安排，敬请期待。", "No upcoming events yet — check back soon.")}</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-12">
            {upcoming.map((e) => <EventCard key={e.id} e={e} lang={lang} />)}
          </div>
        )}

        {past.length > 0 && (
          <>
            <h2 className="serif text-2xl mt-20 mb-8 text-stone-warm">{t("往期活动", "Past events")}</h2>
            <div className="grid md:grid-cols-3 gap-x-8 gap-y-10">
              {past.map((e) => <EventCard key={e.id} e={e} lang={lang} compact />)}
            </div>
          </>
        )}
      </section>
    </SiteShell>
  );
}

function EventCard({ e, lang, compact }: { e: PublicEvent; lang: "zh" | "en"; compact?: boolean }) {
  const title = lang === "en" ? e.title_en || e.title_zh : e.title_zh;
  const when = new Date(e.start_at).toLocaleString();
  return (
    <Link to="/events/$id" params={{ id: e.id }} className="group block">
      {e.cover_url && (
        <div className={`overflow-hidden bg-muted ${compact ? "aspect-[16/10]" : "aspect-[4/3]"}`}>
          <img src={e.cover_url} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
        </div>
      )}
      <p className="eyebrow mt-5 inline-flex items-center gap-3">
        <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3 text-accent" />{when}</span>
        {e.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3 text-accent" />{e.location}</span>}
      </p>
      <h3 className={`serif mt-2 leading-snug ${compact ? "text-lg" : "text-2xl"}`}>{title}</h3>
    </Link>
  );
}

function ErrorView({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <SiteShell>
      <div className="container-prose py-24 text-center">
        <h1 className="serif text-2xl">加载失败 · Failed to load</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-6 bg-accent text-accent-foreground px-4 py-2 text-sm uppercase tracking-wider">Try again</button>
      </div>
    </SiteShell>
  );
}
