import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password · MBI" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Supabase redirects with #access_token=...&type=recovery — the client
    // picks this up automatically and fires PASSWORD_RECOVERY.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error(t("密码至少 6 位", "Password must be at least 6 characters"));
      return;
    }
    if (password !== confirm) {
      toast.error(t("两次密码不一致", "Passwords do not match"));
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t("密码已重置", "Password reset"));
    navigate({ to: "/account" });
  };

  return (
    <div className="min-h-screen grid place-items-center bg-secondary/40 px-4 paper-grain">
      <div className="w-full max-w-md bg-card border border-border p-8">
        <p className="eyebrow mb-2">MBI</p>
        <h1 className="serif text-3xl">{t("设置新密码", "Set a new password")}</h1>
        {!ready ? (
          <p className="mt-6 text-sm text-muted-foreground">
            {t(
              "正在验证重置链接…如果链接无效或已过期，请重新申请。",
              "Verifying reset link… If it is invalid or expired, request a new one.",
            )}
          </p>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-4">
            <label className="block">
              <span className="text-xs uppercase tracking-widest text-stone-warm">{t("新密码", "New password")}</span>
              <input
                required
                type="password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full bg-background border border-input px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-widest text-stone-warm">{t("确认密码", "Confirm password")}</span>
              <input
                required
                type="password"
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-2 w-full bg-background border border-input px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </label>
            <button
              disabled={loading}
              className="w-full bg-accent text-accent-foreground py-3 text-sm tracking-widest uppercase disabled:opacity-60"
            >
              {loading ? "…" : t("重置密码", "Reset password")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
