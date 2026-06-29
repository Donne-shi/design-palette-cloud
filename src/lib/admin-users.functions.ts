import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin only");
}

export const listUsersWithRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: roles, error: rErr } = await supabaseAdmin
      .from("user_roles")
      .select("id,user_id,role,created_at")
      .order("created_at", { ascending: false });
    if (rErr) throw new Error(rErr.message);

    const { data: usersResp, error: uErr } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (uErr) throw new Error(uErr.message);

    const emailMap = new Map<string, string>();
    for (const u of usersResp.users) if (u.email) emailMap.set(u.id, u.email);

    return (roles || []).map((r: any) => ({ ...r, email: emailMap.get(r.user_id) ?? null }));
  });

export const grantRoleByEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { email: string; role: "admin" | "editor" | "author" | "reviewer" }) => {
    if (!d?.email || !d?.role) throw new Error("email 和 role 必填");
    return { email: d.email.trim().toLowerCase(), role: d.role };
  })
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Find user by email by paging through listUsers (Supabase has no direct getByEmail)
    let userId: string | null = null;
    for (let page = 1; page <= 10 && !userId; page++) {
      const { data: resp, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw new Error(error.message);
      const hit = resp.users.find((u) => (u.email || "").toLowerCase() === data.email);
      if (hit) userId = hit.id;
      if (resp.users.length < 200) break;
    }
    if (!userId) throw new Error(`未找到邮箱为 ${data.email} 的用户，请先让对方在 /auth 注册`);

    const { error: insErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: data.role });
    if (insErr && !/duplicate|unique/i.test(insErr.message)) throw new Error(insErr.message);

    return { ok: true, user_id: userId };
  });
