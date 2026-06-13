import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLang } from "@/lib/i18n";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";

const searchSchema = z.object({
  next: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/auth")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "登录 · Sign In — MBI" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const { t } = useLang();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const dest = next && next.startsWith("/") ? next : "/admin";

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.replace(dest);
    });
  }, [dest]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) return toast.error(error.message);
      window.location.replace(dest);
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}${dest}` },
      });
      setLoading(false);
      if (error) return toast.error(error.message);
      toast.success(t("账号已创建。请查收邮件验证后即可登录。", "Account created. Check your email to confirm."));
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-secondary/40 px-4 paper-grain">
      <div className="w-full max-w-md bg-card border border-border p-8">
        <p className="eyebrow mb-2">MBI</p>
        <h1 className="serif text-3xl">{mode === "signin" ? t("登录", "Sign in") : t("创建账号", "Create account")}</h1>
        <p className="text-sm text-muted-foreground mt-2">
          {t("登录后即可评论文章、报名活动。", "Sign in to comment on articles and register for events.")}
        </p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-stone-warm">Email</span>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full bg-background border border-input px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-accent" />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-stone-warm">{t("密码","Password")}</span>
            <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full bg-background border border-input px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-accent" />
          </label>
          <button disabled={loading} className="w-full bg-accent text-accent-foreground py-3 text-sm tracking-widest uppercase disabled:opacity-60">
            {loading ? "…" : mode === "signin" ? t("登录","Sign in") : t("注册","Sign up")}
          </button>
        </form>
        <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-6 text-xs uppercase tracking-widest text-stone-warm hover:text-accent">
          {mode === "signin" ? t("没有账号？创建一个","No account? Create one") : t("已有账号？登录","Have an account? Sign in")}
        </button>
      </div>
    </div>
  );
}
