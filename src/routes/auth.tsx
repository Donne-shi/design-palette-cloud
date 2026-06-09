import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "登录 · Sign In — MBI Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) return toast.error(error.message);
      navigate({ to: "/admin" });
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      setLoading(false);
      if (error) return toast.error(error.message);
      toast.success(t("账号已创建。请联系超级管理员授予角色。", "Account created. Ask the super-admin to grant your role."));
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-secondary/40 px-4 paper-grain">
      <div className="w-full max-w-md bg-card border border-border p-8">
        <p className="eyebrow mb-2">MBI Admin</p>
        <h1 className="serif text-3xl">{mode === "signin" ? t("登录后台", "Sign in") : t("创建账号", "Create account")}</h1>
        <p className="text-sm text-muted-foreground mt-2">
          {t("仅供编辑、作者、审稿人与管理员使用。","For editors, authors, reviewers, and admins only.")}
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
