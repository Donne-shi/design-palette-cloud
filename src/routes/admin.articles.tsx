import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Eye, EyeOff, Search, ChevronLeft, ChevronRight, RefreshCw, Languages, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { FileUpload } from "@/components/admin/FileUpload";
import { slugify } from "@/lib/slug";
import { translateEnglishToZhEs } from "@/lib/auto-translate";

export const Route = createFileRoute("/admin/articles")({ component: ArticlesAdmin });

type Article = {
  id: string;
  category: string;
  slug: string | null;
  title_zh: string;
  title_en: string | null;
  title_es: string | null;
  excerpt_zh: string | null;
  excerpt_en: string | null;
  excerpt_es: string | null;
  body_zh: string | null;
  body_en: string | null;
  body_es: string | null;
  cover_url: string | null;
  status: string;
  published_at: string | null;
  created_at: string;
};

const CATEGORIES = ["news", "theology", "cultural-exchange", "faith-public", "resources"];
const PAGE_SIZE = 15;
const empty: Partial<Article> = { category: "news", title_zh: "", title_en: "", title_es: "", excerpt_zh: "", excerpt_en: "", excerpt_es: "", body_zh: "", body_en: "", body_es: "", cover_url: "", status: "draft", slug: "" };

function ArticlesAdmin() {
  const [rows, setRows] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Article> | null>(null);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);

  const autoTranslate = async () => {
    if (!editing) return;
    const title = (editing.title_en || "").trim();
    if (!title) { toast.error("请先填写 English Title"); return; }
    setTranslating(true);
    try {
      const { zh, es } = await translateEnglishToZhEs([
        editing.title_en || "",
        editing.excerpt_en || "",
        editing.body_en || "",
      ]);
      setEditing({
        ...editing,
        title_zh: editing.title_zh || zh[0],
        title_es: editing.title_es || es[0],
        excerpt_zh: editing.excerpt_zh || zh[1],
        excerpt_es: editing.excerpt_es || es[1],
        body_zh: editing.body_zh || zh[2],
        body_es: editing.body_es || es[2],
      });
      toast.success("已生成中文与西班牙语翻译，请审阅后保存");
    } catch (e: any) {
      toast.error(e?.message || "翻译失败");
    } finally {
      setTranslating(false);
    }
  };

  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(0);

  const load = async () => {
    setLoading(true);
    let query = supabase.from("articles").select("*", { count: "exact" }).order("created_at", { ascending: false });
    if (category !== "all") query = query.eq("category", category);
    if (status !== "all") query = query.eq("status", status);
    if (q.trim()) {
      const term = `%${q.trim()}%`;
      query = query.or(`title_zh.ilike.${term},title_en.ilike.${term},slug.ilike.${term}`);
    }
    query = query.range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
    const { data, count, error } = await query;
    if (error) toast.error(error.message);
    else { setRows((data as Article[]) || []); setTotal(count ?? 0); }
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [category, status, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const save = async () => {
    if (!editing?.title_zh) { toast.error("中文标题必填"); return; }
    setSaving(true);
    const payload: any = { ...editing };
    if (!payload.slug && payload.title_en) payload.slug = slugify(payload.title_en);
    if (!payload.slug && payload.title_zh) payload.slug = slugify(payload.title_zh);
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

  const onSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(0); load(); };

  return (
    <div className="p-10">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="eyebrow mb-2">Admin</p>
          <h1 className="serif text-4xl">文章管理 · Articles</h1>
          <p className="text-muted-foreground mt-2 text-sm">新闻、神学、文化交流等所有图文内容。</p>
        </div>
        <Button onClick={() => setEditing(empty)} className="gap-2"><Plus className="h-4 w-4"/>新建文章</Button>
      </div>

      {/* Filters */}
      <form onSubmit={onSearch} className="mt-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
          <Input className="pl-9" placeholder="搜索标题或 slug…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={category} onValueChange={(v) => { setCategory(v); setPage(0); }}>
          <SelectTrigger className="w-44"><SelectValue/></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部分类</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(0); }}>
          <SelectTrigger className="w-36"><SelectValue/></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="draft">草稿</SelectItem>
            <SelectItem value="published">已发布</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" variant="outline" className="gap-2"><Search className="h-4 w-4"/>搜索</Button>
        <Button type="button" variant="ghost" onClick={() => { setQ(""); setCategory("all"); setStatus("all"); setPage(0); load(); }} className="gap-2">
          <RefreshCw className="h-4 w-4"/>重置
        </Button>
      </form>

      <div className="mt-6 border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-widest text-stone-warm border-b border-border">
            <tr><th className="p-4">标题</th><th className="p-4">分类</th><th className="p-4">状态</th><th className="p-4">更新</th><th className="p-4 w-40">操作</th></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">加载中…</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">没有匹配的文章。</td></tr>}
            {rows.map(a => (
              <tr key={a.id} className="border-b border-border last:border-0">
                <td className="p-4">
                  <p className="serif">{a.title_zh}</p>
                  {a.title_en && <p className="text-xs text-muted-foreground mt-1">{a.title_en}</p>}
                  {a.slug && <p className="text-[10px] text-muted-foreground mt-1 font-mono">/{a.slug}</p>}
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

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <p>共 {total} 条 · 第 {page + 1} / {totalPages} 页</p>
        <div className="flex gap-1">
          <Button size="icon" variant="outline" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}><ChevronLeft className="h-4 w-4"/></Button>
          <Button size="icon" variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4"/></Button>
        </div>
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
              <div className="flex items-center justify-between gap-3 p-3 rounded border border-dashed border-accent/40 bg-accent/5">
                <div className="text-xs text-muted-foreground">
                  填写英文后点击右侧按钮，自动生成 <span className="font-semibold text-foreground">中文</span> 与 <span className="font-semibold text-foreground">Español</span>（已有内容不会被覆盖）。
                </div>
                <Button type="button" size="sm" variant="outline" className="gap-2 shrink-0" disabled={translating} onClick={autoTranslate}>
                  {translating ? <Loader2 className="h-4 w-4 animate-spin"/> : <Languages className="h-4 w-4"/>}
                  Auto-translate
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>English Title</Label>
                  <Input value={editing.title_en || ""} onChange={(e) => setEditing({ ...editing, title_en: e.target.value, slug: editing.slug || slugify(e.target.value) })}/>
                </div>
                <div>
                  <Label>中文标题 *</Label>
                  <Input value={editing.title_zh || ""} onChange={(e) => setEditing({ ...editing, title_zh: e.target.value })}/>
                </div>
                <div>
                  <Label>Título (Español)</Label>
                  <Input value={editing.title_es || ""} onChange={(e) => setEditing({ ...editing, title_es: e.target.value })}/>
                </div>
              </div>
              <div>
                <Label>Slug（URL 路径，留空将自动生成）</Label>
                <Input value={editing.slug || ""} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} placeholder="my-article-title" className="font-mono"/>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>English Excerpt</Label><Textarea rows={2} value={editing.excerpt_en || ""} onChange={(e) => setEditing({ ...editing, excerpt_en: e.target.value })}/></div>
                <div><Label>中文摘要</Label><Textarea rows={2} value={editing.excerpt_zh || ""} onChange={(e) => setEditing({ ...editing, excerpt_zh: e.target.value })}/></div>
                <div><Label>Resumen (Español)</Label><Textarea rows={2} value={editing.excerpt_es || ""} onChange={(e) => setEditing({ ...editing, excerpt_es: e.target.value })}/></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>English Body (Markdown)</Label><Textarea rows={12} value={editing.body_en || ""} onChange={(e) => setEditing({ ...editing, body_en: e.target.value })}/></div>
                <div><Label>中文正文（Markdown）</Label><Textarea rows={12} value={editing.body_zh || ""} onChange={(e) => setEditing({ ...editing, body_zh: e.target.value })}/></div>
                <div><Label>Cuerpo (Español, Markdown)</Label><Textarea rows={12} value={editing.body_es || ""} onChange={(e) => setEditing({ ...editing, body_es: e.target.value })}/></div>
              </div>
              <div>
                <Label>封面图</Label>
                <FileUpload value={editing.cover_url} onChange={(url) => setEditing({ ...editing, cover_url: url })} folder="articles" accept="image/*"/>
              </div>
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
