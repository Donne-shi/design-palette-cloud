import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { useLang } from "@/lib/i18n";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";

const NEXT_KEY = "mbi-auth-next";

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

  const oauth = async (provider: "google" | "apple") => {
    try { sessionStorage.setItem(NEXT_KEY, dest); } catch {}
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin,
    });
    if (result.error) return toast.error(result.error.message || String(result.error));
    if (result.redirected) return;
    // Popup flow: session set in this tab — go to intended destination.
    window.location.replace(dest);
  };

  return (
    <div className="min-h-screen grid place-items-center bg-secondary/40 px-4 paper-grain">
      <div className="w-full max-w-md bg-card border border-border p-8">
        <p className="eyebrow mb-2">MBI</p>
        <h1 className="serif text-3xl">{mode === "signin" ? t("登录", "Sign in") : t("创建账号", "Create account")}</h1>
        <p className="text-sm text-muted-foreground mt-2">
          {t("登录后即可评论文章、报名活动。", "Sign in to comment on articles and register for events.")}
        </p>

        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={() => oauth("google")}
            className="w-full border border-border bg-background py-3 text-sm tracking-wide flex items-center justify-center gap-3 hover:bg-secondary/40"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16.1 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.5 26.7 36.5 24 36.5c-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.2 5.2C40 35.2 44 30 44 24c0-1.3-.1-2.3-.4-3.5z"/>
            </svg>
            {t("使用 Google 继续", "Continue with Google")}
          </button>
          <button
            type="button"
            onClick={() => oauth("apple")}
            className="w-full border border-border bg-foreground text-background py-3 text-sm tracking-wide flex items-center justify-center gap-3 hover:opacity-90"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M16.365 1.43c0 1.14-.42 2.22-1.18 3.04-.82.88-2.16 1.56-3.27 1.47-.13-1.1.41-2.27 1.18-3.06.83-.86 2.27-1.49 3.27-1.45zM20.5 17.27c-.55 1.27-.82 1.84-1.53 2.96-.99 1.56-2.4 3.5-4.13 3.52-1.54.02-1.94-1-4.03-.99-2.09.01-2.53 1.01-4.07.99-1.74-.02-3.07-1.78-4.06-3.34C.05 16.96-.27 11.6 2.43 8.86c1.18-1.21 3.04-1.97 4.81-1.97 1.84 0 3 .99 4.52.99 1.47 0 2.37-1 4.5-1 1.6 0 3.3.87 4.51 2.38-3.96 2.17-3.32 7.83.73 8.01z"/>
            </svg>
            {t("使用 Apple 继续", "Continue with Apple")}
          </button>
        </div>

        <div className="flex items-center gap-3 my-6 text-xs uppercase tracking-widest text-stone-warm">
          <span className="flex-1 h-px bg-border" />
          {t("或", "or")}
          <span className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-4">
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
