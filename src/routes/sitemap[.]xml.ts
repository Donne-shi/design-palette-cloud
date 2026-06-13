import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://bridgeaway.org";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "weekly" | "monthly" | "daily";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const staticEntries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/about", changefreq: "monthly", priority: "0.8" },
          { path: "/news", changefreq: "weekly", priority: "0.9" },
          { path: "/events", changefreq: "weekly", priority: "0.8" },
          { path: "/theology", changefreq: "weekly", priority: "0.9" },
          { path: "/cultural-exchange", changefreq: "weekly", priority: "0.8" },
          { path: "/faith-public", changefreq: "weekly", priority: "0.8" },
          { path: "/journal", changefreq: "monthly", priority: "0.9" },
          { path: "/resources", changefreq: "monthly", priority: "0.7" },
          { path: "/contact", changefreq: "monthly", priority: "0.6" },
        ];

        const [a, e, j] = await Promise.all([
          supabaseAdmin.from("articles").select("id,slug,updated_at").eq("status", "published"),
          supabaseAdmin.from("events").select("id,updated_at").eq("status", "published"),
          supabaseAdmin.from("journal_issues").select("id,updated_at").eq("status", "published"),
        ]);

        const dyn: SitemapEntry[] = [
          ...(a.data ?? []).map((r: any) => ({
            path: `/news/${r.slug || r.id}`, lastmod: r.updated_at, changefreq: "monthly" as const, priority: "0.7",
          })),
          ...(e.data ?? []).map((r: any) => ({
            path: `/events/${r.id}`, lastmod: r.updated_at, changefreq: "weekly" as const, priority: "0.6",
          })),
          ...(j.data ?? []).map((r: any) => ({
            path: `/journal/${r.id}`, lastmod: r.updated_at, changefreq: "monthly" as const, priority: "0.7",
          })),
        ];

        const all = [...staticEntries, ...dyn];
        const urls = all.map((entry) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${entry.path}</loc>`,
            entry.lastmod ? `    <lastmod>${new Date(entry.lastmod).toISOString()}</lastmod>` : null,
            entry.changefreq ? `    <changefreq>${entry.changefreq}</changefreq>` : null,
            entry.priority ? `    <priority>${entry.priority}</priority>` : null,
            `  </url>`,
          ].filter(Boolean).join("\n")
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
