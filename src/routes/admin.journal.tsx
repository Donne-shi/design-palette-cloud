import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/journal")({ component: JournalAdmin });

type Issue = {
  id: string; volume: number; issue_number: number;
  title_zh: string; title_en: string | null;
  summary_zh: string | null; summary_en: string | null;
  cover_url: string | null; pdf_url: string | null;
  published_at: string | null; status: string;
};
const empty: Partial<Issue> = { volume: 1, issue_number: 1, title_zh: "", title_en: "", summary_zh: "", summary_en: "", cover_url: "", pdf_url: "", status: "draft" };

function JournalAdmin() {
  const [rows, setRows] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Issue> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("journal_issues").select("*").order("volume", { ascending: false }).order("issue_number", { ascending: false });
    if (error) toast.error(error.message); else setRows((data as Issue[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing?.title_zh) { toast.error("标题必填"); return; }
    setSaving(true);
    const payload: any = { ...editing, volume: Number(editing.volume), issue_number: Number(editing.issue_number) };
    const { error } = editing.id
      ? await supabase.from("journal_issues").update(payload).eq("id", editing.id)
      : await supabase.from("journal_issues").insert(payload);
    setSaving(false);
    if (error) toast.error(error.message); else { toast.success("已保存"); setEditing(null); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("确定删除？")) return;
    const { error } = await supabase.from("journal_issues").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("已删除"); load(); }
  };

  return (
    <div className="p-10">
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow mb-2">Admin</p>
          <h1 className="serif text-4xl">期刊管理 · Journal</h1>
          <p className="text-muted-foreground mt-2 text-sm">每一期的卷号、目录摘要与 PDF 链接。</p>
        </div>
        <Button onClick={() => setEditing(empty)} className="gap-2"><Plus className="h-4 w-4"/>新建一期</Button>
      </div>

      <div className="mt-8 border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-widest text-stone-warm border-b border-border">
            <tr><th className="p-4">卷/期</th><th className="p-4">标题</th><th className="p-4">发布日期</th><th className="p-4">状态</th><th className="p-4 w-32">操作</th></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">加载中…</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">暂无期刊。</td></tr>}
            {rows.map(i => (
              <tr key={i.id} className="border-b border-border last:border-0">
                <td className="p-4 serif">Vol.{i.volume} · No.{i.issue_number}</td>
                <td className="p-4"><p className="serif">{i.title_zh}</p>{i.title_en && <p className="text-xs text-muted-foreground mt-1">{i.title_en}</p>}</td>
                <td className="p-4 text-muted-foreground text-xs">{i.published_at || "—"}</td>
                <td className="p-4"><span className={`text-xs px-2 py-1 rounded ${i.status === "published" ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"}`}>{i.status === "published" ? "已发布" : "草稿"}</span></td>
                <td className="p-4"><div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => setEditing(i)}><Pencil className="h-4 w-4"/></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(i.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="serif text-2xl">{editing?.id ? "编辑期刊" : "新建期刊"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid gap-4">
              <div className="grid grid-cols-3 gap-4">
                <div><Label>卷 Volume *</Label><Input type="number" value={editing.volume ?? ""} onChange={(e) => setEditing({ ...editing, volume: parseInt(e.target.value) || 0 })}/></div>
                <div><Label>期号 Issue *</Label><Input type="number" value={editing.issue_number ?? ""} onChange={(e) => setEditing({ ...editing, issue_number: parseInt(e.target.value) || 0 })}/></div>
                <div><Label>发布日期</Label><Input type="date" value={editing.published_at || ""} onChange={(e) => setEditing({ ...editing, published_at: e.target.value || null })}/></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>中文标题 *</Label><Input value={editing.title_zh || ""} onChange={(e) => setEditing({ ...editing, title_zh: e.target.value })}/></div>
                <div><Label>English Title</Label><Input value={editing.title_en || ""} onChange={(e) => setEditing({ ...editing, title_en: e.target.value })}/></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>中文摘要</Label><Textarea rows={4} value={editing.summary_zh || ""} onChange={(e) => setEditing({ ...editing, summary_zh: e.target.value })}/></div>
                <div><Label>English Summary</Label><Textarea rows={4} value={editing.summary_en || ""} onChange={(e) => setEditing({ ...editing, summary_en: e.target.value })}/></div>
              </div>
              <div><Label>封面图 URL</Label><Input value={editing.cover_url || ""} onChange={(e) => setEditing({ ...editing, cover_url: e.target.value })}/></div>
              <div><Label>PDF URL</Label><Input value={editing.pdf_url || ""} onChange={(e) => setEditing({ ...editing, pdf_url: e.target.value })}/></div>
              <div>
                <Label>状态</Label>
                <Select value={editing.status} onValueChange={(v) => setEditing({ ...editing, status: v })}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent><SelectItem value="draft">草稿</SelectItem><SelectItem value="published">已发布</SelectItem></SelectContent>
                </Select>
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
