import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLang } from "@/lib/i18n";
import { z } from "zod";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password · MBI" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ForgotPasswordPage,
});

const emailSchema = z.string().trim().email("Invalid email").max(255);

function ForgotPasswordPage() {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid email");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success(t("重置邮件已发送", "Reset email sent"));
  };

  return (
    <div className="min-h-screen grid place-items-center bg-secondary/40 px-4 paper-grain">
      <div className="w-full max-w-md bg-card border border-border p-8">
        <p className="eyebrow mb-2">MBI</p>
        <h1 className="serif text-3xl">{t("找回密码", "Reset your password")}</h1>
        <p className="text-sm text-muted-foreground mt-2">
          {t(
            "输入你的邮箱地址，我们会发送密码重置链接。",
            "Enter your email and we'll send you a reset link.",
          )}
        </p>

        {sent ? (
          <div className="mt-8 space-y-4 text-sm">
            <p>{t("已发送邮件，请查看收件箱（包括垃圾邮件）。", "Email sent. Check your inbox (and spam folder).")}</p>
            <Link to="/auth" search={{ next: "" }} className="link-underline text-xs uppercase tracking-widest">
              {t("返回登录", "Back to sign in")}
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-4">
            <label className="block">
              <span className="text-xs uppercase tracking-widest text-stone-warm">Email</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full bg-background border border-input px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </label>
            <button
              disabled={loading}
              className="w-full bg-accent text-accent-foreground py-3 text-sm tracking-widest uppercase disabled:opacity-60"
            >
              {loading ? "…" : t("发送重置链接", "Send reset link")}
            </button>
            <Link
              to="/auth"
              search={{ next: "" }}
              className="block mt-4 text-xs uppercase tracking-widest text-stone-warm hover:text-accent"
            >
              {t("返回登录", "Back to sign in")}
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
