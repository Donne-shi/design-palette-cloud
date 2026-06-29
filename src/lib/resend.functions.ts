import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const RESEND_BASE = "https://api.resend.com";
// notify.bridgeaway.org is verified for transactional; news.bridgeaway.org is for broadcasts.
const FROM_DEFAULT = "MBI Bridge <newsletter@news.bridgeaway.org>";
const REPLY_TO = "hello@bridgeaway.org";
const AUDIENCE_SETTING_KEY = "resend_audience_id";

type ResendErr = { name?: string; message?: string; statusCode?: number };

async function resend<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  const res = await fetch(`${RESEND_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  const json = text ? (() => { try { return JSON.parse(text); } catch { return { raw: text }; } })() : {};
  if (!res.ok) {
    const e = json as ResendErr;
    throw new Error(`Resend ${res.status}: ${e.message || e.name || text || res.statusText}`);
  }
  return json as T;
}

async function ensureAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required");
}

async function loadAudienceId(context: { supabase: any }): Promise<string | null> {
  const { data } = await context.supabase
    .from("site_settings")
    .select("value")
    .eq("key", AUDIENCE_SETTING_KEY)
    .maybeSingle();
  const v = data?.value as any;
  if (!v) return null;
  if (typeof v === "string") return v;
  if (typeof v === "object" && typeof v.id === "string") return v.id;
  return null;
}

async function saveAudienceId(context: { supabase: any; userId: string }, id: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin
    .from("site_settings")
    .upsert(
      { key: AUDIENCE_SETTING_KEY, value: id, updated_by: context.userId },
      { onConflict: "key" },
    );
  if (error) throw new Error(error.message);
}

/* ---------- Audience ---------- */

export const getNewsletterStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const audienceId = await loadAudienceId(context);
    let audience: any = null;
    let contactsCount: number | null = null;
    if (audienceId) {
      try {
        audience = await resend(`/audiences/${audienceId}`);
        const list = await resend<{ data: any[] }>(`/audiences/${audienceId}/contacts`);
        contactsCount = list?.data?.length ?? 0;
      } catch (e: any) {
        return { audienceId, audience: null, contactsCount: null, error: e.message };
      }
    }
    const { count: subCount } = await context.supabase
      .from("subscribers")
      .select("id", { count: "exact", head: true });
    return { audienceId, audience, contactsCount, subscriberCount: subCount ?? 0 };
  });

export const ensureNewsletterAudience = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    let id = await loadAudienceId(context);
    if (!id) {
      const created = await resend<{ id: string }>(`/audiences`, {
        method: "POST",
        body: JSON.stringify({ name: "MBI Bridge Newsletter" }),
      });
      id = created.id;
      await saveAudienceId(context, id);
    }
    return { audienceId: id };
  });

export const syncSubscribersToResend = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    let audienceId = await loadAudienceId(context);
    if (!audienceId) {
      const created = await resend<{ id: string }>(`/audiences`, {
        method: "POST",
        body: JSON.stringify({ name: "MBI Bridge Newsletter" }),
      });
      audienceId = created.id;
      await saveAudienceId(context, audienceId);
    }
    const { data: subs, error } = await context.supabase
      .from("subscribers")
      .select("id,email,language,resend_contact_id")
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let added = 0;
    let skipped = 0;
    let failed = 0;
    for (const s of subs || []) {
      try {
        const r = await resend<{ id: string }>(`/audiences/${audienceId}/contacts`, {
          method: "POST",
          body: JSON.stringify({
            email: s.email,
            unsubscribed: false,
          }),
        });
        if (r?.id && r.id !== s.resend_contact_id) {
          await supabaseAdmin
            .from("subscribers")
            .update({ resend_contact_id: r.id })
            .eq("id", s.id);
        }
        if (s.resend_contact_id) skipped++;
        else added++;
      } catch (e: any) {
        // Resend returns 422 if contact already exists — treat as skipped
        if (/already exists/i.test(e.message)) skipped++;
        else failed++;
      }
    }
    return { audienceId, total: subs?.length ?? 0, added, skipped, failed };
  });

/* ---------- Broadcasts ---------- */

const broadcastInput = z.object({
  subject: z.string().min(1).max(200),
  html: z.string().min(1).max(200_000),
  fromName: z.string().max(80).optional(),
  preview: z.string().max(200).optional(),
});

function wrapHtml(subject: string, body: string, preview?: string) {
  const safePreview = preview ? preview.replace(/</g, "&lt;") : subject;
  return `<!doctype html><html><head><meta charset="utf-8"><title>${subject.replace(/</g, "&lt;")}</title></head>
<body style="margin:0;padding:0;background:#f5f1ea;font-family:Georgia,'Cormorant Garamond',serif;color:#1a1a1a;">
<span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${safePreview}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f1ea;padding:32px 16px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e6dfd2;max-width:600px;width:100%;">
      <tr><td style="padding:32px 40px 12px 40px;border-bottom:1px solid #e6dfd2;">
        <div style="font-size:11px;letter-spacing:.25em;text-transform:uppercase;color:#8a7a5c;">MBI Bridge</div>
        <h1 style="font-family:Georgia,serif;font-size:26px;line-height:1.25;margin:8px 0 0 0;color:#1a1a1a;">${subject.replace(/</g, "&lt;")}</h1>
      </td></tr>
      <tr><td style="padding:24px 40px 32px 40px;font-size:16px;line-height:1.75;color:#262626;">
        ${body}
      </td></tr>
      <tr><td style="padding:20px 40px;border-top:1px solid #e6dfd2;font-size:12px;color:#8a7a5c;text-align:center;">
        MBI Bridge · <a href="https://bridgeaway.org" style="color:#8a7a5c;">bridgeaway.org</a><br/>
        <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#8a7a5c;">Unsubscribe</a>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

export const createBroadcast = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => broadcastInput.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    let audienceId = await loadAudienceId(context);
    if (!audienceId) throw new Error("No audience configured. Run “Sync subscribers” first.");
    const from = data.fromName ? `${data.fromName} <newsletter@news.bridgeaway.org>` : FROM_DEFAULT;
    const r = await resend<{ id: string }>(`/broadcasts`, {
      method: "POST",
      body: JSON.stringify({
        audience_id: audienceId,
        from,
        reply_to: REPLY_TO,
        subject: data.subject,
        html: wrapHtml(data.subject, data.html, data.preview),
        preview_text: data.preview,
      }),
    });
    return { id: r.id };
  });

export const sendBroadcast = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().min(1), scheduledAt: z.string().optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const body: Record<string, unknown> = {};
    if (data.scheduledAt) body.scheduled_at = data.scheduledAt;
    await resend(`/broadcasts/${data.id}/send`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return { ok: true };
  });

export const listBroadcasts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const r = await resend<{ data: any[] }>(`/broadcasts`);
    return { broadcasts: r?.data ?? [] };
  });

export const deleteBroadcast = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1) }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    await resend(`/broadcasts/${data.id}`, { method: "DELETE" });
    return { ok: true };
  });
