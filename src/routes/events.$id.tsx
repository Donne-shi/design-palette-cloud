import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { getEventById, type PublicEvent } from "@/lib/content.functions";
import { useLang } from "@/lib/i18n";
import { ArrowLeft, CalendarDays, MapPin, Users } from "lucide-react";
import { RegistrationPanel } from "@/components/site/RegistrationPanel";

const SITE = "https://bridgeaway.org";

export const Route = createFileRoute("/events/$id")({
  loader: async ({ params }) => {
    const ev = await getEventById({ data: { id: params.id } });
    if (!ev) throw notFound();
    return ev;
  },
  head: ({ params, loaderData }) => {
    const e = loaderData as PublicEvent | undefined;
    const title = e?.title_zh ?? "Event";
    const desc = e?.description_zh ?? e?.description_en ?? "Multicultural Bridge Initiative event.";
    const url = `${SITE}/events/${params.id}`;
    return {
      meta: [
        { title: `${title} — MBI` },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "event" },
        ...(e?.cover_url ? [{ property: "og:image", content: e.cover_url }, { name: "twitter:image", content: e.cover_url }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: e ? [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Event",
          name: e.title_zh,
          startDate: e.start_at,
          endDate: e.end_at ?? undefined,
          location: e.location ? { "@type": "Place", name: e.location } : undefined,
          image: e.cover_url ?? undefined,
          description: desc,
          eventStatus: "https://schema.org/EventScheduled",
        }),
      }] : [],
    };
  },
  errorComponent: ErrorView,
  notFoundComponent: NotFoundView,
  component: EventDetail,
});

function EventDetail() {
  const e = Route.useLoaderData() as PublicEvent;
  const { t, lang } = useLang();
  const title = lang === "en" ? e.title_en || e.title_zh : e.title_zh;
  const desc = lang === "en" ? e.description_en || e.description_zh : e.description_zh || e.description_en;

  return (
    <SiteShell>
      <article className="container-prose py-16 md:py-24 grid md:grid-cols-12 gap-10">
        <div className="md:col-span-8">
          <Link to="/events" className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-stone-warm hover:text-accent">
            <ArrowLeft className="h-3 w-3" /> {t("所有活动", "All events")}
          </Link>
          <h1 className="serif text-4xl md:text-5xl mt-6 leading-tight">{title}</h1>

          <ul className="mt-6 space-y-2 text-sm text-foreground/80">
            <li className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-accent" />{new Date(e.start_at).toLocaleString()}{e.end_at && ` — ${new Date(e.end_at).toLocaleString()}`}</li>
            {e.location && <li className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" />{e.location}</li>}
            {e.capacity && <li className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-accent" />{t(`名额 ${e.capacity}`, `Capacity ${e.capacity}`)}</li>}
          </ul>

          {e.cover_url && <img src={e.cover_url} alt="" className="mt-10 w-full aspect-[16/9] object-cover" />}

          <div className="mt-10 serif text-lg leading-relaxed text-foreground/85 whitespace-pre-wrap">
            {desc || <p className="text-muted-foreground italic">{t("详细介绍待发布。", "Details coming soon.")}</p>}
          </div>
        </div>
        <div className="md:col-span-4">
          <RegistrationPanel eventId={e.id} capacity={e.capacity} />
        </div>
      </article>
    </SiteShell>
  );
}

function NotFoundView() {
  return (
    <SiteShell>
      <div className="container-prose py-24 text-center">
        <p className="eyebrow mb-3">404</p>
        <h1 className="serif text-3xl">Event not found</h1>
        <Link to="/events" className="inline-block mt-6 bg-accent text-accent-foreground px-4 py-2 text-sm uppercase tracking-wider">All events</Link>
      </div>
    </SiteShell>
  );
}

function ErrorView({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <SiteShell>
      <div className="container-prose py-24 text-center">
        <h1 className="serif text-2xl">Failed to load</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-6 bg-accent text-accent-foreground px-4 py-2 text-sm uppercase tracking-wider">Try again</button>
      </div>
    </SiteShell>
  );
}
