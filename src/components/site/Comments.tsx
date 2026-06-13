import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";

type Comment = {
  id: string;
  user_id: string;
  body: string;
  status: string;
  created_at: string;
  profiles?: { display_name: string | null; avatar_url: string | null } | null;
};

export function CommentsSection({ articleId }: { articleId: string }) {
  const { t } = useLang();
  const [user, setUser] = useState<User | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("comments")
      .select("id,user_id,body,status,created_at,profiles(display_name,avatar_url)")
      .eq("article_id", articleId)
      .eq("status", "visible")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setComments((data as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !body.trim()) return;
    setPosting(true);
    const { error } = await supabase.from("comments").insert({
      article_id: articleId,
      user_id: user.id,
      body: body.trim(),
    });
    setPosting(false);
    if (error) return toast.error(error.message);
    setBody("");
    toast.success(t("已发表评论", "Comment posted"));
    load();
  };

  const remove = async (id: string) => {
    if (!confirm(t("删除这条评论？", "Delete this comment?"))) return;
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <section className="mt-16 border-t border-border pt-10">
      <h2 className="serif text-2xl">{t("评论", "Comments")} <span className="text-stone-warm text-base">({comments.length})</span></h2>

      <div className="mt-6">
        {user ? (
          <form onSubmit={submit} className="space-y-3">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={4000}
              required
              rows={4}
              placeholder={t("分享你的想法……", "Share your thoughts…")}
              className="w-full bg-background border border-input px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-accent text-sm"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <button disabled={posting || !body.trim()} className="bg-accent text-accent-foreground px-5 py-2 text-sm uppercase tracking-widest disabled:opacity-50">
                {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("发表", "Post")}
              </button>
            </div>
          </form>
        ) : (
          <div className="border border-border bg-secondary/40 p-6 text-center">
            <p className="text-sm text-muted-foreground">{t("登录后即可发表评论。", "Sign in to leave a comment.")}</p>
            <Link
              to="/auth"
              search={{ next: typeof window !== "undefined" ? window.location.pathname : "/" }}
              className="inline-block mt-3 bg-accent text-accent-foreground px-5 py-2 text-sm uppercase tracking-widest"
            >
              {t("登录 / 注册", "Sign in")}
            </Link>
          </div>
        )}
      </div>

      <ul className="mt-10 space-y-6">
        {loading && <li className="text-sm text-muted-foreground">Loading…</li>}
        {!loading && comments.length === 0 && (
          <li className="text-sm text-muted-foreground">{t("还没有评论。来做第一个发声的人吧。", "No comments yet — be the first.")}</li>
        )}
        {comments.map((c) => {
          const name = c.profiles?.display_name || t("读者", "Reader");
          const mine = user?.id === c.user_id;
          return (
            <li key={c.id} className="border-b border-border pb-6 last:border-0">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-accent/10 grid place-items-center text-xs serif text-accent">
                  {name.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="serif text-sm">{name}</p>
                  <p className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString()}</p>
                </div>
                {mine && (
                  <button onClick={() => remove(c.id)} className="text-stone-warm hover:text-destructive" aria-label="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-foreground/85">{c.body}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
