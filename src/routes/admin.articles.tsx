import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/articles")({ component: ArticlesAdmin });

type Article = {
  id: string;
  category: string;
  slug: string | null;
  title_zh: string;
  title_en: string | null;
  excerpt_zh: string | null;
  excerpt_en: string | null;
  body_zh: string | null;
  body_en: string | null;
  cover_url: string | null;
  status: string;
  published_at: string | null;
  created_at: string;
};

const CATEGORIES = ["news", "theology", "cultural-exchange", "faith-public", "resources"];
const empty: Partial<Article> = { category: "news", title_zh: "", title_en: "", excerpt_zh: "", excerpt_en: "", body_zh: "", body_en: "", cover_url: "", status: "draft" };

function ArticlesAdmin() {
  const [rows, setRows] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Article> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("articles").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setRows((data as Article[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing?.title_zh) { toast.error("中文标题必填"); return; }
    setSaving(true);
    const payload: any = { ...editing };
    if (payload.status === "published" && !payload.published_at) payload.published_at = new Date().toISOString();
    const { error } = editing.id
      ? await supabase.from("articles").update(payload).eq("id", editing.id)
      : await supabase.from("articles").insert(payload);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("已保存"); setEditing(null); load(); }
  };

  const toggleStatus = async (a: Article) => {
    const next = a.status === "published" ? "draft" : "published";
    const { error } = await supabase.from("articles").update({ status: next, published_at: next === "published" ? new Date().toISOString() : null }).eq("id", a.id);
    if (error) toast.error(error.message); else { toast.success(next === "published" ? "已发布" : "已下架"); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("确定删除？")) return;
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("已删除"); load(); }
  };

  return (
    <div className="p-10">
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow mb-2">Admin</p>
          <h1 className="serif text-4xl">文章管理 · Articles</h1>
          <p className="text-muted-foreground mt-2 text-sm">新闻、神学、文化交流等所有图文内容。</p>
        </div>
        <Button onClick={() => setEditing(empty)} className="gap-2"><Plus className="h-4 w-4"/>新建文章</Button>
      </div>

      <div className="mt-8 border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-widest text-stone-warm border-b border-border">
            <tr><th className="p-4">标题</th><th className="p-4">分类</th><th className="p-4">状态</th><th className="p-4">更新</th><th className="p-4 w-40">操作</th></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">加载中…</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">还没有文章，点击右上角新建。</td></tr>}
            {rows.map(a => (
              <tr key={a.id} className="border-b border-border last:border-0">
                <td className="p-4">
                  <p className="serif">{a.title_zh}</p>
                  {a.title_en && <p className="text-xs text-muted-foreground mt-1">{a.title_en}</p>}
                </td>
                <td className="p-4 text-xs uppercase tracking-widest text-stone-warm">{a.category}</td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded ${a.status === "published" ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"}`}>
                    {a.status === "published" ? "已发布" : "草稿"}
                  </span>
                </td>
                <td className="p-4 text-muted-foreground text-xs">{new Date(a.created_at).toLocaleDateString()}</td>
                <td className="p-4">
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => toggleStatus(a)} title={a.status === "published" ? "下架" : "发布"}>
                      {a.status === "published" ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setEditing(a)}><Pencil className="h-4 w-4"/></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(a.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="serif text-2xl">{editing?.id ? "编辑文章" : "新建文章"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>分类 Category</Label>
                  <Select value={editing.category} onValueChange={(v) => setEditing({ ...editing, category: v })}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>状态 Status</Label>
                  <Select value={editing.status} onValueChange={(v) => setEditing({ ...editing, status: v })}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">草稿 Draft</SelectItem>
                      <SelectItem value="published">已发布 Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>中文标题 *</Label><Input value={editing.title_zh || ""} onChange={(e) => setEditing({ ...editing, title_zh: e.target.value })}/></div>
                <div><Label>English Title</Label><Input value={editing.title_en || ""} onChange={(e) => setEditing({ ...editing, title_en: e.target.value })}/></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>中文摘要</Label><Textarea rows={2} value={editing.excerpt_zh || ""} onChange={(e) => setEditing({ ...editing, excerpt_zh: e.target.value })}/></div>
                <div><Label>English Excerpt</Label><Textarea rows={2} value={editing.excerpt_en || ""} onChange={(e) => setEditing({ ...editing, excerpt_en: e.target.value })}/></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>中文正文</Label><Textarea rows={8} value={editing.body_zh || ""} onChange={(e) => setEditing({ ...editing, body_zh: e.target.value })}/></div>
                <div><Label>English Body</Label><Textarea rows={8} value={editing.body_en || ""} onChange={(e) => setEditing({ ...editing, body_en: e.target.value })}/></div>
              </div>
              <div><Label>封面图 URL</Label><Input value={editing.cover_url || ""} onChange={(e) => setEditing({ ...editing, cover_url: e.target.value })} placeholder="https://..."/></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>取消</Button>
            <Button onClick={save} disabled={saving}>{saving ? "保存中…" : "保存"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
