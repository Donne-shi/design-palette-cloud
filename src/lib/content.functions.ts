import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SlugSchema = z.object({ slug: z.string().min(1) });
const IdSchema = z.object({ id: z.string().min(1) });

export type PublicArticle = {
  id: string;
  slug: string | null;
  title_zh: string;
  title_en: string | null;
  excerpt_zh: string | null;
  excerpt_en: string | null;
  body_zh: string | null;
  body_en: string | null;
  category: string;
  cover_url: string | null;
  published_at: string | null;
  created_at: string;
};

export type PublicEvent = {
  id: string;
  title_zh: string;
  title_en: string | null;
  description_zh: string | null;
  description_en: string | null;
  start_at: string;
  end_at: string | null;
  location: string | null;
  cover_url: string | null;
  capacity: number | null;
};

export type PublicIssue = {
  id: string;
  volume: number;
  issue_number: number;
  title_zh: string;
  title_en: string | null;
  summary_zh: string | null;
  summary_en: string | null;
  cover_url: string | null;
  pdf_url: string | null;
  published_at: string | null;
};

const ARTICLE_COLS =
  "id,slug,title_zh,title_en,excerpt_zh,excerpt_en,body_zh,body_en,category,cover_url,published_at,created_at";
const EVENT_COLS =
  "id,title_zh,title_en,description_zh,description_en,start_at,end_at,location,cover_url,capacity";
const ISSUE_COLS =
  "id,volume,issue_number,title_zh,title_en,summary_zh,summary_en,cover_url,pdf_url,published_at";

export const listPublishedArticles = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("articles")
    .select(ARTICLE_COLS)
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(60);
  if (error) throw new Error(error.message);
  return (data as PublicArticle[]) ?? [];
});

export const getArticleBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => SlugSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.slug);
    const base = supabaseAdmin.from("articles").select(ARTICLE_COLS).eq("status", "published");
    const { data: row, error } = await (isUuid
      ? base.eq("id", data.slug).maybeSingle()
      : base.eq("slug", data.slug).maybeSingle());
    if (error) throw new Error(error.message);
    return (row as PublicArticle | null) ?? null;
  });

export const listPublishedEvents = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("events")
    .select(EVENT_COLS)
    .eq("status", "published")
    .order("start_at", { ascending: true })
    .limit(60);
  if (error) throw new Error(error.message);
  return (data as PublicEvent[]) ?? [];
});

export const getEventById = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => IdSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("events")
      .select(EVENT_COLS)
      .eq("status", "published")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (row as PublicEvent | null) ?? null;
  });

export const listPublishedIssues = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("journal_issues")
    .select(ISSUE_COLS)
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(60);
  if (error) throw new Error(error.message);
  return (data as PublicIssue[]) ?? [];
});

export const getIssueById = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => IdSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("journal_issues")
      .select(ISSUE_COLS)
      .eq("status", "published")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (row as PublicIssue | null) ?? null;
  });

export const listSitemapEntries = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [a, e, j] = await Promise.all([
    supabaseAdmin.from("articles").select("id,slug,updated_at").eq("status", "published"),
    supabaseAdmin.from("events").select("id,updated_at").eq("status", "published"),
    supabaseAdmin.from("journal_issues").select("id,updated_at").eq("status", "published"),
  ]);
  return {
    articles: (a.data ?? []).map((r: any) => ({ key: r.slug || r.id, updated_at: r.updated_at })),
    events: (e.data ?? []).map((r: any) => ({ key: r.id, updated_at: r.updated_at })),
    issues: (j.data ?? []).map((r: any) => ({ key: r.id, updated_at: r.updated_at })),
  };
});
