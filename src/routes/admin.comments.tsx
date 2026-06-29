import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/comments")({ component: AdminComments });

type Row = {
  id: string;
  body: string;
  status: string;
  created_at: string;
  user_id: string;
  article_id: string;
  articles?: { title_zh: string; slug: string | null } | null;
  profiles?: { display_name: string | null } | null;
};

function AdminComments() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "visible" | "hidden" | "pending">("all");

  const load = async () => {
    setLoading(true);
    let q = supabase
      .from("comments")
      .select("id,body,status,created_at,user_id,article_id,articles(title_zh,slug)")
      .order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data, error } = await q;
    if (error) toast.error(error.message);
    setRows((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter]);

  const toggle = async (r: Row) => {
    const next = r.status === "visible" ? "hidden" : "visible";
    const { error } = await supabase.from("comments").update({ status: next }).eq("id", r.id);
    if (error) return toast.error(error.message);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("删除这条评论？")) return;
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="p-10">
      <p className="eyebrow mb-2">Admin</p>
      <h1 className="serif text-4xl">评论审核 · Comments</h1>
      <p className="mt-2 text-muted-foreground">管理读者评论，隐藏不当内容。</p>

      <div className="mt-6 flex gap-2 text-xs uppercase tracking-widest">
        {(["all","visible","hidden","pending"] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 border ${filter===s?"bg-foreground text-background border-foreground":"border-border hover:border-accent"}`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-8 text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/>Loading…</p>
      ) : rows.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">暂无评论。</p>
      ) : (
        <div className="mt-8 space-y-4">
          {rows.map(r => (
            <div key={r.id} className="border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">
                    {r.profiles?.display_name || "读者"} · {new Date(r.created_at).toLocaleString()}
                    <span className={`ml-2 uppercase tracking-widest ${r.status==='visible'?'text-accent':'text-stone-warm'}`}>{r.status}</span>
                  </p>
                  {r.articles && (
                    <p className="text-xs text-stone-warm mt-1 truncate">→ {r.articles.title_zh}</p>
                  )}
                  <p className="serif mt-3 whitespace-pre-wrap text-foreground/90">{r.body}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => toggle(r)} title={r.status==='visible'?'隐藏':'显示'}>
                    {r.status === "visible" ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(r.id)}>
                    <Trash2 className="h-4 w-4 text-destructive"/>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
