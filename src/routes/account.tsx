import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLang } from "@/lib/i18n";
import { z } from "zod";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "我的账号 · Account — MBI" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AccountPage,
});

const profileSchema = z.object({
  display_name: z.string().trim().max(80, "Display name too long").optional().or(z.literal("")),
  bio: z.string().trim().max(500, "Bio too long").optional().or(z.literal("")),
  avatar_url: z
    .string()
    .trim()
    .max(500)
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
});

function AccountPage() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      if (!data.session) {
        navigate({ to: "/auth", search: { next: "/account" } });
        return;
      }
      setUser(data.session.user);
      const { data: prof } = await supabase
        .from("profiles")
        .select("display_name,bio,avatar_url")
        .eq("id", data.session.user.id)
        .maybeSingle();
      if (prof) {
        setDisplayName(prof.display_name ?? "");
        setBio(prof.bio ?? "");
        setAvatarUrl(prof.avatar_url ?? "");
      }
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!s) navigate({ to: "/auth", search: { next: "/account" } });
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = profileSchema.safeParse({ display_name: displayName, bio, avatar_url: avatarUrl });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSaving(true);
    const payload = {
      id: user.id,
      display_name: parsed.data.display_name || null,
      bio: parsed.data.bio || null,
      avatar_url: parsed.data.avatar_url || null,
    };
    const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success(t("已保存", "Saved"));
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error(t("密码至少 6 位", "Password must be at least 6 characters"));
      return;
    }
    setPwSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success(t("密码已更新", "Password updated"));
      setNewPassword("");
    }
  };

  if (loading) {
    return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <>
      <Header />
      <main className="container-prose py-12 lg:py-16 max-w-2xl">
        <p className="eyebrow mb-2">MBI</p>
        <h1 className="serif text-3xl lg:text-4xl">{t("我的账号", "Your account")}</h1>
        <p className="text-sm text-muted-foreground mt-2">{user?.email}</p>

        <form onSubmit={saveProfile} className="mt-10 space-y-5 border border-border bg-card p-6">
          <h2 className="serif text-xl">{t("个人资料", "Profile")}</h2>
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-stone-warm">{t("显示名称", "Display name")}</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={80}
              className="mt-2 w-full bg-background border border-input px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-stone-warm">{t("个人简介", "Bio")}</span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              rows={4}
              className="mt-2 w-full bg-background border border-input px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <span className="block mt-1 text-[11px] text-muted-foreground">{bio.length}/500</span>
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-stone-warm">{t("头像链接", "Avatar URL")}</span>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://…"
              className="mt-2 w-full bg-background border border-input px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </label>
          <button
            disabled={saving}
            className="bg-accent text-accent-foreground py-2.5 px-6 text-sm tracking-widest uppercase disabled:opacity-60"
          >
            {saving ? "…" : t("保存", "Save")}
          </button>
        </form>

        <form onSubmit={changePassword} className="mt-8 space-y-5 border border-border bg-card p-6">
          <h2 className="serif text-xl">{t("修改密码", "Change password")}</h2>
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-stone-warm">{t("新密码", "New password")}</span>
            <input
              type="password"
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-2 w-full bg-background border border-input px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </label>
          <button
            disabled={pwSaving || !newPassword}
            className="bg-foreground text-background py-2.5 px-6 text-sm tracking-widest uppercase disabled:opacity-60"
          >
            {pwSaving ? "…" : t("更新密码", "Update password")}
          </button>
          <p className="text-xs text-muted-foreground">
            <Link to="/forgot-password" className="link-underline">
              {t("忘记当前密码？", "Forgot current password?")}
            </Link>
          </p>
        </form>
      </main>
      <Footer />
    </>
  );
}
